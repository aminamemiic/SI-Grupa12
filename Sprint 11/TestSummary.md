# Svrha izvještaja

Cilj izvještaja je prikazati konkretne i provjerljive rezultate testiranja sistema, vrste testova koje postoje u projektu, način pokretanja testova, broj testova koji prolaze, ručno testirane korisničke tokove, poznate testne propuste i dokaze o izvršenju testiranja. Dokument je pripremljen kao dio završne isporuke projekta i povezuje rezultate testiranja sa funkcionalnostima implementiranim kroz sprintove.

# Obuhvat testiranja

Testiranje obuhvata funkcionalnosti razvijene kroz sprintove od Sprinta 6 do finalne verzije sistema. Kroz ranije sprintove testirani su osnovni CRUD tokovi za troškove, uvoz podataka, budžeti, izvještaji, AI analiza, notifikacije, poređenje troškova, dashboard, komentari, periodični troškovi i budžetski workflow.

U Sprintu 6 testiranje je obuhvatilo CRUD operacije nad troškovima, validacije, zaštitu zaključanih troškova, RBAC kontrolu i regresionu provjeru UI toka za troškove.

| Metrika | Vrijednost |
|---|---|
| Test suites | 2 passed, 2 total |
| Ukupno test scenarija | 53 passed, 53 total |
| Statements coverage | 100% |
| Branches coverage | 97.72% |
| Functions coverage | 100% |
| Lines coverage | 100% |
| Vrijeme izvršavanja | 3.871 s |

U Sprintu 7 dodani su testovi za CSV/Excel uvoz, validaciju uvezenih redova, historiju uvoza i budžetske funkcionalnosti.

| Metrika | Vrijednost |
|---|---|
| Test suites | 6 passed, 6 total |
| Ukupno test scenarija | 134 passed, 134 total |
| Statements coverage (All files) | 93.8% |
| Branches coverage (All files) | 85.11% |
| Functions coverage (All files) | 98.03% |
| Lines coverage (All files) | 93.73% |
| Vrijeme izvršavanja | 5.437 s |

U Sprintu 8 testirani su Data Overview, filtriranje, sortiranje, historija uvoza, generisanje izvještaja i eksport u XLSX, CSV i PDF formate.

| Metrika | Vrijednost |
|---|---|
| Test suites | 9 passed, 9 total |
| Ukupno test scenarija | 168 passed, 168 total |
| Statements coverage (All files) | 94.2% |
| Branches coverage (All files) | 86.3% |
| Functions coverage (All files) | 98.2% |
| Lines coverage (All files) | 94.1% |
| Vrijeme izvršavanja | 6.182 s |

U Sprintu 9 proširen je obuhvat na AI detekciju anomalija, notifikacije, AI prijedloge kategorija, projekcije budžeta i pred-validaciju troškova.

| Metrika | Vrijednost |
|---|---|
| Test suites | 23 passed, 23 total |
| Ukupno test scenarija | 326 passed, 326 total |
| Statements coverage (All files) | 96.2% |
| Branches coverage (All files) | 89.1% |
| Functions coverage (All files) | 99.3% |
| Lines coverage (All files) | 96.1% |
| Vrijeme izvršavanja | 8.423 s |

U Sprintu 10 testirani su dashboard, AI asistent, Executive Summary, komentari, povrat budžeta na doradu, periodični troškovi, sumnjivi obrasci potrošnje i preporuke za optimizaciju.

| Metrika | Vrijednost |
|---|---|
| Test suites | 24 passed, 24 total |
| Ukupno test scenarija | 446 passed, 446 total |
| Statements coverage (All files) | 97.85% |
| Branches coverage (All files) | 92.77% |
| Functions coverage (All files) | 99.18% |
| Lines coverage (All files) | 97.79% |
| Vrijeme izvršavanja | 11.435 s |

# Vrste testiranja u projektu

U projektu postoje sljedeće vrste testiranja:

| Vrsta testiranja | Opis | Primjeri pokrivenih funkcionalnosti |
|---|---|---|
| Unit testovi | Testiraju pojedinačne funkcije, metode i servise izolovano od ostatka sistema. Cilj je provjeriti poslovnu logiku, validacije i proračune bez direktne zavisnosti od baze ili eksternih servisa. | Validacija troškova, proračun budžeta, AI analiza, detekcija anomalija, komentari i notifikacije. |
| Integracioni testovi | Testiranje kompletnog toka od HTTP zahtjeva do odgovora, uključujući middlewares, autorizaciju i bazu | Expense endpoints, Budget endpoints, Report endpoints, Notification endpoints i AI Analysis endpoints. |
| Regresioni testovi | Provjeravaju da nove izmjene nisu narušile ranije implementirane funkcionalnosti. Pokreću se nakon dodavanja novih modula ili većih izmjena u postojećem kodu. | CRUD troškova nakon dodavanja uvoza, budžeta, izvještaja, AI modula i notifikacija. |
| UI / ručno testiranje | Ručna provjera rada sistema kroz korisnički interfejs, uključujući forme, dugmad, validacione poruke, modale, tabele, grafikone i glavne korisničke tokove. | Kreiranje troška, uvoz fajla, filtriranje, dashboard, AI asistent, komentari i budžetski workflow. |
| Sigurnosno / RBAC testiranje | Provjerava da korisnici mogu pristupiti samo funkcionalnostima koje su dozvoljene njihovom rolom, te da su zaštićeni endpointi blokirani za neovlaštene korisnike. | CRUD troškova, izvještaji, budžeti, notifikacije, dashboard i zaštićeni endpointi. |

# Automatizovani backend testovi

Automatizovani backend testovi se pokreću iz backend direktorija projekta.

**Lokacija:**

```text
PROJEKAT/BACKEND
```

**Komanda za pokretanje testova sa coverage izvještajem:**

```bash
cmd.exe /c npm test -- --coverage
```

Konfiguracija testova nalazi se u fajlu `PROJEKAT/BACKEND/jest.config.cjs`. Test fajlovi su smješteni u direktoriju `PROJEKAT/BACKEND/tests/` sa konvencijom imenovanja `*.test.ts`.

# Rezultat automatizovanih testova u finalnoj verziji

Prema posljednjem izvršenju testova u finalnoj verziji sistema:

| Metrika | Rezultat |
|---|---|
| Test Suites | 24 passed / 24 total |
| Tests | 459 passed / 459 total |
| Snapshots | 0 total |
| Vrijeme izvršavanja | 13.58 s |
| Status | Svi testovi prolaze |

Finalni coverage:

| Coverage kategorija | Rezultat |
|---|---|
| Statements | 95.8% |
| Branches | 83.4% |
| Functions | 93.99% |
| Lines | 96.73% |

Svi rezultati prelaze globalni coverage prag od 80% koji se koristio u ranijim sprintovima za statements, branches, functions i lines coverage. Raniji Testing Proof dokumenti također pokazuju da je coverage kroz sprintove kontinuirano prelazio definisani prag.

<p align="center">
  <img width="1731" height="995" alt="Screenshot 2026-06-08 120909" src="https://github.com/user-attachments/assets/69495cab-07b0-40b1-a420-3e63db9e3402" />
</p>

<p align="center">
  <b>Slika 1. Dokaz finalnog pokretanja testova</b>
</p>

# Ručno UI testiranje

Pored automatizovanih backend testova, za svaki sprint provedeno je ručno testiranje. Ručno testiranje je rađeno kroz korisnički interfejs, jer određeni tokovi zahtijevaju provjeru stvarnog ponašanja aplikacije, prikaza poruka, modala, dugmadi, grafikona i workflowa između korisničkih rola.

| Scenarij | Koraci | Očekivani rezultat | Status |
|---|---|---|---|
| Pregled i CRUD troškova | Otvoriti listu troškova, kreirati novi trošak, urediti postojeći trošak i pokrenuti brisanje. | Lista troškova se ispravno prikazuje i ažurira nakon svake akcije. Sistem validira unesene podatke i ne dozvoljava izmjenu ili brisanje zaključanih troškova. | Prošlo |
| RBAC kontrola akcija | Prijaviti se korisnicima različitih rola i pokušati izvršiti CRUD akcije, pristupiti izvještajima, dashboardu i zaštićenim modulima. | Akcije i stranice su dostupne samo korisnicima sa odgovarajućim rolama, dok se neovlaštenim korisnicima pristup blokira. | Prošlo |
| Admin pregled korisničkih rola | Prijaviti se kao administrator i otvoriti pregled korisničkih rola kroz Keycloak integraciju. | Administrator može pregledati role korisnika, a prikazane role su usklađene sa backend autorizacijom. | Prošlo |
| Import troškova iz fajla | Uploadovati validan CSV, XLS ili XLSX fajl i pokrenuti preview importovanja. | Sistem prikazuje redove za obradu, broj validnih i nevalidnih redova te omogućava potvrdu samo validnih podataka. | Prošlo |
| Upload nepodržanog fajla | Odabrati fajl koji nije u podržanom CSV, XLS ili XLSX formatu. | Sistem odbija fajl i prikazuje odgovarajuću validacionu poruku. | Prošlo |
| Validacija redova pri importu | Uploadovati fajl sa praznim obaveznim poljima ili neispravnim vrijednostima. | Neispravni redovi su označeni greškom i ne biraju se automatski za import. | Prošlo |
| Potvrda validnih redova importovanog fajla | Odabrati validne redove iz preview prikaza i potvrditi import. | Validni troškovi se upisuju u sistem, a korisniku se prikazuje rezultat uvoza. | Prošlo |
| Historija uvoza | Otvoriti historiju importovanih fajlova i pregledati detalje prethodnog uvoza. | Prikazuju se status importa, broj redova, korisnik, vrijeme uvoza i greške po pojedinačnim redovima. | Prošlo |
| Planiranje budžeta | Kreirati novi budžet sa validnim podacima i pregledati ga u listi budžeta. | Budžet se uspješno sprema i prikazuje u listi sa ispravnim podacima. | Prošlo |
| Validacija budžeta | Pokušati sačuvati budžet bez obaveznih polja ili sa neispravnim periodom. | Sistem odbija spremanje budžeta i prikazuje odgovarajuću grešku. | Prošlo |
| Odobravanje i odbijanje budžeta | Prijaviti se kao finansijski direktor i promijeniti status budžeta. | Budžet dobija status odobren ili odbijen, a evidentira se korisnik koji je izvršio akciju. | Prošlo |
| Povrat budžeta na doradu bez komentara | Kliknuti na opciju za povrat budžeta na doradu i pokušati potvrditi akciju bez komentara. | Sistem ne dozvoljava povrat budžeta na doradu bez obaveznog komentara. | Prošlo |
| Povrat budžeta na doradu s komentarom | Finansijski direktor vraća budžet na doradu uz unos komentara. | Status budžeta prelazi u “Na doradi”, komentar se bilježi u historiji i šalje se notifikacija računovođi. | Prošlo |
| Ispravka i ponovna dostava budžeta | Računovođa otvara budžet u statusu “Na doradi”, ispravlja podatke i ponovo ga šalje na odobravanje. | Status budžeta prelazi u “Na čekanju”, komentar direktora je vidljiv, a direktor dobija notifikaciju. | Prošlo |
| Historija komentara budžeta | Otvoriti detalje budžeta koji je prošao kroz povrat na doradu i ponovnu dostavu. | Prikazuje se hronološka historija komentara sa autorom, datumom/vremenom i tipom akcije. | Prošlo |
| Data Overview pregled | Otvoriti Data Overview modul i pregledati prikazane sekcije. | Prikazuju se referentne tabele, broj zapisa, agregacije i finansijski podaci. | Prošlo |
| Modalni detalji entiteta | Kliknuti na red tabele, npr. trošak, dobavljač, projekat ili budžet. | Otvara se modal sa potpunim atributima odabranog zapisa. | Prošlo |
| Pretraga, filtriranje i sortiranje | Kombinovati tekstualnu pretragu, filtere i sortiranje. | Tabele se ažuriraju prema zadatim kriterijima. | Prošlo |
| Generisanje izvještaja | Odabrati period izvještaja i kliknuti na opciju za generisanje izvještaja. | Prikazuju se finansijski sažeci, agregacije, iskorištenost budžeta i relevantni troškovi. | Prošlo |
| Validacija perioda izvještaja | Postaviti datum završetka prije početnog datuma. | Sistem odbija generisanje izvještaja i prikazuje validacionu grešku. | Prošlo |
| Izvoz izvještaja | Generisati izvještaj i pokrenuti eksport u XLSX, CSV i PDF formatu. | Datoteke se preuzimaju i sadrže očekivane podatke u ispravnom formatu. | Prošlo |
| Format datuma | Pregledati datume u tabelama, modalima, filterima i izvezenim dokumentima. | Datumi su dosljedno prikazani u formatu `dd.mm.yyyy`. | Prošlo |
| Selekcija troškova za poređenje | Označiti više troškova checkboxovima u Data Overview tabeli. | Sistem pamti selekciju i prikazuje broj odabranih stavki sa opcijom za poređenje. | Prošlo |
| Poređenje troškova | Selektovati više troškova i kliknuti “Uporedi”. | Otvara se tabelarno/grafičko poređenje selektovanih stavki. | Prošlo |
| Grafički prikaz poređenja | Pokrenuti poređenje i odabrati grafički prikaz, npr. bar ili line chart. | Grafikon se prikazuje bez grešaka i vizuelno prikazuje razlike između selektovanih troškova. | Prošlo |
| Poređenje planiranog i stvarnog stanja | Otvoriti budžet ili izvještaj koji prikazuje planned vs actual stanje. | Progress bar prikazuje iskorištenost budžeta, a prekoračenje se označava crvenim indikatorom. | Prošlo |
| AI pred-validacija troška | Unijeti neuobičajeno visok iznos troška. | Sistem prikazuje upozorenje nakon debounce validacije. | Prošlo |
| AI prijedlog kategorije troška | Unijeti naziv troška i kliknuti na opciju “AI Prijedlog”. | Sistem predlaže odgovarajuću kategoriju troška sa stepenom pouzdanosti. | Prošlo |
| Dubinska AI analiza trendova | Kliknuti na opciju za pokretanje AI analize na Dashboardu. | Sistem generiše analizu trendova, predviđanja budžeta i preporuke na osnovu dostupnih podataka. | Prošlo |
| Notifikacija o anomaliji | Kreirati ili analizirati trošak koji sistem detektuje kao anomaliju. | Sistem kreira notifikaciju sa opisom anomalije, stepenom ozbiljnosti i preporučenom akcijom. | Prošlo |
| Sumnjivo vrijeme unosa troška | Unijeti trošak van radnog vremena. | Sistem prepoznaje neuobičajeno vrijeme unosa, označava unos i povećava risk score. | Prošlo |
| Cijepanje računa | Unijeti više manjih troškova u kratkom vremenu u istoj kategoriji ili odjelu. | Sistem prepoznaje sumnjiv obrazac cijepanja računa i generiše upozorenje. | Prošlo |
| Izostanak periodičnog troška | Provjeriti dashboard u periodu kada očekivani periodični trošak nije evidentiran. | Sistem prikazuje upozorenje o izostalom periodičnom trošku. | Prošlo |
| Centralni Dashboard | Otvoriti Dashboard stranicu nakon prijave. | Prikazuju se KPI kartice, finansijske metrike, grafikoni, trendovi i sažeci. | Prošlo |
| Drill-down sa grafikona | Kliknuti na segment grafikona na Dashboardu. | Sistem prikazuje listu pojedinačnih troškova koji čine odabranu sumu. | Prošlo |
| AI Executive Summary | Otvoriti Dashboard kao ovlašteni korisnik. | Sistem automatski prikazuje sažetak najvažnijih informacija o troškovima, budžetu i anomalijama. | Prošlo |
| AI asistent | Postaviti pitanje o troškovima, budžetima, dobavljačima ili anomalijama. | AI asistent vraća odgovor na osnovu dostupnih podataka, bez izmišljanja informacija. | Prošlo |
| Dodavanje komentara na trošak | Otvoriti trošak, kliknuti “Dodaj komentar”, unijeti tekst i potvrditi. | Komentar se sprema sa autorom i vremenom, a uz trošak se prikazuje indikator komentara. | Prošlo |
| Pregled komentara na trošku | Kliknuti na indikator komentara pored troška. | Prikazuje se hronološki pregled komentara sa autorom i vremenom unosa. | Prošlo |
| Dobavljači sa najvećim rastom | Otvoriti odgovarajući panel na Dashboardu. | Sistem prikazuje dobavljače sa najvećim rastom troškova i procenat promjene. | Prošlo |
| Procjena rizika od dobavljača | Otvoriti panel rizika dobavljača na Dashboardu. | Sistem prikazuje upozorenje kada jedan dobavljač čini značajan udio ukupne potrošnje, uz nivo rizika. | Prošlo |
| AI preporuke za optimizaciju | Pregledati sekciju AI preporuka na Dashboardu. | Sistem prikazuje obrazložene preporuke za optimizaciju ili poruku kada nema dovoljno podataka. | Prošlo |

Ovi scenariji su objedinjeni iz Testing Proof dokumenata za sprintove 6–10, u kojima su kroz svaki sprint evidentirani UI i regresioni testovi za implementirane funkcionalnosti.

# Ključni korisnički tokovi provjereni testiranjem

Tokom završnog testiranja provjereni su ključni korisnički tokovi koji predstavljaju osnovni način korištenja sistema. Fokus testiranja bio je na tome da korisnik može izvršiti kompletne poslovne akcije kroz aplikaciju, a ne samo da se pojedinačne stranice uspješno otvaraju. Ključni korisnički tokovi provjereni su kroz kombinaciju automatizovanih backend testova i ručnog testiranja korisničkog interfejsa. Provjereni su sljedeći tokovi:

- **Prijava, odjava i kontrola pristupa korisnika**  
  Provjeren je tok prijave korisnika u sistem, odjave iz sistema i pristupa funkcionalnostima u skladu sa dodijeljenom korisničkom rolom. Testirano je da korisnici mogu koristiti samo module i akcije koje su dozvoljene njihovom rolom, uključujući CRUD akcije, izvještaje, budžete, dashboard i zaštićene stranice.
  
- **Upravljanje troškovima**  
  Provjeren je kompletan tok rada sa troškovima, uključujući pregled liste troškova, kreiranje novog troška, izmjenu postojećeg troška, validaciju unesenih podataka i brisanje troška. Posebno je testirano da se zaključani troškovi ne mogu mijenjati ili obrisati, te da se lista troškova ispravno ažurira nakon svake akcije.
  
- **Uvoz troškova iz fajla**  
  Provjeren je tok učitavanja CSV, XLS i XLSX fajlova, prikaz preview-a uvoza, označavanje validnih i nevalidnih redova, potvrda importovanja i pregled historije importovanih fajlova.

- **Planiranje, odobravanje i dorada budžeta**  
  Testirano je kreiranje budžeta, pregled postojećih budžeta, validacija budžetskih podataka, projekcija potrošnje i poređenje planiranog i stvarnog stanja. Posebno je provjeren tok odobravanja budžeta, uključujući odobravanje, odbijanje, povrat na doradu uz obavezan komentar, ponovnu dostavu budžeta i pregled historije komentara. Testirano je i da sistem ne dozvoljava povrat budžeta na doradu bez komentara, da se status budžeta ispravno mijenja i da se šalju odgovarajuće notifikacije.

- **AI analiza i detekcija odstupanja**  
  Provjereno je da sistem može detektovati anomalije, duple troškove, sumnjive obrasce potrošnje i izostanak periodičnih troškova. Testirano je i da sistem prikazuje odgovarajuća upozorenja i notifikacije sa opisom problema i preporučenom akcijom.

- **Notifikacije i komentari**  
  Provjereno je kreiranje i prikaz notifikacija za anomalije, budžete i druge sistemske događaje. Također je testirano dodavanje komentara na troškove i budžete, kao i prikaz autora, vremena i historije komentara.

- **Izvještaji i finansijske metrike**  
  Testirano je generisanje finansijskih izvještaja, pregled agregiranih podataka, filtriranje po periodu i eksport izvještaja u XLSX, CSV i PDF formatu.

- **Data Overview i poređenje troškova**  
  Provjeren je pregled finansijskih podataka kroz Data Overview modul, uključujući pretragu, filtriranje, sortiranje, modalne detalje entiteta i poređenje selektovanih troškova u tabelarnom i grafičkom prikazu.

- **Dashboard i AI asistent**  
  Testiran je centralni dashboard sa KPI karticama, grafikonima, trendovima, drill-down prikazom i Executive Summary sekcijom. Provjeren je i AI asistent kroz pitanja o troškovima, budžetima, dobavljačima i anomalijama, pri čemu sistem odgovara na osnovu dostupnih podataka.


# Poznati testni propusti i ograničenja testiranja

U trenutnom stanju projekta nema poznatih padajućih automatizovanih testova. Svi backend testovi prolaze, što pokazuje da su ključne servisne, integracione i poslovne funkcionalnosti stabilne u okviru postojećeg testnog okruženja. Ipak, postoje određena ograničenja u širini testne pokrivenosti koja su evidentirana kao poznati testni propusti.

| Ograničenje | Objašnjenje | Uticaj / preporuka |
|---|---|---|
| Ograničena automatizovana frontend pokrivenost | Frontend dio aplikacije ima manji broj automatizovanih testova u odnosu na backend. Većina kompleksnih UI tokova, kao što su dashboard, modali, poređenje troškova, notifikacije, komentari i budžetski workflow, provjerena je ručno. | Za budući razvoj preporučuje se dodati više komponentnih i UI testova. |
| Nedostatak potpunih end-to-end testova | Ne postoje automatizovani E2E testovi koji prolaze kroz cijeli korisnički tok od prijave korisnika, preko akcija u interfejsu, do potvrde promjena na backendu i u bazi podataka. | Kompletni korisnički scenariji su trenutno većinom provjereni ručno. Preporučuje se uvođenje Cypress, Playwright ili sličnog alata. |
| RBAC i autentikacija nisu pokriveni kroz kompletne E2E scenarije | RBAC je pokriven kroz backend testove, mock pristup i ručnu provjeru korisničkih rola, ali ne postoje automatizovani browser testovi za svaku rolu. | Za produkcijski nivo sistema preporučuje se dodati sigurnosne E2E scenarije po rolama. |
| AI integracije su testirane kroz mock/fallback logiku | AI funkcionalnosti su testirane kroz servisnu logiku, fallback ponašanje i mockovane odgovore. Takav pristup omogućava stabilne testove, ali ne garantuje identično ponašanje stvarnog eksternog AI servisa. | Kvalitet AI odgovora, posebno kod AI asistenta i preporuka, potrebno je dodatno ručno provjeravati u demo scenarijima. |
| Nisu urađeni load ili stress testovi | Sistem je funkcionalno testiran, ali nije posebno mjereno ponašanje pri velikom broju korisnika, velikom broju troškova, velikim import fajlovima ili čestom pokretanju AI analiza i izvještaja. | Za nastavak projekta preporučuje se uvođenje performansnih testova nad većim datasetima. |

Navedeni testni propusti ne predstavljaju trenutno blokirajuće greške, jer svi postojeći automatizovani backend testovi prolaze. Oni prvenstveno pokazuju oblasti koje bi trebalo unaprijediti ako se projekat nastavi: proširenje frontend automatizovanih testova, uvođenje potpunih E2E scenarija, detaljnije sigurnosno testiranje po rolama, testiranje stvarnih AI integracija, performansno testiranje.
