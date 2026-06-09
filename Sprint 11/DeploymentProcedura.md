# DEPLOYMENT PROCEDURA


---

## 1. Naziv aplikacije i arhitektura

**Naziv aplikacije:** Grupa12 SI Aplikacija

### Opis arhitekture

Sistem se sastoji od pet servisa:

* **Frontend** — Angular SPA aplikacija (port `4200`)
* **Backend** — Node.js/TypeScript REST API server (port `3000`)
* **AI Service** — Python mikroservis (port `8000`)
* **PostgreSQL 16** — baza podataka (port `5433`)
* **Keycloak 26.6.1** — autentifikacija i autorizacija (port `8080`)

Na Railway platformi deployani su frontend, backend, AI service, PostgreSQL i Keycloak.

---

## 2. Tehnologije

* **Frontend:** Angular (TypeScript)
* **Backend:** Node.js + TypeScript (Express.js)
* **AI Service:** Python
* **Baza podataka:** PostgreSQL 16
* **Autentifikacija i autorizacija:** Keycloak 26.6.1
* **AI model:** Google Gemini (`gemini-2.5-flash`)
* **Kontejnerizacija:** Docker + Docker Compose
* **Deployment platforma:** Railway

---

## 3. Potrebni alati

Za lokalno pokretanje aplikacije potrebno je instalirati sljedeće alate:

* Docker Desktop v24+
* Docker Compose v2+
* Node.js v18+ (preporučeno v20 LTS)
* npm v9+
* Angular CLI
* Git

### Provjera verzija

```bash
docker --version
docker compose version
node --version
npm --version
```

---

## 4. Environment varijable

Potrebno je kreirati `.env` fajl u korijenskom direktoriju projekta.

### Primjer `.env` fajla

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

> **Napomena:** Vrijednosti poput `POSTGRES_PASSWORD`, `SESSION_SECRET` i `GEMINI_API_KEY` ne treba javno objavljivati niti commitati u repozitorij.

---

## 5. Pokretanje PostgreSQL baze

### Pokretanje samo baze podataka

```bash
docker compose up postgres -d
docker compose ps
```

### Konekcija na bazu

```bash
psql -h localhost -p 5433 -U postgres -d grupa12app
```

---

## 6. Pokretanje backenda

### Lokalno pokretanje

```bash
npm install
npx tsx app.ts
```

Backend je dostupan na adresi:

```text
http://localhost:3000
```

### Pokretanje pomoću Dockera

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

Frontend je dostupan na adresi:

```text
http://localhost:4200
```

---

## 8. Pokretanje Keycloaka

```bash
docker compose up keycloak -d
```

Keycloak administratorska konzola dostupna je na adresi:

```text
http://localhost:8080/admin
```

Podaci za lokalnu prijavu:

```text
Korisničko ime: admin
Lozinka: admin
```

> **Napomena:** Podaci `admin/admin` koriste se isključivo u lokalnom razvojnom okruženju. U produkciji je potrebno postaviti sigurnu lozinku.

---

## 9. Potpuno lokalno pokretanje aplikacije

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

| Servis     | Lokalna adresa                 |
| ---------- | ------------------------------ |
| PostgreSQL | `localhost:5433`               |
| Keycloak   | `http://localhost:8080`        |
| Backend    | `http://localhost:3000`        |
| AI Service | `http://localhost:8000/health` |
| Frontend   | `http://localhost:4200`        |

---

## 10. Migracije baze podataka

### Produkcijsko okruženje

```bash
npx prisma migrate deploy
```

### Development okruženje

```bash
npx prisma migrate dev
```

### Prisma Studio

```bash
npx prisma studio
```

### Seed podataka

```bash
npx prisma db seed
```

---

## 11. Pokretanje testova

```bash
npm test -- --coverage
```

### Watch mode

```bash
npm test -- --watch
```

---

## 12. Railway deployment

### Deployani servisi

Na Railway platformi deployani su sljedeći servisi:

* PostgreSQL 16
* Keycloak 26.6.1
* Node.js Backend
* Python AI Service
* Angular Frontend

### Deployment procedura

1. Kreirati Railway projekt.
2. Povezati GitHub repozitorij.
3. Dodati PostgreSQL plugin.
4. Podesiti potrebne environment varijable.
5. Deployati pojedinačne servise.
6. Push na `main` granu automatski pokreće novi deployment.

---

## 13. Linkovi

### Frontend

```text
https://frontend-production-02b2.up.railway.app
```

### Backend

```text
https://si-grupa12-production-bdb1.up.railway.app
```

### Keycloak

```text
https://keycloak-production-4c61.up.railway.app
```

### Railway platforma

```text
https://railway.app
```

---

## 14. Poznata ograničenja

* Keycloak koristi `start-dev` način rada.
* Railway free tier ima određena ograničenja.
* PostgreSQL lokalno koristi port `5433`.
* Frontend nije dio `docker-compose` konfiguracije.
* Za Keycloak je potreban realm JSON fajl.
* Vrijednost `SESSION_SECRET` mora biti snažna u produkcijskom okruženju.

---

## 15. Česti problemi

### PostgreSQL nije healthy

Ponovo kreirati volumen i pokrenuti bazu:

```bash
docker compose down -v
docker compose up postgres -d
```

### Backend se ne može spojiti na bazu

Provjeriti:

* vrijednost `DATABASE_URL`
* status PostgreSQL servisa

```bash
docker compose ps
```

### Realm nije importovan

Provjeriti:

* direktorij `./keycloak-config`
* postojanje realm JSON fajla

### CORS greška

Provjeriti vrijednost environment varijable:

```env
FRONTEND_ORIGIN=http://localhost:4200
```

### Testovi padaju

Pokrenuti bazu prije testiranja:

```bash
docker compose up postgres -d
```

### Frontend ne vidi backend

Provjeriti dostupnost backenda:

```bash
curl http://localhost:3000/health
```

---


