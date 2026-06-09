# 3. Continuous Deployment skripta / pipeline

## Pregled rješenja

Za implementaciju Continuous Deployment (CD) procesa koristi se kombinacija:

- GitHub Actions CI/CD workflow-a
- Railway GitHub integracije
- Railway hostinga za produkcijsko okruženje

GitHub Actions služi za automatsku validaciju aplikacije kroz build i testiranje, dok Railway automatski vrši deployment nakon svake promjene na glavnoj (`main`) grani repozitorija.

Ovakav pristup omogućava ponovljiv, automatizovan i provjerljiv deployment kompletnog sistema bez potrebe za dodatnim ručnim koracima.

## Lokacija skripte

GitHub Actions workflow nalazi se u repozitoriju na lokaciji:

```text
.github/workflows/ci-cd.yml
```

## Kako se pokreće

Pipeline se automatski pokreće prilikom:

- push-a na `main` granu
- kreiranja Pull Request-a prema `main` grani

Primjer:

```bash
git add .
git commit -m "Nova funkcionalnost"
git push origin main
```

Nakon push-a GitHub Actions izvršava build i testove, a Railway automatski deploya aplikaciju putem GitHub integracije.

## Preduvjeti

- GitHub repozitorij
- GitHub Actions
- Railway projekat
- PostgreSQL baza
- Node.js 20
- npm

## Korištene tehnologije

| Komponenta | Tehnologija |
|------------|-------------|
| Frontend | Angular |
| Backend | Node.js + TypeScript |
| AI servis | Python |
| Baza podataka | PostgreSQL |
| Autentifikacija | Keycloak |
| CI | GitHub Actions |
| CD | Railway GitHub Integration |
| Hosting | Railway |

## Environment varijable

### Backend

```env
DATABASE_URL=
NODE_ENV=
PORT=
SESSION_SECRET=
FRONTEND_ORIGIN=
AI_SERVICE_URL=
KEYCLOAK_URL=
KEYCLOAK_REALM=
KEYCLOAK_CLIENT_ID=
JWT_ISSUER=
JWT_AUDIENCE=
JWKS_URI=
GEMINI_API_KEY=
GEMINI_MODEL=
```

## GitHub Actions workflow

### Backend Build

```bash
cd PROJEKAT/BACKEND
npm install
npm run build
```

### Frontend Build

```bash
cd PROJEKAT/FRONTEND
npm install
npm run build -- --configuration=production
```

### Backend Testovi

```bash
cd PROJEKAT/BACKEND
npx jest --coverage
```

## Baza podataka i migracije

Projekt koristi PostgreSQL bazu podataka.

Migracije:

```bash
npx prisma migrate deploy
```

Development:

```bash
npx prisma migrate dev
```

Seed:

```bash
npx prisma db seed
```

## Deployment backend servisa

Backend servis hostovan je na Railway platformi.

Nakon svakog push-a na `main` granu:

1. GitHub Actions izvršava build i testove.
2. Railway GitHub integracija preuzima najnoviju verziju koda.
3. Railway pokreće deployment backend servisa.

Produkcijski backend:

https://si-grupa12-production-bdb1.up.railway.app

## Deployment frontend servisa

Frontend aplikacija koristi Railway GitHub integraciju.

Produkcijski frontend:

https://frontend-production-02b2.up.railway.app

## Deployment Keycloak servisa

Produkcijska instanca:

https://keycloak-production-4c61.up.railway.app

## Povezivanje servisa

```text
Frontend (Angular)
        |
        v
Backend API (Node.js)
        |
        +------ PostgreSQL
        |
        +------ Keycloak
        |
        +------ AI Service
```

## Railway GitHub integracija

Proces deploymenta:

```text
Developer
    |
    v
Git Push
    |
    v
GitHub Repository
    |
    v
GitHub Actions
(Build + Test)
    |
    v
Railway GitHub Integration
    |
    v
Automatic Deployment
```

## Provjera uspješnog deploymenta

Frontend:
https://frontend-production-02b2.up.railway.app

Backend:
https://si-grupa12-production-bdb1.up.railway.app

Keycloak:
https://keycloak-production-4c61.up.railway.app

Railway Dashboard:
https://railway.app

## Šta se deploya

- Backend aplikacija
- Frontend aplikacija
- PostgreSQL baza
- Keycloak servis
- AI mikroservis
- Environment konfiguracija

## Zaključak

Continuous Deployment proces implementiran je korištenjem GitHub Actions workflow-a i Railway GitHub integracije. GitHub Actions vrši validaciju kroz build i testove, dok Railway automatski deploya aplikaciju nakon promjena na `main` grani.
