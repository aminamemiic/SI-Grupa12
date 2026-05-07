# Testing Proof - Sprint 6

## 1. Svrha dokumenta

Ovaj dokument evidentira dokaz o testiranju funkcionalnosti implementiranih u Sprintu 6. Testiranje je rađeno u skladu sa Sprint 3 dokumentom `TestStrategy.md`, posebno sa dijelovima koji se odnose na:
- unit testiranje validacione logike za troškove,
- integraciono testiranje CRUD operacija nad troškovima,
- regresiono testiranje nakon izmjena CRUD logike i UI komponenti,
- UI testiranje formi, dugmadi, poruka i rasporeda elemenata,
- sigurnosno/RBAC testiranje pristupa funkcionalnostima prema ulozi korisnika.

## 2. Funkcionalnosti obuhvaćene testiranjem

| Funkcionalnost | Tip testiranja | Šta je provjereno | Rezultat |
|---|---|---|---|
| Pregled troškova | Unit + integraciono | Dohvat liste troškova, prazan rezultat, greška servisa, keširanje liste troškova | Prošlo |
| Referentni podaci za troškove | Unit + integraciono | Dohvat kategorija, odjela i valuta; keširanje referentnih podataka; greška servisa | Prošlo |
| Kreiranje troška | Unit + integraciono + regresiono | Kreiranje validnog troška, validacija naziva, iznosa, datuma i obaveznih ID polja | Prošlo |
| Ažuriranje troška | Unit + integraciono + regresiono | PUT ažuriranje postojećeg troška, validacija payload-a, greška za nepostojeći trošak, invalidacija keša nakon izmjene | Prošlo |
| Zaštita zaključanih troškova | Unit + integraciono | Blokiranje ažuriranja i brisanja troška sa statusom `ZAKLJUCAN` | Prošlo |
| Brisanje troška | Unit + integraciono + regresiono | Uspješno brisanje troška, HTTP 204 odgovor, ponašanje kada trošak ne postoji, invalidacija keša nakon brisanja | Prošlo |
| RBAC zaštita CRUD endpointa | Integraciono + sigurnosno | Provjera da POST, PUT i DELETE endpointi pozivaju `requireAuthentication` i `requireRole` middleware sa odgovarajućim rolama | Prošlo |
| Ispravka izgleda UI-a | UI + regresiono | Vizuelna provjera rasporeda elemenata, preglednosti formi, dugmadi za akcije i osnovnog korisničkog toka za rad sa troškovima | Prošlo ručnom provjerom |
| Administratorski pregled rola kroz Keycloak | UI + sigurnosno/RBAC | Provjera da administrator može pregledati role korisnika i da su role usklađene sa backend autorizacijom | Prošlo ručnom provjerom |

## 3. Automatizovani backend testovi

Pokrenuta komanda:

```bash
npm test -- --coverage
```

Lokacija pokretanja:

```text
PROJEKAT/BACKEND
```

Rezultat:
- Test suites: 2 passed, 2 total
- Tests: 53 passed, 53 total
- Snapshots: 0 total
- Vrijeme izvršavanja: 3.871 s

Test fajlovi:
- `PROJEKAT/BACKEND/tests/ExpenseService.test.ts`
- `PROJEKAT/BACKEND/tests/ExpenseEndpoints.test.ts`

## 4. Code coverage

Coverage je izmjeren za backend dio koji je obuhvaćen Sprint 6 testovima.

| Dio sistema | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| All files | 100% | 97.72% | 100% | 100% |
| `BLL/Services/ExpenseService.ts` | 100% | 100% | 100% | 100% |
| `PRESENTATION API/Endpoints/ExpenseEndpoints.ts` | 100% | 83.33% | 100% | 100% |

Globalni coverage prag iz `jest.config.cjs` je:
- lines: 80%
- branches: 80%
- functions: 80%
- statements: 80%

Zaključak: backend testovi za Sprint 6 zadovoljavaju definisani coverage prag.


## 5. Ručno UI i regresiono testiranje

Ručna provjera je urađena za tokove koji su bili fokus Sprinta 6:

| ID | Scenarij | Koraci | Očekivani rezultat | Status |
|---|---|---|---|---|
| UI-01 | Pregled poboljšanog UI-a | Otvoriti aplikaciju i pregledati stranice povezane sa troškovima | Elementi su čitljivi, raspored je pregledan, akcije su jasno dostupne | Prošlo |
| UI-02 | Ažuriranje troška kroz UI | Odabrati postojeći trošak, izmijeniti podatke i potvrditi izmjenu | Trošak je ažuriran, lista prikazuje nove podatke, nema narušavanja layouta | Prošlo |
| UI-03 | Validacija pri ažuriranju | Pokušati sačuvati trošak sa neispravnim ili nepotpunim podacima | Sistem odbija neispravne podatke i prikazuje odgovarajuću grešku | Prošlo |
| UI-04 | Brisanje troška kroz UI | Odabrati trošak i pokrenuti brisanje | Trošak se uklanja iz liste i naredni dohvat prikazuje ažurno stanje | Prošlo |
| UI-05 | Zaključan trošak | Pokušati izmijeniti ili obrisati zaključan trošak | Sistem blokira akciju i vraća grešku | Prošlo |
| UI-06 | RBAC kontrola akcija | Prijaviti se korisnicima različitih rola i provjeriti dostupnost CRUD akcija | CRUD akcije su dostupne samo ovlaštenim rolama | Prošlo |
| UI-07 | Admin pregled rola | Prijaviti se kao administrator i otvoriti pregled korisničkih rola | Administrator vidi role korisnika kroz Keycloak integraciju | Prošlo |
| UI-08 | Regresija nakon UI izmjena | Provjeriti osnovne tokove pregleda, kreiranja, ažuriranja i brisanja troškova | Postojeće funkcionalnosti rade nakon UI izmjena | Prošlo |

## 6. Veza sa Test Strategy dokumentom

Testiranje Sprinta 6 direktno prati sljedeće stavke iz Sprint 3 `TestStrategy.md`:
- `CRUD troškova (US-18, US-19, US-20, US-21)`: testirano kreiranje, pregled, ažuriranje, brisanje, validacija izmjena, potvrda brisanja i zabrana CRUD operacija bez ovlaštenja.
- `Upravljanje korisnicima / RBAC`: testirano da se middleware za autentifikaciju i role poziva na zaštićenim endpointima, te da administrator može pregledati role.
- `UI Testiranje`: ručno provjeren raspored elemenata, dugmad, forme, validacione poruke i osnovni korisnički tokovi.
- `Regresiono Testiranje`: nakon izmjena CRUD logike i UI-a provjereno je da osnovne operacije nad troškovima i dalje rade.

## 7. Zaključak

Relevantne backend funkcionalnosti Sprinta 6 su pokrivene automatizovanim testovima i zadovoljavaju definisani coverage prag. Najvažniji tokovi za ažuriranje i brisanje troškova, zaštitu zaključanih troškova, keš invalidaciju i RBAC kontrolu su uspješno testirani.
