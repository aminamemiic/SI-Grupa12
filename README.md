# CompanyDashboard · Tim12 Finansije

Web aplikacija za praćenje poslovnih troškova, planiranje budžeta i finansijsko izvještavanje. Podaci o troškovima, odjelima, kategorijama i dobavljačima objedinjeni su u jednom radnom prostoru, uz grafikone, poređenja i AI uvide.

## Mogućnosti

- **Finansijski pregled** — ključni pokazatelji, mjesečno kretanje i raspodjela troškova.
- **Upravljanje troškovima** — unos, uređivanje, brisanje, validacija i komentari.
- **Uvoz podataka** — CSV i Excel datoteke, pregled i validacija prije upisa.
- **Budžeti** — planiranje po odjelima i kategorijama, odobravanje i povrat na doradu.
- **Pregled i poređenje** — pretraga, filteri, sortiranje i poređenje planiranih i stvarnih iznosa.
- **Izvještaji** — sažeti i detaljni prikazi te izvoz u Excel, PDF i CSV.
- **AI uvidi i notifikacije** — sažeci, preporuke, provjere anomalija i prijedlozi kategorija.

## Tehnologije

| Dio sistema     | Tehnologije                                                        |
| --------------- | ------------------------------------------------------------------ |
| Frontend        | Angular 21, TypeScript, RxJS                                       |
| Backend         | Node.js, Express, TypeScript                                       |
| Baza podataka   | PostgreSQL 16                                                      |
| Autentifikacija | Keycloak, JWT i sesije; zasebna lokalna razvojna prijava           |
| AI servis       | Python 3.11, FastAPI; Google Gemini kada je konfigurisan API ključ |
| Testiranje      | Vitest / Angular TestBed, Jest / Supertest                         |
| Lokalni servisi | Docker Compose                                                     |

## Struktura repozitorija

```text
CompanyDashboard/
├── PROJEKAT/
│   ├── FRONTEND/                # Angular aplikacija
│   └── BACKEND/
│       ├── BLL/                 # Poslovna logika i servisi
│       ├── DAL/                 # Pristup bazi podataka
│       ├── PRESENTATION API/    # REST rute i middleware
│       ├── migrations/          # SQL migracije
│       ├── tests/               # Backend testovi
│       ├── ai-service/          # Python / FastAPI servis
│       ├── keycloak-config/     # Konfiguracija lokalnog Keycloaka
│       ├── docker-compose.yml
│       └── docker-compose.local.yml
├── dokumentacija/               # Upute, tehnička dokumentacija i sprintovi 1–11
├── .github/workflows/           # GitHub Actions provjere
├── start-local.ps1              # Lokalno pokretanje na Windowsu
└── README.md
```

## Lokalno pokretanje

### Preduslovi

- Node.js **22.12+ u grani 22** ili **24 LTS**, uz npm.
- Docker Desktop s pokrenutim Linux engineom i Docker Composeom koji podržava `!override`.
- Slobodni portovi `4200`, `3000`, `5433`, `8000` i `8080`.

Python i PostgreSQL nije potrebno zasebno instalirati kada se koriste Docker servisi.

### Brzi početak na Windowsu

Iz korijena repozitorija pokrenite u PowerShellu:

```powershell
.\start-local.ps1
```

Skripta provjerava Docker, kreira lokalni `PROJEKAT/BACKEND/.env` ako ne postoji, podiže servise, instalira frontend zavisnosti ako nedostaju i pokreće Angular. Prvo pokretanje može potrajati zbog preuzimanja slika i zavisnosti.

Otvorite **[http://localhost:4200/](http://localhost:4200/)** i kliknite **Prijavi se**. Lokalna konfiguracija prijavljuje korisnika `local-admin` bez lozinke. Ovaj način je omogućen samo za razvojno okruženje.

| Servis                  | Lokalna adresa                                        |
| ----------------------- | ----------------------------------------------------- |
| Aplikacija              | [localhost:4200](http://localhost:4200/)              |
| Backend provjera        | [localhost:3000/health](http://localhost:3000/health) |
| AI servis provjera      | [localhost:8000/health](http://localhost:8000/health) |
| Keycloak administracija | [localhost:8080/admin](http://localhost:8080/admin/)  |
| PostgreSQL              | `localhost:5433`, baza `grupa12app`                   |

Za ručno pokretanje, konfiguraciju prijave, Gemini ključ i rješavanje problema pogledajte [upute za lokalno pokretanje](dokumentacija/lokalno-pokretanje.md).

### Zaustavljanje

Frontend se zaustavlja s **Ctrl+C** u terminalu u kojem je pokrenut. Docker servise zaustavite iz korijena repozitorija:

```powershell
docker compose -f PROJEKAT/BACKEND/docker-compose.yml -f PROJEKAT/BACKEND/docker-compose.local.yml down
```

Ova naredba čuva podatke u Docker volumenima.

## Testovi i izgradnja

Naredbe pokrenite iz odgovarajućeg direktorija nakon instalacije zavisnosti s `npm.cmd ci`.

**Frontend** — `PROJEKAT/FRONTEND`:

```powershell
npm.cmd test -- --watch=false
npm.cmd run build
```

**Backend** — `PROJEKAT/BACKEND`:

```powershell
npm.cmd test
npm.cmd run build
```

Frontend `build` koristi produkcijsku konfiguraciju; za lokalni rad koristite `npm.cmd run dev`. Produkcijske adrese treba podesiti prije eventualne objave.

## Dokumentacija

Sva prateća dokumentacija nalazi se u folderu **[dokumentacija](dokumentacija/README.md)**:

- [Lokalno pokretanje i konfiguracija](dokumentacija/lokalno-pokretanje.md)
- [Frontend](dokumentacija/tehnicka/frontend.md)
- [AI servis](dokumentacija/tehnicka/ai-servis.md)
- [Arhitektura i tehnički pregled](dokumentacija/Sprint%2011/ArchitectureTechnicalOverview.md)
- [Korisničke upute iz završnog sprinta](dokumentacija/Sprint%2011/UserManual.md)
- [Sprintovi 1–11 i razvojna evidencija](dokumentacija/README.md#sprintovi)

Sprint dokumenti prikazuju stanje u trenutku nastanka i mogu sadržavati stariji izgled ili raniju konfiguraciju. Za trenutno lokalno okruženje koristite ovaj README i aktuelne upute iznad.
