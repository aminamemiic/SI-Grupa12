# DEPLOYMENT PROCEDURA

> **Historijski dokument:** raniji javni deployment više nije aktivan. Za trenutno okruženje pogledajte [lokalno pokretanje](../lokalno-pokretanje.md).

**Grupa 12 — SI Projektni zadatak**  
**Verzija 1.0 | 2025**

## 1. Naziv aplikacije i arhitektura

**Naziv aplikacije:** Grupa12 SI Aplikacija

### Opis arhitekture
Sistem se sastoji od četiri servisa:

- **Frontend** — Angular SPA aplikacija (port 4200)
- **Backend** — Node.js/TypeScript REST API server (port 3000)
- **AI Service** — Python mikroservis (port 8000)
- **PostgreSQL 16** — baza podataka (port 5433)
- **Keycloak 26.6.1** — autentifikacija i autorizacija (port 8080)

Na Railway platformi deployani su backend, AI service, PostgreSQL i Keycloak.

---

## 2. Tehnologije

- Frontend: Angular (TypeScript)
- Backend: Node.js + TypeScript (Express.js)
- AI Service: Python
- PostgreSQL 16
- Keycloak 26.6.1
- Google Gemini (gemini-2.5-flash)
- Docker + Docker Compose
- Railway

---

## 3. Potrebni alati

- Docker Desktop v24+
- Docker Compose v2+
- Node.js v18+ (preporučeno v20 LTS)
- npm v9+
- Angular CLI
- Git

### Provjera verzija

```bash
docker --version
docker compose version
node --version
npm --version
```

---

## 4. Environment varijable

### `.env` primjer

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:VasaLozinka@localhost:5433/grupa12app
USE_DOCKER_DB=true
POSTGRES_PASSWORD=VasaLozinka

SESSION_SECRET=super_secret_local_key_change_in_production

FRONTEND_ORIGIN=http://localhost:4200

AI_SERVICE_URL=http://localhost:8000
GEMINI_API_KEY=vas_gemini_api_kljuc
GEMINI_MODEL=gemini-2.5-flash

KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=Grupa12SI
KEYCLOAK_CLIENT_ID=public

JWT_ISSUER=http://localhost:8080/realms/Grupa12SI
JWT_AUDIENCE=account
JWKS_URI=http://localhost:8080/realms/Grupa12SI/protocol/openid-connect/certs
```

---

## 5. Pokretanje PostgreSQL baze

### Samo baza

```bash
docker compose up postgres -d
docker compose ps
```

### Konekcija

```bash
psql -h localhost -p 5433 -U postgres -d grupa12app
```

---

## 6. Pokretanje backenda

### Lokalno

```bash
npm install
npx tsx app.ts
```

Backend:

```text
http://localhost:3000
```

### Docker

```bash
docker compose up backend -d
```

---

## 7. Pokretanje frontenda

```bash
cd frontend
npm install
npx ng serve --configuration development --port 4200
```

Frontend:

```text
http://localhost:4200
```

---

## 8. Pokretanje Keycloaka

```bash
docker compose up keycloak -d
```

Admin konzola:

```text
http://localhost:8080/admin
```

Korisničko ime: `admin`  
Lozinka: `admin`

---

## 9. Potpuno lokalno pokretanje

```bash
git clone <URL_REPOZITORIJA>
cd <naziv-projekta>

cp .env.example .env

docker compose up -d

docker compose ps

cd frontend
npm install
npx ng serve --configuration development --port 4200
```

### Status servisa

- PostgreSQL: http://localhost:5433
- Keycloak: http://localhost:8080
- Backend: http://localhost:3000
- AI Service: http://localhost:8000/health
- Frontend: http://localhost:4200

---

## 10. Migracije

### Produkcija

```bash
npx prisma migrate deploy
```

### Development

```bash
npx prisma migrate dev
```

### Prisma Studio

```bash
npx prisma studio
```

### Seed

```bash
npx prisma db seed
```

---

## 11. Testovi

```bash
npm test -- --coverage
```

Watch mode:

```bash
npm test -- --watch
```

---

## 12. Railway Deployment

### Deployani servisi

- PostgreSQL 16
- Keycloak 26.6.1
- Node.js Backend
- Angular Frontend

### Deploy procedura

1. Kreirati Railway projekt
2. Povezati GitHub repozitorij
3. Dodati PostgreSQL plugin
4. Podesiti environment varijable
5. Push na `main` granu automatski pokreće deployment

---

## 13. Linkovi

Frontend:
Raniji javni frontend više nije aktivan.

Backend:
https://si-grupa12-production-bdb1.up.railway.app

Keycloak:
https://keycloak-production-4c61.up.railway.app

Railway:
https://railway.app

---

## 14. Poznata ograničenja

- Keycloak koristi start-dev mod
- Railway free tier ima ograničenja
- PostgreSQL koristi port 5433 lokalno
- Frontend nije dio docker-compose konfiguracije
- Potreban je realm JSON za Keycloak
- SESSION_SECRET mora biti snažan u produkciji

---

## 15. Česti problemi

### PostgreSQL nije healthy

```bash
docker compose down -v
docker compose up postgres -d
```

### Backend se ne može spojiti na bazu

Provjeriti:

- DATABASE_URL
- status PostgreSQL servisa

### Realm nije importovan

Provjeriti:

- `./keycloak-config`
- realm JSON fajl

### CORS greška

Provjeriti:

```env
FRONTEND_ORIGIN=http://localhost:4200
```

### Testovi padaju

Pokrenuti bazu prije testiranja:

```bash
docker compose up postgres -d
```

### Frontend ne vidi backend

Provjeriti:

```bash
curl http://localhost:3000/health
```

---
