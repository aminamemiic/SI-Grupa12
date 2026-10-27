import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { LocalDevelopmentAuth } from "../BLL/Services/LocalDevelopmentAuth";
import { AuthService } from "../BLL/Services/AuthService";

const origin = "http://localhost:4200";
const secret = "local-test-secret-with-at-least-32-characters";
const env = { NODE_ENV: "development", LOCAL_AUTH_ENABLED: "true", SESSION_SECRET: secret };

function createApp(enabled: boolean) {
  const app = express();
  const localAuth = LocalDevelopmentAuth.fromEnvironment(enabled ? env : {});
  const auth = new AuthService({
    jwtIssuer: "http://localhost:8080/realms/Grupa12SI",
    jwtAudience: "account",
    jwksUri: "http://localhost:8080/realms/Grupa12SI/protocol/openid-connect/certs",
    keycloakUrl: "http://localhost:8080",
    keycloakRealm: "Grupa12SI",
    keycloakClientId: "public",
    localAuth,
  }, () => {});
  localAuth?.registerEndpoints(app, origin);
  app.get("/admin", auth.requireRole("admin"), (req, res) => res.json({ ok: true }));
  return app;
}

test("local login is opt-in and refuses production or missing environment", () => {
  expect(LocalDevelopmentAuth.fromEnvironment({ NODE_ENV: "development" })).toBeUndefined();
  for (const nodeEnv of ["production", "test", undefined]) {
    expect(() => LocalDevelopmentAuth.fromEnvironment({ ...env, NODE_ENV: nodeEnv })).toThrow();
  }
  expect(() => LocalDevelopmentAuth.fromEnvironment({ ...env, SESSION_SECRET: "short" })).toThrow();
});

test("login requires the configured frontend origin", async () => {
  const app = createApp(true);
  await request(app).post("/auth/local-login").expect(403);
  await request(app).post("/auth/local-login").set("Origin", "https://other.example").expect(403);
});

test("local admin token grants admin access but anonymous and tampered requests fail", async () => {
  const app = createApp(true);
  const login = await request(app).post("/auth/local-login").set("Origin", origin).expect(200);
  expect(login.headers["cache-control"]).toBe("no-store");
  const token = login.body.accessToken;
  await request(app).get("/admin").expect(401);
  await request(app).get("/admin").set("Authorization", `Bearer ${token}`).expect(200);
  const [header, payload, signature] = token.split(".");
  const tamperedSignature = (signature[0] === "a" ? "b" : "a") + signature.slice(1);
  await request(app).get("/admin").set("Authorization", `Bearer ${header}.${payload}.${tamperedSignature}`).expect(401);
});

test("standard authentication never exposes local login or accepts a local token", async () => {
  const localApp = createApp(true);
  const { body } = await request(localApp).post("/auth/local-login").set("Origin", origin).expect(200);
  const standardApp = createApp(false);
  await request(standardApp).post("/auth/local-login").set("Origin", origin).expect(404);
  await request(standardApp).get("/admin").set("Authorization", `Bearer ${body.accessToken}`).expect(401);
});

test("expired tokens and tokens with a different issuer or audience are rejected", async () => {
  const app = createApp(true);
  for (const claims of [
    { iss: "companydashboard-local-development", aud: "companydashboard-local", exp: 1 },
    { iss: "other", aud: "companydashboard-local" },
    { iss: "companydashboard-local-development", aud: "other" },
  ]) {
    const token = jwt.sign({ ...claims, realm_access: { roles: ["admin"] } }, secret, { algorithm: "HS256" });
    await request(app).get("/admin").set("Authorization", `Bearer ${token}`).expect(401);
  }
});
