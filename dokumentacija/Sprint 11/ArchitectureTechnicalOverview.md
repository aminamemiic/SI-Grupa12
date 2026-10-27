# Architecture / Technical Overview

## Svrha dokumenta

Ovaj dokument daje kratak tehnički pregled sistema za upravljanje troškovima i budžetima. Namijenjen je osobi koja prvi put otvara repozitorij i treba brzo razumjeti od čega se sistem sastoji, gdje se nalazi ključni kod i kako dijelovi sistema međusobno komuniciraju.

## Visoki pregled sistema

Sistem je web aplikacija sa odvojenim frontend i backend slojem. Frontend je Angular aplikacija, backend je Express/TypeScript REST API, baza je PostgreSQL, autentikacija se oslanja na Keycloak/JWT, a AI funkcionalnosti koriste kombinaciju backend logike, Python FastAPI servisa i Google Gemini API-ja kada je dostupan API ključ.

```text
Korisnik u browseru
        |
        v
Angular frontend
        |
        | HTTP REST + JWT/session cookie
        v
Express / TypeScript backend
        |
        +--> PostgreSQL baza
        |       - poslovni podaci
        |       - notifikacije
        |       - import historija
        |
        +--> Keycloak
        |       - login
        |       - JWT/JWKS validacija
        |       - uloge
        |
        +--> Python FastAPI AI servis
        |       - fallback za AI prijedloge
        |       - heurističke analize
        |
        +--> Google Gemini API
                - generativni AI kada postoji API ključ
```

## Tehnološki stack

| Sloj | Tehnologije | Lokacija |
| --- | --- | --- |
| Frontend | Angular 21, TypeScript, RxJS, Angular Forms i Router | `PROJEKAT/FRONTEND` |
| Backend API | Node.js, Express, TypeScript/tsx, Jest testovi | `PROJEKAT/BACKEND` |
| Baza | PostgreSQL 16, SQL migracije, `pg` driver | `PROJEKAT/BACKEND/migrations` |
| Autentikacija | Keycloak, JWT RS256, JWKS validacija, role-based access | `PROJEKAT/BACKEND/BLL/Services/AuthService.ts` i frontend auth guard |
| AI servis | Python FastAPI interni servis za heuristike i fallback kategorije | `PROJEKAT/BACKEND/ai-service` |
| Vanjski AI | Google Gemini preko `@google/genai` paketa | `PROJEKAT/BACKEND/BLL/Services/AIAnalysisService.ts` |
| Lokalno okruženje | Docker Compose za bazu, Keycloak, backend i AI servis | `PROJEKAT/BACKEND/docker-compose.yml` |

## Glavne komponente

### Frontend

Frontend je Angular single-page aplikacija. Rute su definisane u `PROJEKAT/FRONTEND/src/app/app.routes.ts`, gdje se preko route guardova ograničava pristup modulima prema korisničkim ulogama.

Glavni ekrani su:

| Modul | Lokacija | Svrha |
| --- | --- | --- |
| Home / dashboard | `PROJEKAT/FRONTEND/src/app/components/home` | Pregled metrika, AI sažetak, dobavljači u rastu, upozorenja o ponavljajućim troškovima |
| Ručni unos troškova | `PROJEKAT/FRONTEND/src/app/components/expenses` | CRUD troškova, validacija, AI prijedlog kategorije |
| Import troškova | `PROJEKAT/FRONTEND/src/app/components/expense-import` | Uvoz CSV/XLS/XLSX fajlova i pregled validacije prije upisa |
| Planiranje budžeta | `PROJEKAT/FRONTEND/src/app/components/budget-planning` | Kreiranje, pregled, odobravanje, odbijanje i vraćanje budžeta na doradu |
| Pregled podataka | `PROJEKAT/FRONTEND/src/app/components/data-overview` | Filtriranje, grupisanje i poređenje podataka jedan pored drugog |
| Izvještaji | `PROJEKAT/FRONTEND/src/app/components/reports` | Finansijski izvještaji i export u podržane formate |
| Notifikacije | `PROJEKAT/FRONTEND/src/app/components/notifications` | Pregled sistemskih i AI upozorenja |

Frontend servisi u `PROJEKAT/FRONTEND/src/services` komuniciraju sa backend REST endpointima. Najvažniji su `expense.service.ts`, `budget.service.ts`, `report.service.ts`, `data-overview.service.ts`, `notification.service.ts` i `ai-analysis.service.ts`.

### Backend

Backend je organizovan slojevito:

| Sloj | Lokacija | Odgovornost |
| --- | --- | --- |
| Entry point | `PROJEKAT/BACKEND/app.ts` | Učitavanje env varijabli, CORS, sesije, migracije, seed podaci, registracija endpointa |
| Presentation/API | `PROJEKAT/BACKEND/PRESENTATION API/Endpoints` | REST rute za troškove, import, budžete, izvještaje, AI, notifikacije, komentare i korisnike |
| BLL servisi | `PROJEKAT/BACKEND/BLL/Services` | Poslovna logika i orkestracija između API-ja, repozitorija i vanjskih servisa |
| DAL repozitoriji | `PROJEKAT/BACKEND/DAL/Repositories` | SQL pristup PostgreSQL bazi |
| Interfejsi | `PROJEKAT/BACKEND/BLL/Interfaces` | Tipovi i ugovori između slojeva |
| Testovi | `PROJEKAT/BACKEND/tests` | Jest testovi za servise, repozitorije i API endpointe |

Backend registruje glavne API module iz `app.ts`:

- `SessionEndpoints.ts` za login/session tokove.
- `UserEndpoints.ts` za korisničke/profile/admin role pristupe.
- `ExpenseEndpoints.ts` za troškove, validaciju troška, AI prijedlog kategorije i rješavanje duplikata.
- `IngestionEndpoints.ts` za import troškova.
- `BudgetEndpoints.ts` za budžete i workflow odobravanja.
- `DataOverviewEndpoints.ts` za pregled i poređenje podataka.
- `ReportEndpoints.ts` za izvještaje i export.
- `NotificationEndpoints.ts` za notifikacije.
- `AIAnalysisEndpoints.ts` za AI dashboard funkcije.
- `CommentEndpoints.ts` za komentare nad budžetima.

### Baza podataka

PostgreSQL baza sadrži poslovne entitete kao što su korisnici, uloge, kategorije, odjeli, projekti, dobavljači, valute, budžeti, troškovi, import historija, anomalije, notifikacije i komentari. Inicijalna struktura se nalazi u `PROJEKAT/BACKEND/migrations/001_initial_create.sql`, a dodatne migracije proširuju AI analize, status duplikata, akcije notifikacija i workflow vraćanja budžeta na doradu.

Backend pri pokretanju izvršava provjeru i inicijalizaciju kroz `runMigrations()` i `ensureBaseData()` u `PROJEKAT/BACKEND/app.ts`. Osnovni šifarnici uključuju uloge, valute, kategorije i odjele.

### AI funkcionalnosti

AI dio je podijeljen na nekoliko nivoa:

- `AIAnalysisService.ts` u backendu sadrži glavnu logiku za analizu troškova, anomalije, dobavljače u rastu, executive summary, preporuke za optimizaciju, ponavljajuće troškove i AI asistenta.
- Google Gemini se koristi kada je podešen `GEMINI_API_KEY`, posebno za AI asistenta i prijedlog kategorije troška.
- Python FastAPI servis u `PROJEKAT/BACKEND/ai-service` daje interni `/health`, `/ai/expense-check`, `/ai/category-suggestion` i osnovne AI analysis endpointe.
- Prijedlog kategorije prvo pokušava Gemini, zatim fallback na Python kategorijski servis, a ako oba nisu dostupna vraća poruku da AI servis nije dostupan.
- Anomalije, duplikati, rast dobavljača, zaboravljeni ponavljajući troškovi i dio preporuka rade većinom preko heuristika/statističkih pravila nad postojećim podacima, uz AI naziv u korisničkom interfejsu kao pomoćni analitički sloj.

## Kako komponente komuniciraju

1. Korisnik se prijavljuje preko Keycloak toka i frontend čuva stanje autentikacije kroz auth guard servis.
2. Angular frontend šalje REST zahtjeve backendu. Za zaštićene rute šalje se Bearer JWT ili se koristi backend session cookie, zavisno od toka.
3. Backend `AuthService` validira JWT preko Keycloak JWKS endpointa, provjerava issuer, audience i uloge.
4. Endpoint sloj poziva odgovarajući BLL servis.
5. BLL servis validira poslovna pravila, poziva repozitorij za bazu i po potrebi poziva AI servis ili Gemini.
6. Repozitoriji izvršavaju SQL upite nad PostgreSQL bazom.
7. Backend vraća JSON odgovor frontend servisu, a Angular komponenta osvježava prikaz.

Primjer za AI prijedlog kategorije:

```text
Administrativni zaposlenik
        |
        | Unosi naziv troška i klikne "AI prijedlog"
        v
ExpensesComponent
        |
        | POST /api/troskovi/category-suggestion
        v
ExpenseEndpoints
        |
        | suggestCategory(payload)
        v
ExpenseService
        |
        | suggestExpenseCategory(...)
        v
AIAnalysisService
        |
        +--> 1. Pokušava Gemini API
        |       - ako uspije, vraća categoryId, confidence i reason
        |
        +--> 2. Ako Gemini nije dostupan, poziva Python AI servis
        |       - POST /ai/category-suggestion
        |       - vraća heuristički prijedlog ili prazan rezultat
        |
        v
Normalizovan prijedlog kategorije
        |
        v
Frontend popunjava kategoriju ili prikazuje poruku o grešci
```

## Ključni kod

| Oblast | Ključni fajlovi |
| --- | --- |
| Pokretanje backenda | `PROJEKAT/BACKEND/app.ts` |
| Backend env primjer | `PROJEKAT/BACKEND/.env.example` |
| Docker Compose | `PROJEKAT/BACKEND/docker-compose.yml` |
| Frontend rute i pristup po ulogama | `PROJEKAT/FRONTEND/src/app/app.routes.ts` |
| Frontend auth guard | `PROJEKAT/FRONTEND/src/middleware/middleware.authguard.ts` |
| Ručni unos troškova | `PROJEKAT/FRONTEND/src/app/components/expenses` |
| Dashboard / ključne metrike | `PROJEKAT/FRONTEND/src/app/components/home` |
| Pregled i poređenje podataka | `PROJEKAT/FRONTEND/src/app/components/data-overview` |
| Frontend API servisi | `PROJEKAT/FRONTEND/src/services` |
| Troškovi backend | `PROJEKAT/BACKEND/BLL/Services/ExpenseService.ts`, `PROJEKAT/BACKEND/PRESENTATION API/Endpoints/ExpenseEndpoints.ts`, `PROJEKAT/BACKEND/DAL/Repositories/ExpenseRepository.ts` |
| Budžeti backend | `PROJEKAT/BACKEND/BLL/Services/BudgetService.ts`, `PROJEKAT/BACKEND/PRESENTATION API/Endpoints/BudgetEndpoints.ts`, `PROJEKAT/BACKEND/DAL/Repositories/BudgetRepository.ts` |
| Izvještaji backend | `PROJEKAT/BACKEND/BLL/Services/ReportService.ts`, `PROJEKAT/BACKEND/PRESENTATION API/Endpoints/ReportEndpoints.ts`, `PROJEKAT/BACKEND/DAL/Repositories/ReportRepository.ts` |
| AI analiza | `PROJEKAT/BACKEND/BLL/Services/AIAnalysisService.ts`, `PROJEKAT/BACKEND/PRESENTATION API/Endpoints/AIAnalysisEndpoints.ts` |
| Python AI servis | `PROJEKAT/BACKEND/ai-service/app/main.py`, `PROJEKAT/BACKEND/ai-service/app/services` |
| Migracije baze | `PROJEKAT/BACKEND/migrations` |
| Backend testovi | `PROJEKAT/BACKEND/tests` |
| Frontend testovi | `PROJEKAT/FRONTEND/src/app/**/*.spec.ts` |

## Najvažnije sigurnosne odluke

- Autentikacija se oslanja na Keycloak i JWT tokene umjesto ručno implementirane provjere lozinki u aplikaciji.
- Backend validira JWT preko JWKS-a, uz provjeru `issuer`, `audience` i RS256 potpisa.
- Pristup osjetljivim modulima ograničen je ulogama: administrativni zaposlenik radi unos/import troškova, glavni računovođa i finansijski direktor rade budžete, izvještaje, poređenja, notifikacije i AI preglede, a admin ima širi pristup.
- Frontend route guardovi služe za korisničko iskustvo i skrivanje nedozvoljenih ekrana, ali backend role middleware je stvarna zaštita za zaštićene API operacije.
- CORS je ograničen na `FRONTEND_ORIGIN` iz environment varijable.
- Session cookie je `httpOnly`, a u produkciji se postavlja kao `secure` i `sameSite: none`.
- Tajne vrijednosti kao što su `DATABASE_URL`, `SESSION_SECRET`, Keycloak konfiguracija i `GEMINI_API_KEY` očekuju se kroz environment varijable, ne kroz frontend kod.
- Frontend nema direktan pristup bazi. Sva komunikacija sa podacima ide preko backend API-ja.
- Import fajlova ide preko backend servisa koji parsira samo podržane CSV/XLS/XLSX formate i validira redove prije upisa.

## Sažetak za novog developera

Ako prvi put ulaziš u projekat, prvo pogledaj `PROJEKAT/BACKEND/app.ts`, `PROJEKAT/FRONTEND/src/app/app.routes.ts`, backend servise u `PROJEKAT/BACKEND/BLL/Services` i frontend servise u `PROJEKAT/FRONTEND/src/services`. Za razumijevanje baze kreni od `PROJEKAT/BACKEND/migrations/001_initial_create.sql`. Za AI dio najbitniji su `AIAnalysisService.ts` i Python servis u `PROJEKAT/BACKEND/ai-service`.
