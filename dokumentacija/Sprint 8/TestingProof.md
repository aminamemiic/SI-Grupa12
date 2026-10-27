# Testing Proof - Sprint 8

## 1. Svrha dokumenta

Ovaj dokument evidentira dokaz o uspješnom testiranju svih funkcionalnosti implementiranih u Sprintu 8. Testiranje obuhvata:
- Modul za pregled podataka s agregacijama (Data Overview),
- Naprednu tekstualnu pretragu, višestruko filtriranje i sortiranje troškova i budžeta,
- Prikaz modalnih detalja za sve entitete u sistemu,
- Historiju uvoza troškova (ingestion history) s uvidom u parsirane redove i logove grešaka,
- Generisanje finansijskih izvještaja s vizuelnim sažecima i iskoristivošću budžeta,
- Izvoz izvještaja u XLSX (s više sheetova), CSV i PDF formate,
- Unifikaciju evropskog formata datuma (`dd.mm.yyyy`) i vremena kroz cijelu aplikaciju,
- RBAC sigurnosnu zaštitu svih novih endpointa i stranica.

---

## 2. Funkcionalnosti obuhvaćene testiranjem

| Funkcionalnost | Tip testiranja | Šta je provjereno | Rezultat |
|---|---|---|---|
| Pregled podataka (Data Overview) | Unit + integraciono | Dohvat svih referentnih tabela (kategorije, odjeli, valute, projekti, dobavljači, troškovi, budžeti) na jednom endpointu | Prošlo kroz DataOverview testove i regresionu provjeru |
| Modalni detalji entiteta | Ručno UI testiranje | Klik na red bilo koje tabele otvara modal s tačnim i potpunim atributima zapisa | Prošlo |
| Pretraga i filtriranje | Ručno UI testiranje | Pretraga u realnom vremenu, kombinovani filteri po odjelu/kategoriji/statusu/valuti/dobavljaču i rasponu iznosa | Prošlo |
| Sortiranje kolona | Ručno UI testiranje | Klik na zaglavlje kolona troškova i budžeta sortira podatke u oba smjera (asc/desc) | Prošlo |
| Historija uvoza (Ingestion History) | Unit + integraciono | Dohvatanje zapisa o uvozima, prikaz detaljnog modala s uvezenim redovima i tačnim greškama po redu | Prošlo kroz Ingestion testove i ručnu UI provjeru |
| Generisanje izvještaja | Unit + integraciono | Računanje agregacija, top stavki i iskoristivosti budžeta u odabranom vremenskom periodu | Prošlo kroz Report testove |
| Izvoz u XLSX format | Unit + integraciono | Izvoz višelisnog Excel dokumenta s agregacijskim listovima i ispravnim formatima brojeva | Prošlo kroz servisne testove i ručno otvaranje u MS Excel |
| Izvoz u CSV format | Unit + integraciono | Generisanje ispravnog CSV tekstualnog toka sa svim agregacijama i troškovima | Prošlo |
| Izvoz u PDF format | Unit + integraciono | Generisanje binarnog PDF-a s normalizovanim karakterima (uklonjene kvačice) radi čitljivosti | Prošlo kroz ručnu provjeru izgleda i preuzimanja |
| Unifikacija datuma | Ručno UI testiranje | Format `dd.mm.yyyy` i `dd.mm.yyyy hh:mm` u tabelama, modalima, filterima i izvezenim datotekama | Prošlo |
| RBAC zaštita izvještaja | Integraciono + sigurnosno | Pristup `/api/izvjestaji` i eksportima dozvoljen samo rolama `admin`, `glavni_racunovodja` i `finansijski_direktor` | Prošlo |

---

## 3. Automatizovani backend testovi

Pokrenuta komanda:

```bash
cmd.exe /c npm test -- --coverage
```

Lokacija pokretanja:

```text
PROJEKAT/BACKEND
```

Test fajlovi u repozitoriju za Sprint 8 (dodani novi i regresioni):
- `PROJEKAT/BACKEND/tests/ReportEndpoints.test.ts` (Novi test fajl)
- `PROJEKAT/BACKEND/tests/DataOverviewEndpoints.test.ts` (Novi test fajl)
- `PROJEKAT/BACKEND/tests/DataOverviewService.test.ts` (Novi test fajl)
- `PROJEKAT/BACKEND/tests/IngestionEndpoints.test.ts` (Regresioni)
- `PROJEKAT/BACKEND/tests/IngestionService.test.ts` (Regresioni)
- `PROJEKAT/BACKEND/tests/BudgetEndpoints.test.ts` (Regresioni)
- `PROJEKAT/BACKEND/tests/BudgetService.test.ts` (Regresioni)
- `PROJEKAT/BACKEND/tests/ExpenseEndpoints.test.ts` (Regresioni)
- `PROJEKAT/BACKEND/tests/ExpenseService.test.ts` (Regresioni)

U repozitoriju sada postoji **9 backend test fajlova** sa ukupno **168 test scenarija** (uključujući 34 nova testa dodana za pregled podataka, historiju uvoza i izvještaje).

Rezultat pokretanja testova:
- **Test Suites:** 9 passed, 9 total
- **Tests:** 168 passed, 168 total
- **Snapshots:** 0 total
- **Vrijeme izvršavanja:** 6.182 s

---

## 4. Code coverage

Coverage je izmjeren za backend servise i endpointe koji su implementirani ili modificirani u Sprintu 8.

| Dio sistema | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| **All files** | **94.2%** | **86.3%** | **98.2%** | **94.1%** |
| `BLL/Services/ReportService.ts` | 92.5% | 84.1% | 96.4% | 92.2% |
| `PRESENTATION API/Endpoints/ReportEndpoints.ts` | 100% | 80% | 100% | 100% |
| `BLL/Services/DataOverviewService.ts` | 100% | 100% | 100% | 100% |
| `PRESENTATION API/Endpoints/DataOverviewEndpoints.ts` | 100% | 100% | 100% | 100% |
| `BLL/Services/IngestionService.ts` | 91.5% | 82.3% | 100% | 91.1% |

Globalni coverage prag iz `jest.config.cjs` je:
- lines: 80%
- branches: 80%
- functions: 80%
- statements: 80%

**Zaključak:** Svi relevantni backend servisi i endpoints u potpunosti zadovoljavaju i premašuju definisani globalni coverage prag od 80%.

---

## 5. Ručno UI i regresiono testiranje

| ID | Scenarij | Koraci | Očekivani rezultat | Status |
|---|---|---|---|---|
| UI-01 | Pregled Dashboarda i tabela | Otvoriti stranicu `/podaci/pregled` s rolom finansijskog direktora | Prikazuju se sve referentne tabele s tačnim brojem zapisa i sumama | Prošlo |
| UI-02 | Modalni detalji entiteta | Kliknuti na red dobavljača ili projekta | Otvara se modal sa svim atributima (PIB, adresa, budžet projekta, itd.) | Prošlo |
| UI-03 | Tekstualna pretraga u realnom vremenu | Unijeti dio naziva troška u polje za pretragu | Tabela troškova se instantno filtrira prikazujući samo podudarne redove | Prošlo |
| UI-04 | Višestruko filtriranje troškova | Odabrati odjel "IT" i status "ODOBREN" istovremeno | Prikazuju se isključivo odobreni IT troškovi, a sume se ispravno ažuriraju | Prošlo |
| UI-05 | Filtriranje po opsegu iznosa | Postaviti filter troškova na raspon od 100 do 500 BAM | Prikazuju se samo troškovi čiji je iznos unutar tog opsega | Prošlo |
| UI-06 | Dvosmjerno sortiranje | Kliknuti na zaglavlje kolone "Iznos" u tabeli troškova | Prvi klik sortira rastuće, drugi klik opadajući s vizuelnim strelicama | Prošlo |
| UI-07 | Pregled historije uvoza s greškama | Otvoriti detalje neuspješnog uvoza iz historije | Otvara se modal sa preview-om i tačnim ispisom grešaka za nevalidne redove | Prošlo |
| UI-08 | Generisanje izvještaja s filterom perioda | Odabrati period i kliknuti "Učitaj izvještaj" | Prikazuju se tačni sažeci, agregacije i iskoristivost budžeta u rasponu | Prošlo |
| UI-09 | Validacija perioda izvještaja | Postaviti datum do koji prethodi datumu od | Sistem odbija pretragu i prikazuje grešku "Datum od ne može biti poslije..." | Prošlo |
| UI-10 | Izvoz u višelisni Excel (.xlsx) | Kliknuti na dugme za izvoz XLSX i otvoriti datoteku | Datoteka sadrži zasebne listove s agregacijama i formatiranim iznosima | Prošlo |
| UI-11 | Izvoz u PDF s normalizacijom | Eksportovati PDF izvještaj o troškovima i otvoriti ga | PDF je čitljiv, a naša slova s kvačicama su normalizovana i ispravno prikazana | Prošlo |
| UI-12 | Provjera evropskog formata datuma | Pregledati bilo koju tabelu ili izvezeni dokument | Svi datumi su dosljedno prikazani u formatu `dd.mm.yyyy` | Prošlo |
| UI-13 | RBAC zabrana pristupa izvještajima | Prijaviti se kao administrativni radnik i pokušati otvoriti `/izvjestaji` | Sistem blokira ulaz, aktivira Guard i preusmjerava na `/home` s deniom | Prošlo |

---

## 6. Veza sa User Stories iz Sprinta 2 i dodatnim zahtjevima

| ID storyja | Naziv | Planirani sprint | Status u Sprintu 8 | Napomena |
|---|---|---:|---|---|
| 14 | Pregled troškova s agregacijama | Sprint 7 | Završeno | Implementiran Data Overview s agregacijama i modalima |
| 15 | Pregled budžeta s prikazom iskorištenosti | Sprint 7 | Završeno | Prikaz u Data Overview i iskoristivost u Reports modulu |
| 18 | Poređenje podataka (budžet vs. stvarni) | Sprint 8 | Završeno | Automatsko poređenje preklapanja u Reports modulu |
| 20 | Generisanje i izvoz izvještaja | Sprint 8 | Završeno | Izvoz u višelisni Excel (.xlsx), CSV i PDF format |
| 24 | Pretraga i filtriranje troškova | Sprint 8 | Završeno | Implementirana real-time pretraga i kumulativni filteri |
| 25 | Sortiranje podataka | Sprint 8 | Završeno | Dvosmjerno sortiranje svih kolona troškova i budžeta |
| 30 | Unifikacija datuma (`dd.mm.yyyy`) | Sprint 8 | Završeno | Sprovedeno kroz čitavu aplikaciju (UI, filteri, eksporti) |
| 31 | Pregled historije uvoza s greškama | Sprint 8 | Završeno | Historijski audit log uvoza s parsiranim redovima i greškama |

---

## 7. Zaključak

Sprint 8 je u potpunosti zaokružio cjelinu pregleda podataka i finansijskog izvještavanja. Sve planirane stavke iz Sprint Backloga, kao i dodatni zahtjevi Product Ownera vezani za evropski format datuma i audit log uvoza s greškama, uspješno su implementirani i testirani. 

Relevantni backend i frontend kod pokriven je automatizovanim i ručnim testovima. Svi automatizovani testovi (ukupno 168 scenarija u 9 suites) uspješno prolaze, a code coverage premašuje globalni prag od 80% na svim modulima. Ručnim UI testiranjem potvrđeno je ispravno ponašanje kumulativnih filtera, pretrage, sortiranja, generisanja PDF i XLSX višelisnih datoteka, unificiranog formata datuma, te stabilnost RBAC sigurnosnih pravila. Sistem je u potpunosti spreman za uvođenje planiranih AI funkcionalnosti u narednom sprintu.
