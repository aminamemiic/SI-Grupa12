# Testing Proof - Sprint 10

## 1. Svrha dokumenta

Ovaj dokument evidentira dokaz o uspješnom testiranju svih funkcionalnosti implementiranih u Sprintu 10. Testiranje obuhvata:
- Vizuelno tabelarno i grafičko poređenje selektovanih troškova jedan pored drugog,
- Identifikaciju sumnjivih obrazaca potrošnje (unos van radnog vremena, često ažuriranje i brisanje, cijepanje računa),
- Detekciju periodičnih troškova koji se ponavljaju te automatsko upozorenje pri izostanku očekivanog troška,
- Centralni interaktivni Dashboard sa ključnim finansijskim metrikama i grafikonima,
- Bliži prikaz stanja – drill-down na listu troškova klikom na grafikon Dashboarda,
- Dodavanje tekstualnog komentara uz automatsko bilježenje autora i vremena,
- Hronološki pregled komentara s vizuelnim indikatorom uz trošak,
- Inteligentni AI asistent za postavljanje pitanja o troškovima, budžetima, dobavljačima i anomalijama na bosanskom jeziku,
- AI Executive Summary – automatski generisan sažetak najvažnijih finansijskih informacija,
- Identifikaciju dobavljača sa najvećim rastom troškova i procjenu rizika zavisnosti od dobavljača,
- AI preporuke za optimizaciju troškova,
- Pregled periodičnih troškova koji nisu evidentirani u očekivanom periodu,
- Povrat budžeta na doradu uz obavezan komentar finansijskog direktora,
- Ispravku i ponovnu dostavu budžeta od strane glavnog računovođe,
- Pregled historije komentara tokom procesa odobravanja budžeta,
- Potpunu RBAC sigurnosnu zaštitu svih novih endpointa i stranica.

---

## 2. Funkcionalnosti obuhvaćene testiranjem

| Funkcionalnost | Tip testiranja | Šta je provjereno | Rezultat |
|---|---|---|---|
| Vizuelno poređenje podataka (US-38) | Ručno UI testiranje | Sistem prikazuje selektovane troškove paralelno u tabelarnom prikazu sa jasno istaknutim razlikama. | Prošlo |
| Grafički prikaz poređenja (US-39) | Ručno UI testiranje | Sistem prikazuje grafički prikaz poređenih podataka sa mogućnošću izbora tipa grafikona, bez grešaka pri učitavanju. | Prošlo |
| Identifikacija sumnjivih obrazaca potrošnje (US-40) | Unit + integraciono | Sistem uspješno prepoznaje neuobičajeno vrijeme unosa (van radnog vremena/vikend) i potencijalno cijepanje računa, te dodjeljuje odgovarajući risk score. | Prošlo |
| Detekcija periodičnih troškova (US-41) | Unit + integraciono | Sistem ispravno prepoznaje troškove koji se ponavljaju u pravilnim intervalima i kreira upozorenje kada očekivani periodični trošak izostane. | Prošlo |
| Centralni interaktivni Dashboard (US-42) | Ručno UI testiranje | Dashboard prikazuje ključne finansijske indikatore, grafičke kartice i metrike na jednom centralnom mjestu. | Prošlo |
| Bliži prikaz stanja (US-43) | Ručno UI testiranje | Klikom na grafikon na Dashboardu sistem prikazuje listu pojedinačnih troškova koji čine prikazanu sumu. | Prošlo |
| Dodavanje komentara (US-44) | Unit + integraciono + UI | Korisnik može dodati komentar na trošak; sistem validira dužinu, sprema komentar u bazu i povezuje ga s troškom uz ime autora i vrijeme. | Prošlo |
| Pregled komentara (US-45) | Integraciono + UI | Sistem prikazuje komentare uz trošak hronološki sa svim metapodacima (autor, datum/vrijeme); prikazuje vizuelni indikator pored troška. | Prošlo |
| AI asistent za finansijska pitanja (US-46) | Integraciono + UI | AI asistent ispravno odgovara na pitanja o troškovima, budžetima, kategorijama, dobavljačima i anomalijama; pri nedostatku podataka prikazuje odgovarajuću poruku. | Prošlo |
| AI Executive Summary (US-47) | Integraciono + UI | Dashboard automatski generiše sažetak sa informacijama o troškovima, budžetu i anomalijama bez grešaka. | Prošlo |
| Identifikacija dobavljača sa najvećim rastom (US-48) | Unit + integraciono | Sistem prikazuje dobavljače sa najvećim rastom troškova, procenat promjene i razlikuje nove od postojećih dobavljača. | Prošlo |
| AI preporuke za optimizaciju troškova (US-49) | Unit + integraciono | Sistem prikazuje obrazložene preporuke za optimizaciju; ne prikazuje preporuke bez odgovarajućih podataka. | Prošlo |
| Procjena rizika zavisnosti od dobavljača (US-50) | Unit + integraciono | Sistem generiše upozorenje kada jedan dobavljač čini značajan udio ukupne potrošnje, prikazuje procenat i nivo rizika (LOW/MEDIUM/HIGH). | Prošlo |
| Pregled periodičnih troškova za provjeru (US-51) | Integraciono + UI | Dashboard prikazuje periodične troškove koji nisu evidentirani u očekivanom periodu, s datumom posljednje evidencije i prosječnim iznosom; kada nema takvih troškova, prikazuje odgovarajuću poruku. | Prošlo |
| Povrat budžeta na doradu (US-52) | Integraciono + UI | Finansijski direktor može vratiti budžet uz obavezni komentar; sistem mijenja status u "Na doradi", šalje notifikaciju računovođi i čuva komentar u historiji. | Prošlo |
| Ispravka i ponovna dostava budžeta (US-53) | Integraciono + UI | Računovođa vidi komentar direktora, može ispraviti budžet i ponovo ga poslati; status se mijenja u "Na čekanju", direktor prima notifikaciju, a ispravka se bilježi u historiji. | Prošlo |
| Pregled historije komentara budžeta (US-54) | Ručno UI testiranje | Historija komentara prikazana je hronološki od najnovijeg, svaki zapis sadrži autora, datum/vrijeme, tip akcije i tekst; učitavanje ne prikazuje grešku. | Prošlo |

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

Test fajlovi u repozitoriju za Sprint 10 (dodani novi i regresioni):
U repozitoriju sada postoje **24 backend test fajla** sa ukupno **446 test scenarija** koji pokrivaju sve nove funkcionalnosti, statističke kalkulacije, AI servise i sigurnosne aspekte.

Ključni test fajlovi:
- `PROJEKAT/BACKEND/tests/AnomalyDetection.test.ts` (Statističke metode Z-score i IQR za detekciju anomalija, te napredne detekcije sumnjivih obrazaca ponašanja za `US-40`)
- `PROJEKAT/BACKEND/tests/CommentService.test.ts` (Dodavanje i hronološki pregled komentara odgovornih osoba za `US-44`, `US-45`)
- `PROJEKAT/BACKEND/tests/AIAnalysisEndpoints.test.ts` i `AIAnalysisService.test.ts` (AI asistent, Executive Summary, preporuke za optimizaciju, identifikacija dobavljača za `US-46`, `US-47`, `US-48`, `US-49`, `US-50`)
- `PROJEKAT/BACKEND/tests/BudgetEndpoints.test.ts`, `BudgetEndpointsCoverage.test.ts` i `BudgetService.test.ts` (Povrat budžeta na doradu, ispravka i ponovna dostava, historija komentara za `US-52`, `US-53`, `US-54`)
- `PROJEKAT/BACKEND/tests/DataOverviewEndpoints.test.ts` i `DataOverviewService.test.ts` (Vizuelno i grafičko poređenje podataka za `US-38`, `US-39`)
- `PROJEKAT/BACKEND/tests/ExpenseAnomalyNotificationService.test.ts` i `NotificationService.test.ts` (Notifikacije za periodične troškove i povrat budžeta za `US-41`, `US-51`, `US-52`, `US-53`)
- `PROJEKAT/BACKEND/tests/BudgetProjectionEndpoints.test.ts` (Pregled periodičnih troškova za provjeru za `US-51`)
- `PROJEKAT/BACKEND/tests/ReportEndpoints.test.ts`, `ReportFeatureEndpoints.test.ts` i `ReportService.test.ts`
- `PROJEKAT/BACKEND/tests/NotificationEndpoints.test.ts` i `NotificationRepository.test.ts`
- `PROJEKAT/BACKEND/tests/IngestionEndpoints.test.ts` i `IngestionService.test.ts`
- `PROJEKAT/BACKEND/tests/ExpenseEndpoints.test.ts` i `ExpenseService.test.ts`
- `PROJEKAT/BACKEND/tests/ExpenseCategorySuggestionEndpoints.test.ts` i `ExpenseCategorySuggestionService.test.ts`
- `PROJEKAT/BACKEND/tests/AppDB.test.ts`

Rezultat pokretanja testova:
- **Test Suites:** 24 passed, 24 total
- **Tests:** 446 passed, 446 total
- **Snapshots:** 0 total
- **Vrijeme izvršavanja:** 9.954 s

---

## 4. Code coverage

Coverage je izmjeren za backend servise i endpointe koji su implementirani ili modificirani u Sprintu 10.

| Dio sistema | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| **All files** | **97.85%** | **85.34%** | **96.50%** | **98.82%** |
| `BLL/Services/AIAnalysisService.ts` | 98.47% | 81.87% | 96.15% | 99.84% |
| `BLL/Services/BudgetService.ts` | 99.45% | 94.07% | 96% | 99.45% |
| `BLL/Services/CommentService.ts` | 100% | 100% | 100% | 100% |
| `BLL/Services/DataOverviewService.ts` | 100% | 100% | 100% | 100% |
| `BLL/Services/ExpenseService.ts` | 97.05% | 91.5% | 100% | 97.05% |
| `BLL/Services/IngestionService.ts` | 98.52% | 89.32% | 100% | 98.48% |
| `BLL/Services/NotificationService.ts` | 96.1% | 84.21% | 100% | 95.94% |
| `DAL/ApDbContext/AppDB.ts` | 100% | 83.33% | 100% | 100% |
| `DAL/Repositories/NotificationRepository.ts` | 90.69% | 95.38% | 81.48% | 91.02% |
| `PRESENTATION API/Endpoints/AIAnalysisEndpoints.ts` | 89.47% | 63.88% | 100% | 98.55% |
| `PRESENTATION API/Endpoints/BudgetEndpoints.ts` | 100% | 100% | 100% | 100% |
| `PRESENTATION API/Endpoints/CommentEndpoints.ts` | 100% | 100% | 100% | 100% |
| `PRESENTATION API/Endpoints/DataOverviewEndpoints.ts` | 100% | 100% | 100% | 100% |
| `PRESENTATION API/Endpoints/ExpenseEndpoints.ts` | 98.38% | 64.28% | 100% | 98.38% |
| `PRESENTATION API/Endpoints/IngestionEndpoints.ts` | 100% | 100% | 100% | 100% |
| `PRESENTATION API/Endpoints/NotificationEndpoints.ts` | 100% | 100% | 100% | 100% |
| `PRESENTATION API/Endpoints/ReportEndpoints.ts` | 100% | 100% | 100% | 100% |

Globalni coverage prag iz `jest.config.cjs` je 80% za sve kategorije, što ovaj modul u potpunosti zadovoljava i znatno premašuje.

---

## 5. Ručno UI i regresiono testiranje

| ID | Scenarij | Koraci | Očekivani rezultat | Status |
|---|---|---|---|---|
| UI-01 | Vizuelno tabelarno poređenje (US-38) | Selektovati 3 troška i kliknuti "Uporedi" | Sistem prikazuje troškove paralelno sa jasno istaknutim razlikama između stavki | Prošlo |
| UI-02 | Grafički prikaz poređenja (US-39) | Pokrenuti poređenje i odabrati tip grafikona (bar/line) | Grafikon se renderuje bez grešaka i vizuelno prikazuje razlike između selektovanih troškova | Prošlo |
| UI-03 | Identifikacija sumnjivog vremena unosa (US-40) | Unijeti trošak u 23:30 (van radnog vremena) | Sistem prepoznaje vanradno vrijeme, označava unos zastavicom i podiže risk score | Prošlo |
| UI-04 | Identifikacija cijepanja računa (US-40) | Unijeti više manjih troškova u kratkom vremenu u istoj kategoriji/odjelu čija zbirna vrijednost prelazi 1000 BAM | Sistem prepoznaje sumnjiv obrazac cijepanja računa i generiše upozorenje | Prošlo |
| UI-05 | Detekcija izostanka periodičnog troška (US-41) | Izostaviti unos periodičnog troška koji se očekuje 5. u mjesecu | Nakon isteka praga tolerancije sistem automatski kreira upozorenje "Izostao očekivani periodični trošak" | Prošlo |
| UI-06 | Centralni Dashboard (US-42) | Otvoriti Dashboard stranicu | Prikazuju se sve finansijske metrike, grafički prikazi i kartice strukturirano na jednom ekranu | Prošlo |
| UI-07 | Drill-down na grafikon (US-43) | Kliknuti na segment grafikona na Dashboardu | Sistem prikazuje listu pojedinačnih troškova koji čine odabranu sumu | Prošlo |
| UI-08 | Dodavanje komentara na trošak (US-44) | Odabrati trošak, kliknuti "Dodaj komentar", unijeti tekst i potvrditi | Komentar se uspješno snima u bazu sa autorom i vremenom, te se pojavljuje vizuelni indikator u tabeli | Prošlo |
| UI-09 | Pregled hronologije komentara (US-45) | Kliknuti na indikator komentara pored troška | Otvara se panel sa hronološkim pregledom svih komentara, autora i vremena unosa | Prošlo |
| UI-10 | AI asistent – pitanje o troškovima (US-46) | Upisati pitanje "Koji je najveći trošak ovog mjeseca?" u AI asistenta | AI asistent vraća tačan odgovor na osnovu podataka iz sistema bez izmišljenih informacija | Prošlo |
| UI-11 | AI Executive Summary (US-47) | Otvoriti Dashboard kao finansijski direktor | Automatski se generiše sažetak s informacijama o troškovima, budžetu i anomalijama | Prošlo |
| UI-12 | Dobavljači s najvećim rastom (US-48) | Otvoriti odgovarajući panel na Dashboardu | Prikazuje se lista dobavljača s procentom promjene troškova; novi dobavljači su jasno označeni | Prošlo |
| UI-13 | AI preporuke za optimizaciju (US-49) | Pregledati sekciju preporuka na Dashboardu | Sistem prikazuje obrazložene preporuke; kada nema dovoljno podataka, prikazuje odgovarajuću poruku | Prošlo |
| UI-14 | Procjena rizika od dobavljača (US-50) | Otvoriti panel rizika na Dashboardu | Sistem prikazuje upozorenje s procentom učešća i nivoom rizika (LOW/MEDIUM/HIGH) za dominantnog dobavljača | Prošlo |
| UI-15 | Pregled periodičnih troškova za provjeru (US-51) | Otvoriti Dashboard na periodu u kojem postoji neevidentirani periodični trošak | Sistem prikazuje listu s datumom posljednje evidencije i prosječnim iznosom; kada nema takvih troškova, prikazuje odgovarajuću poruku | Prošlo |
| UI-16 | Povrat budžeta na doradu bez komentara (US-52) | Kliknuti "Vrati na doradu" i pokušati potvrditi bez unosa komentara | Sistem ne dozvoljava povrat; prikazuje grešku validacije | Prošlo |
| UI-17 | Povrat budžeta na doradu s komentarom (US-52) | Kliknuti "Vrati na doradu", unijeti komentar i potvrditi | Status budžeta se mijenja u "Na doradi"; računovođa prima notifikaciju; komentar se bilježi u historiji | Prošlo |
| UI-18 | Ispravka i ponovna dostava budžeta (US-53) | Otvoriti budžet u statusu "Na doradi" kao kreator i kliknuti "Pošalji na odobravanje" | Komentar direktora je vidljiv; status se mijenja u "Na čekanju"; direktor prima notifikaciju | Prošlo |
| UI-19 | Zabrana ponovne dostave od drugog korisnika (US-53) | Pokušati submitovati doradu budžeta kao korisnik koji nije kreator | Sistem ne dozvoljava akciju | Prošlo |
| UI-20 | Historija komentara budžeta (US-54) | Otvoriti detalje budžeta koji je prošao kroz povrat i doradu | Prikazuje se hronološka historija komentara od najnovijeg, s autorom, datumom/vremenom i tipom akcije | Prošlo |

---

## 6. Veza sa User Stories iz Sprinta 10

| ID storyja | Naziv | Planirani sprint | Status u Sprintu 10 | Napomena |
|---|---|---:|---|---|
| US-38 | Vizuelno poređenje podataka | Sprint 10 | Završeno | Paralelni tabelarni prikaz selektovanih troškova |
| US-39 | Grafički prikaz poređenja podataka | Sprint 10 | Završeno | Grafički prikaz poređenja s izborom tipa grafikona |
| US-40 | Identifikacija sumnjivih obrazaca potrošnje | Sprint 10 | Završeno | Detekcija vanradnog vremena i cijepanja računa sa risk score-om |
| US-41 | Detekcija periodičnih troškova | Sprint 10 | Završeno | Automatsko upozorenje pri izostanku periodičnog troška |
| US-42 | Centralni interaktivni Dashboard | Sprint 10 | Završeno | Vizuelni prikaz ključnih metrika na jednom mjestu |
| US-43 | Bliži prikaz stanja | Sprint 10 | Završeno | Drill-down na listu troškova klikom na grafikon |
| US-44 | Dodavanje komentara | Sprint 10 | Završeno | Dodavanje tekstualnog komentara uz automatsko bilježenje autora i vremena |
| US-45 | Pregled komentara | Sprint 10 | Završeno | Hronološki pregled komentara s vizuelnim indikatorom uz trošak |
| US-46 | Inteligentni AI asistent za finansijska pitanja | Sprint 10 | Završeno | Odgovori na pitanja o troškovima, budžetima i anomalijama na prirodnom jeziku |
| US-47 | AI Executive Summary | Sprint 10 | Završeno | Automatski generisan sažetak finansijskog stanja na Dashboardu |
| US-48 | Identifikacija dobavljača sa najvećim rastom | Sprint 10 | Završeno | Prikaz rasta troškova po dobavljaču s procentom promjene |
| US-49 | AI preporuke za optimizaciju troškova | Sprint 10 | Završeno | Obrazložene preporuke za smanjenje troškova |
| US-50 | Procjena rizika zavisnosti od dobavljača | Sprint 10 | Završeno | Upozorenje s nivoom rizika (LOW/MEDIUM/HIGH) |
| US-51 | Pregled periodičnih troškova za provjeru | Sprint 10 | Završeno | Prikaz neevidentiranjih periodičnih troškova na Dashboardu |
| US-52 | Povrat budžeta na doradu | Sprint 10 | Završeno | Povrat uz obavezan komentar i notifikacija računovođi |
| US-53 | Ispravka i ponovna dostava budžeta | Sprint 10 | Završeno | Pregled komentara, ispravka i ponovna dostava na odobravanje |
| US-54 | Pregled historije komentara budžeta | Sprint 10 | Završeno | Hronološki prikaz svih komentara tokom procesa odobravanja |

---

## 7. Zaključak

U Sprintu 10 uspješno je implementiran i testiran opsežan skup novih funkcionalnosti koji sistem podiže na viši nivo analitičke i operativne zrelosti. Implementacija centralnog interaktivnog Dashboarda, inteligentnog AI asistenta za finansijska pitanja, AI Executive Summarya, preporuka za optimizaciju troškova, procjene rizika od dobavljača, detekcije sumnjivih obrazaca potrošnje, komentarisanja troškova, te kompletnog toka povrata i dorade budžeta čine sprint jednim od najobimnijih u projektu.

Uz to, vizuelno i grafičko poređenje troškova te detekcija periodičnih troškova doprinose potpunoj kontroli nad finansijskim tokovima. 

Svi automatizovani testovi (ukupno 446 test scenarija raspoređenih u 24 test fajla) uspješno prolaze, a code coverage na nivou cijelog projekta iznosi **97.85% Statements**, **85.34% Branches**, **96.50% Functions** i **98.82% Lines**, što znatno premašuje globalni prag od 80% definisan u `jest.config.cjs`. Ručnim UI testiranjem potvrđeno je ispravno ponašanje svih 17 završenih korisničkih priča kroz 20 scenarija testiranja, a RBAC zaštita garantuje sigurnost i restriktivnost cjelokupnog sistema.

