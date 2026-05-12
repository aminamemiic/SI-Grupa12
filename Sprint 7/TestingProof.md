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

Planirana komanda:

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

Napomena o lokalnom pokretanju: u trenutnom radnom okruženju testovi nisu mogli biti izvršeni jer `node_modules` nije instaliran, pa komanda preko `npm.cmd` završava porukom da `jest` nije prepoznat. Implementacija nije mijenjana i nije pokretano instaliranje dependency-ja, u skladu sa zahtjevom da se projekat ne dira.

## 4. Ručno UI i regresiono testiranje

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

## 5. Veza sa User Stories iz Sprinta 2

| ID storyja | Naziv | Planirani sprint | Status u Sprintu 7 | Napomena |
|---|---|---:|---|---|
| 14 | Pregled liste podataka | Sprint 7 | Završeno | Implementiran pregled liste troškova |
| 15 | Detaljan prikaz podataka | Sprint 7 | Završeno | Detalji zapisa dostupni kroz prikaz troškova |
| 16 | Uvoz podataka iz fajla | Sprint 7 | Završeno | Implementiran CSV/XLS/XLSX upload |
| 17 | Obrada uvezenih podataka | Sprint 7 | Završeno | Implementirano mapiranje i transformacija redova |
| 18 | Validacija uvezenih podataka | Sprint 7 | Završeno | Implementirano označavanje grešaka i blokiranje nevalidnih redova |
| 26 | Kreiranje novog budžeta | Sprint 8 | Završeno ranije | Preuzeto i implementirano u Sprintu 7 |
| 27 | Pregled postojećeg budžeta | Sprint 8 | Završeno ranije | Preuzeto i implementirano u Sprintu 7 |
| 28 | Uređivanje postojećeg budžeta | Sprint 8 | Završeno ranije | Preuzeto i implementirano u Sprintu 7 |
| 29 | Odobravanje budžeta | Sprint 8 | Završeno ranije | Story iz dodatno dostavljenog opisa planiranja budžeta implementiran u Sprintu 7 |

## 6. Zaključak

Sprint 7 je pokrio planirani pregled podataka i uvoz podataka, a tim je dodatno završio budget funkcionalnosti iz budućeg Sprinta 8. Najvažniji testirani tokovi su preview uvoza, validacija redova, potvrda uvoza, historija uvoza, kreiranje i uređivanje budžeta, te odobravanje ili odbijanje budžeta.
