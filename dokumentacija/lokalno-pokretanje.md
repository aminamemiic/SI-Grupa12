# Lokalno pokretanje i konfiguracija

[Pregled projekta](../README.md) · [Sadržaj dokumentacije](README.md)

## Pokretanje skriptom

Pokrenite Docker Desktop i sačekajte da Linux engine bude spreman. U PowerShell terminalu iz korijena repozitorija izvršite:

```powershell
.\start-local.ps1
```

Skripta koristi postojeće foldere `PROJEKAT/FRONTEND` i `PROJEKAT/BACKEND`. Podatke servisa čuva u Docker volumenima. Terminal ostaje zauzet Angular serverom; **Ctrl+C** zaustavlja frontend.

Aplikacija je dostupna na [localhost:4200](http://localhost:4200/).

## Ručno pokretanje

Sve putanje u ovoj uputi polaze od korijena repozitorija, ne od foldera `dokumentacija`.

### 1. Konfiguracija

Skripta automatski kreira `PROJEKAT/BACKEND/.env` ako ne postoji. Za ručno pokretanje kreirajte taj fajl sa sljedećim vrijednostima:

```dotenv
POSTGRES_PASSWORD=<lozinka_lokalne_baze>
SESSION_SECRET=<nasumicna_tajna_od_najmanje_32_znaka>
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

Vrijednosti u uglastim zagradama su mjesta za vlastitu lozinku i tajnu, ne doslovne vrijednosti. `.env` je ignorisan u Gitu.

Ako baza već postoji, koristite njenu postojeću lozinku. Promjena `POSTGRES_PASSWORD` u fajlu sama ne mijenja lozinku baze u postojećem volumenu. Sačuvajte postojeći `.env` između pokretanja.

### 2. Docker servisi

Iz korijena repozitorija:

```powershell
docker compose -f PROJEKAT/BACKEND/docker-compose.yml -f PROJEKAT/BACKEND/docker-compose.local.yml up -d --build
```

Uvijek navedite oba Compose fajla za lokalni rad. Lokalni override postavlja lokalne adrese Keycloaka, uključuje razvojnu prijavu i veže backend na `127.0.0.1:3000`.

Pokreću se PostgreSQL, Keycloak, Node.js backend i Python AI servis. Backend pri pokretanju provjerava i inicijalizuje šemu i osnovne podatke.

### 3. Frontend

U drugom terminalu:

```powershell
cd PROJEKAT/FRONTEND
npm.cmd ci
npm.cmd run dev
```

Frontend koristi razvojnu konfiguraciju i API na `http://localhost:3000/api`. Promjene izvornog koda automatski osvježavaju prikaz.

## Prijava

### Lokalna razvojna prijava

Na početnoj stranici kliknite **Prijavi se**. Ulazite kao `local-admin`, s administratorskim pristupom, bez unosa lozinke.

Za ovaj način potrebni su:

- backend: `NODE_ENV=development` i `LOCAL_AUTH_ENABLED=true`;
- `SESSION_SECRET` od najmanje 32 znaka;
- frontend: `localAuth: true` u razvojnoj konfiguraciji.

Ove vrijednosti su već podešene kroz lokalni Compose override i `environment.development.ts`. Backend odbija uključivanje ove prijave izvan razvojnog okruženja. Lokalni token traje jedan sat; po isteku ponovo se prijavite.

### Keycloak prijava

Za provjeru standardnog Keycloak toka postavite:

1. `LOCAL_AUTH_ENABLED: "false"` u `PROJEKAT/BACKEND/docker-compose.local.yml`.
2. `localAuth: false` u `PROJEKAT/FRONTEND/src/environments/environment.development.ts`.
3. Ponovo pokrenite Compose naredbu s `up -d --build`.

Administratorska konzola je [localhost:8080/admin](http://localhost:8080/admin/). Početne vrijednosti iz Compose konfiguracije su `admin` / `admin` u realm-u `master`; postojeća instalacija može imati drugu lozinku.

Aplikacija koristi zaseban realm **Grupa12SI**. Prijava za administratorsku konzolu nije automatski prijava za aplikaciju. Ako ne znate lozinku aplikacijskog korisnika, postavite je u konzoli kroz **Grupa12SI → Users → korisnik → Credentials**.

Uvoz realm-a izvršava se pri pokretanju; postojeći realm se ne prepisuje automatski izmjenom JSON fajla.

## Gemini

Za generativne Gemini funkcije unesite vlastiti ključ u `PROJEKAT/BACKEND/.env`:

```dotenv
GEMINI_API_KEY=<vas_api_kljuc>
GEMINI_MODEL=gemini-2.5-flash
```

Zatim ponovite Compose naredbu. Osnovni rad s troškovima i budžetima ne zahtijeva Gemini ključ. Dostupnost pojedinih AI odgovora zavisi od konfiguracije, servisa i podataka.

## Provjera rada

| Servis               | Provjera                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| Frontend             | [http://localhost:4200/](http://localhost:4200/)                            |
| Backend              | [http://localhost:3000/health](http://localhost:3000/health)                |
| AI servis            | [http://localhost:8000/health](http://localhost:8000/health)                |
| AI API dokumentacija | [http://localhost:8000/docs](http://localhost:8000/docs)                    |
| Keycloak             | [http://localhost:8080/admin/](http://localhost:8080/admin/)                |
| PostgreSQL           | `localhost:5433`, korisnik `postgres`, baza `grupa12app`, lozinka iz `.env` |

Status i logovi, iz korijena repozitorija:

```powershell
docker compose -f PROJEKAT/BACKEND/docker-compose.yml -f PROJEKAT/BACKEND/docker-compose.local.yml ps
docker compose -f PROJEKAT/BACKEND/docker-compose.yml -f PROJEKAT/BACKEND/docker-compose.local.yml logs --tail 100 backend ai-service keycloak
```

## Zaustavljanje

Za frontend pritisnite **Ctrl+C**. Za Docker servise:

```powershell
docker compose -f PROJEKAT/BACKEND/docker-compose.yml -f PROJEKAT/BACKEND/docker-compose.local.yml down
```

Bez opcije `-v` PostgreSQL i Keycloak podaci ostaju sačuvani u volumenima.

## Česti problemi

| Problem                                      | Šta provjeriti                                                        |
| -------------------------------------------- | --------------------------------------------------------------------- |
| Docker nije dostupan                         | Pokrenite Docker Desktop i provjerite `docker info`.                  |
| Compose ne prepoznaje `!override`            | Potrebna je verzija Composea koja podržava tu oznaku.                 |
| Port je zauzet                               | Zaustavite ranije pokrenutu instancu istog servisa.                   |
| Greška pri povezivanju na bazu               | Provjerite lozinku postojeće baze, `.env` i PostgreSQL logove.        |
| Lokalna prijava nije dostupna                | Koristite oba Compose fajla i provjerite razvojne auth postavke.      |
| Nakon promjene okruženja ostaje stara sesija | Odjavite se i ponovo prijavite.                                       |
| Backend ne vidi izmjene koda                 | Ponovo izvršite `up -d --build`; kod se kopira u sliku pri izgradnji. |
