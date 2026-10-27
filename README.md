# CompanyDashboard

Objavljena aplikacija: https://frontend-production-02b2.up.railway.app/#/

## Lokalno pokretanje na Windowsu

Potrebni su Node.js 22.12+ (ili noviji podrzani LTS), npm i pokrenut Docker Desktop s Linux engineom.

Iz korijenskog direktorija projekta, u PowerShellu:

```powershell
.\start-local.ps1
```

Skripta kreira lokalni `PROJEKAT/BACKEND/.env` ako ne postoji, podize PostgreSQL,
Keycloak, backend i AI servis, instalira frontend zavisnosti ako nedostaju i pokrece
Angular razvojni server. Prvi build preuzima Docker slike i moze potrajati.

Adrese:

- Aplikacija: http://localhost:4200/
- Backend provjera: http://localhost:3000/health
- Keycloak administracija: http://localhost:8080/admin/ (pocetne vrijednosti iz Compose konfiguracije: `admin` / `admin`, realm `master`; postojeca instalacija moze imati drugu lozinku)
- AI servis provjera: http://localhost:8000/health
- PostgreSQL: `localhost:5433`, baza `grupa12app`, korisnik `postgres`; lozinka je u lokalnom `.env`.

Lokalna razvojna konfiguracija koristi prijavu bez Keycloaka: otvorite aplikaciju i
kliknite **Prijavi se**. Ulazite kao `local-admin`, bez unosa lozinke. Odjava takodjer
ostaje lokalna. Ovaj nacin radi samo uz `NODE_ENV=development` i
`LOCAL_AUTH_ENABLED=true`, a lokalni backend port je vezan za `127.0.0.1`.
Produkcijska konfiguracija nastavlja koristiti Keycloak.

Za vracanje lokalne Keycloak prijave postavite `LOCAL_AUTH_ENABLED` na `false` u
`docker-compose.local.yml` i `localAuth` na `false` u
`FRONTEND/src/environments/environment.development.ts`, pa ponovo pokrenite servise.

Keycloak automatski uvozi realm `Grupa12SI` i testne korisnike iz `keycloak-config`.
Lozinke uvozenih korisnika su hashirane; ako ih ne znate, postavite novu lozinku
u lokalnoj Keycloak administraciji, u realm-u `Grupa12SI` > Users > Credentials.
Korisnik `admin` u tom realm-u ima aplikacijsku administratorsku ulogu.

Gemini funkcije zahtijevaju vlastiti `GEMINI_API_KEY` u `PROJEKAT/BACKEND/.env`.
Nakon dodavanja kljuca ponovite Docker Compose naredbu ispod.

Ako frontend zavisnosti vec postoje, mozete ga zasebno pokrenuti:

```powershell
cd PROJEKAT/FRONTEND
npm.cmd run dev
```

Docker servisi se mogu zasebno pokrenuti ili zaustaviti iz `PROJEKAT/BACKEND`:

```powershell
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.local.yml down
```

`down` cuva podatke u Docker volumenima. Produkcijska Angular konfiguracija koristi Railway.
