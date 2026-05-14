# Testing Proof - Sprint 7

## 1. Svrha dokumenta

Ovaj dokument evidentira dokaz o testiranju funkcionalnosti implementiranih u Sprintu 7. Testiranje je vezano za:
- pregled podataka o troškovima,
- uvoz troškova iz CSV/Excel fajlova,
- obradu i validaciju uvezenih podataka,
- historiju uvoza,
- dodatno implementirano planiranje budžeta koje je prvobitno bilo planirano za Sprint 8.

## 2. Funkcionalnosti obuhvaćene testiranjem

| Funkcionalnost | Tip testiranja | Šta je provjereno | Rezultat |
|---|---|---|---|
| Pregled troškova | Unit + integraciono + regresiono | Dohvat liste troškova, prazan rezultat, greška servisa i referentni podaci | Prošlo kroz postojeće testove i regresionu provjeru |
| Uvoz CSV fajla | Unit + integraciono | Parsiranje CSV fajla, mapiranje kolona, lokalni format iznosa i datuma | Prošlo kroz testove ingestion servisa |
| Uvoz Excel fajla | Unit + integraciono | Podrška za XLS i XLSX fajlove kroz parser | Pokriveno servisnom logikom i ručnom provjerom toka |
| Preview uvoza | Unit + integraciono | Prikaz ukupnog broja redova, validnih i nevalidnih redova | Prošlo |
| Validacija uvezenih redova | Unit | Obavezni naziv, iznos, datum, kategorija, odjel i valuta; označavanje grešaka | Prošlo |
| Mapiranje referentnih podataka | Unit | Mapiranje kategorija, odjela, valuta, projekata i dobavljača po ID-u ili nazivu | Prošlo |
| Potvrda uvoza | Unit + integraciono | Upis odabranih redova kroz postojeći ExpenseService i bilježenje djelimičnog/neuspješnog uvoza | Prošlo |
| Historija uvoza | Unit + integraciono | Evidentiranje fajla, statusa, broja redova, grešaka i korisnika | Prošlo |
| RBAC zaštita uvoza | Integraciono + sigurnosno | Preview, potvrda i historija uvoza zahtijevaju autentifikaciju i odgovarajuću rolu | Prošlo |
| Planiranje budžeta | Unit + integraciono | Kreiranje, pregled, referentni podaci, validacije, uređivanje, status odobrenja i cache invalidacija | Prošlo kroz budget testove |
| Odobravanje budžeta | Unit + integraciono + RBAC | Promjena statusa u ODOBREN/ODBIJEN i evidentiranje korisnika koji odobrava | Prošlo |

## 3. Automatizovani backend testovi

Pokrenuta komanda:

```bash
npm test -- --coverage
```

Lokacija pokretanja:

```text
PROJEKAT/BACKEND
```

Test fajlovi relevantni za Sprint 7:
- `PROJEKAT/BACKEND/tests/IngestionService.test.ts`
- `PROJEKAT/BACKEND/tests/IngestionEndpoints.test.ts`
- `PROJEKAT/BACKEND/tests/BudgetService.test.ts`
- `PROJEKAT/BACKEND/tests/BudgetEndpoints.test.ts`
- regresiono: `PROJEKAT/BACKEND/tests/ExpenseService.test.ts`
- regresiono: `PROJEKAT/BACKEND/tests/ExpenseEndpoints.test.ts`

U repozitoriju postoji 6 backend test fajlova sa ukupno 134 test scenarija.

Rezultat:
- Test suites: 6 passed, 6 total
- Tests: 134 passed, 134 total
- Snapshots: 0 total
- Vrijeme izvršavanja: 5.437 s

## 4. Code coverage

Coverage je izmjeren za backend dio koji je obuhvaćen Sprint 7 testovima i regresionim testovima za troškove.

| Dio sistema | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| All files | 93.8% | 85.11% | 98.03% | 93.73% |
| `BLL/Services/BudgetService.ts` | 91.02% | 90% | 90% | 90.9% |
| `BLL/Services/ExpenseService.ts` | 100% | 100% | 100% | 100% |
| `BLL/Services/IngestionService.ts` | 91.05% | 81.72% | 100% | 90.83% |
| `PRESENTATION API/Endpoints/ExpenseEndpoints.ts` | 94.87% | 56.25% | 100% | 94.87% |
| `PRESENTATION API/Endpoints/IngestionEndpoints.ts` | 100% | 75% | 100% | 100% |

Globalni coverage prag iz `jest.config.cjs` je:
- lines: 80%
- branches: 80%
- functions: 80%
- statements: 80%

Zaključak: backend testovi za Sprint 7 zadovoljavaju definisani globalni coverage prag.

## 5. Ručno UI i regresiono testiranje

| ID | Scenarij | Koraci | Očekivani rezultat | Status |
|---|---|---|---|---|
| UI-01 | Pregled liste troškova | Otvoriti stranicu za troškove | Lista troškova se prikazuje bez greške | Prošlo ručnom provjerom |
| UI-02 | Upload validnog CSV/XLS/XLSX fajla | Odabrati fajl i pokrenuti preview | Sistem prikazuje redove za obradu | Prošlo ručnom provjerom |
| UI-03 | Upload nepodržanog fajla | Odabrati fajl koji nije CSV/XLS/XLSX | Sistem prikazuje validacionu poruku | Prošlo ručnom provjerom |
| UI-04 | Validacija neispravnih redova | Uvesti fajl sa praznim obaveznim poljima | Neispravni redovi su označeni i ne biraju se automatski za import | Prošlo ručnom provjerom |
| UI-05 | Potvrda validnih redova | Odabrati validne redove i potvrditi import | Validni troškovi se upisuju, a rezultat uvoza se prikazuje korisniku | Prošlo ručnom provjerom |
| UI-06 | Planiranje budžeta | Kreirati novi budžet sa validnim podacima | Budžet se sprema i prikazuje u listi | Prošlo ručnom provjerom |
| UI-07 | Validacija budžeta | Pokušati spremiti budžet bez obaveznih polja ili sa neispravnim periodom | Sistem odbija spremanje i prikazuje grešku | Prošlo ručnom provjerom |
| UI-08 | Odobravanje budžeta | Prijaviti se kao finansijski direktor i promijeniti status budžeta | Budžet dobija status ODOBREN ili ODBIJEN | Prošlo ručnom provjerom |

## 6. Veza sa User Stories iz Sprinta 2

| ID storyja | Naziv | Planirani sprint | Status u Sprintu 7 | Napomena |
|---|---|---:|---|---|
| 16 | Uvoz podataka iz fajla | Sprint 7 | Završeno | Implementiran CSV/XLS/XLSX upload |
| 17 | Obrada uvezenih podataka | Sprint 7 | Završeno | Implementirano mapiranje i transformacija redova |
| 18 | Validacija uvezenih podataka | Sprint 7 | Završeno | Implementirano označavanje grešaka i blokiranje nevalidnih redova |
| 26 | Kreiranje novog budžeta | Sprint 8 | Završeno ranije | Preuzeto i implementirano u Sprintu 7 |
| 27 | Pregled postojećeg budžeta | Sprint 8 | Završeno ranije | Preuzeto i implementirano u Sprintu 7 |
| 28 | Uređivanje postojećeg budžeta | Sprint 8 | Završeno ranije | Preuzeto i implementirano u Sprintu 7 |
| 29 | Odobravanje budžeta | Sprint 8 | Završeno ranije | Story iz dodatno dostavljenog opisa planiranja budžeta implementiran u Sprintu 7 |

## 7. Zaključak

Sprint 7 je pokrio planirani uvoz podataka, a tim je dodatno završio budget funkcionalnosti iz budućeg Sprinta 8. Cijeli tim se složio oko izmjene plana sprintova, tj. odlučeno je da se zamijene User storiji 14 i 15 (Sprint 7) sa User storijima 26, 27, 28, 29 (Sprint 8) radi bolje raspodjele posla. Relevantne backend funkcionalnosti su pokrivene automatizovanim testovima, svi testovi su uspješno prošli i zadovoljen je globalni coverage prag. Najvažniji testirani tokovi su preview uvoza, validacija redova, potvrda uvoza, historija uvoza, kreiranje i uređivanje budžeta, te odobravanje ili odbijanje budžeta.
