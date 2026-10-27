# Finalni izvještaj o projektu

---

## 1. Svrha projekta

Svrha projekta je razvoj web aplikacije koja finansijskom menadžeru i finansijskim timovima omogućava centralizovano praćenje, analizu, kontrolu troškova poslovanja i budžeta uz pomoć umjetne inteligencije.

Sistem rješava ključni problem ručnog i vremenski zahtjevnog procesa analize troškova — umjesto toga, korisnicima pruža automatsku klasifikaciju troškova po kategorijama, odjelima, projektima i vremenskim periodima, kao i pravovremeno otkrivanje odstupanja od planiranog budžeta i neuobičajenih obrazaca potrošnje.

Krajnji cilj je pružiti menadžeru i finansijskim timovima jasne, brze i pouzdane uvide u finansijsko stanje firme kroz automatski generisana upozorenja, sažetke i izvještaje — čime se smanjuje rizik od prekoračenja budžeta, poboljšava finansijska disciplina i podržava donošenje odluka zasnovano na podacima.

---

## 2. Problem koji sistem rješava

Firme svakodnevno generišu veliki broj troškova kroz različite odjele, projekte i kategorije. Praćenje i analiza tih troškova najčešće se provode ručno — putem tabela, nepovezanih softverskih alata ili izoliranih finansijskih sistema — što rezultira sporim, fragmentiranim i procesima koji su podložni greškama.

Konkretni problemi s kojima se firme suočavaju uključuju:

- **Rasutost podataka** — podaci o troškovima dolaze iz različitih izvora (Excel tabele, PDF fakture, ERP sistemi) i nisu objedinjeni na jednom mjestu
- **Kasno otkrivanje odstupanja** — prekoračenja budžeta se uočavaju tek na kraju mjeseca ili kvartala, kada je već teško poduzeti korektivne mjere
- **Nedostatak automatskih upozorenja** — ne postoji mehanizam koji pravovremeno obavještava odgovorne osobe o neuobičajenim ili zabrinjavajućim obrascima potrošnje
- **Ograničen uvid za rukovodstvo** — menadžment nema brz, pregledan i pouzdan pregled finansijskog stanja firme u realnom vremenu
- **Ručna klasifikacija troškova** — kategorizacija troškova po odjelima, projektima i vrstama troši značajno radno vrijeme i podložna je ljudskim greškama

Ovaj sistem rješava navedene probleme kroz centralizovano prikupljanje podataka o troškovima, njihovu automatsku klasifikaciju i AI-podržanu analizu — omogućavajući pravovremeno otkrivanje odstupanja, generisanje upozorenja i pružanje jasnih finansijskih uvida rukovodstvu.

---

## 3. Glavne korisničke uloge

- **Administrativni radnik** — zadužen za unos i ažuriranje podataka o troškovima
- **Finansijski direktor** — odgovoran za donošenje ključnih finansijskih odluka
- **Glavni računovođa** — odgovoran za upravljanje računovodstvom i podacima

---

## 4. Glavne implementirane funkcionalnosti sistema

1. **Planiranje budžeta** — unos i upravljanje planiranim troškovima koji služe kao osnova za poređenje sa stvarnim troškovima
2. **Unos troškova** — ručni unos stvarnih, pristiglih troškova od strane uposlenih
3. **Uvoz podataka** — uvoz CSV i Excel dokumenata te prepoznavanje teksta putem OCR tehnologije, kako bi se izbjegao ručni unos
4. **AI analiza** — automatska analiza troškova, trendova, budžetskih odstupanja i neuobičajenih obrazaca potrošnje
5. **Pregled podataka** — vizualni prikaz planiranih i stvarnih troškova putem grafikona i tabelarnih prikaza
6. **Poređenje podataka** — ručno poređenje troškova po kategorijama, vremenskim periodima i odjelima
7. **Generisanje upozorenja** — automatsko obavještavanje odgovornih osoba o anomalijama i odstupanjima koje je AI uočio
8. **Izvještavanje** — izvoz finansijskih podataka i generisanje izvještaja za rukovodstvo
9. **Evidencija komentara** — pisanje i pregled komentara odgovornih osoba
10. **Upravljanje korisnicima** — kontrola pristupa s različitim nivoima ovlaštenja
11. **Autentifikacija** — prijava i odjava korisnika iz sistema

---

## 5. Pregled rada kroz sprintove

- **Sprint 5** — Implementirana prijava i odjava korisnika, dodjela i ograničenje pristupa prema ulogama (RBAC), te ručni unos troškova s validacijom i kategorizacijom po atributima (kategorija, projekat, odjel).
- **Sprint 6** — Implementirane osnovne operacije nad troškovima (kreiranje, ažuriranje, brisanje), kontrola pristupa CRUD operacijama prema ulozi, te pregled i izmjena korisničkih uloga od strane administratora.
- **Sprint 7** — Implementiran pregled liste i detaljan prikaz pojedinačnih zapisa, te uvoz troškova iz CSV i Excel fajlova s automatskom obradom i validacijom uvezenih podataka.
- **Sprint 8** — Implementirani filtriranje, pretraga i sortiranje podataka, generisanje izvještaja po vremenskim periodima s mogućnošću exporta, kreiranje, pregled i uređivanje budžeta po kategorijama, odjelima i vremenskim periodima.
- **Sprint 9** — Implementirana automatska detekcija anomalija pri unosu, dubinska analiza trendova, predviđanje potrošnje do kraja perioda, pametno grupisanje troškova putem AI sugestija, odabir i poređenje podataka po kategorijama, te generisanje notifikacija i sažetaka o uočenim anomalijama.
- **Sprint 10** — Implementirani vizuelno i grafičko poređenje podataka, centralni interaktivni dashboard s ključnim metrikama, identifikacija sumnjivih obrazaca i periodičnih troškova, te dodavanje i pregled komentara uz pojedinačne troškove.

---

## 6. Prikaz završenih, djelimično završenih i nezavršenih stavki 

### 6.1 Sažetak statusa

| Metrika | Vrijednost |
|:---|:---|
| Ukupan broj stavki | 46 |
| Done | 44 |
| Deferred / ostavljeno za budući rad | 2 |
| Partially Done | 0 |
| Not Done | 0 |


### 6.2 Završene stavke (Done)

#### Infrastruktura i tehničke postavke

| ID | Stavka | Opis |
|:---|:---|:---|
| 1 | Isplanirati izgled baze podataka | Organizacija baze podataka za budžete, troškove, korisnike, kategorije, odjele, projekte i vremenske periode. |
| 3 | GDPR & Security | Osigurana zaštita osjetljivih finansijskih podataka. |
| 8 | Postavljanje razvojnog okruženja | Konfiguracija Docker-a, baze podataka i backend frameworka. |
| 9 | Definisanje API ugovora | Dokumentacija ruta između frontenda i backenda. |
| 12 | Keycloak integracija | Integracija Keycloak identity providera za autentifikaciju i upravljanje korisničkim identitetima. |
| 13 | Docker Compose – produkcijska konfiguracija | Konfiguracija produkcijskog okruženja. |

#### Autentifikacija i upravljanje korisnicima

| ID | Stavka | Opis |
|:---|:---|:---|
| 5 | Sign in | Sistem za autentifikaciju korisnika. |
| 6 | Sign out | Funkcionalnost odjave iz sistema. |
| 7 | Upravljanje korisnicima (RBAC) | Regulisanje različitih nivoa pristupa kroz role korisnika. |

#### Upravljanje troškovima

| ID | Stavka | Opis |
|:---|:---|:---|
| 4 | Unos troškova | Sistem za ručni unos stvarnih pristiglih troškova. |
| 11 | Implementacija CRUD za troškove | Osnovne operacije nad tabelom troškova u bazi. |
| 16 | Uvoz podataka | Uvoz troškova iz CSV, XLS i XLSX fajlova s preview-om, obradom, validacijom i historijom uvoza. |
| 21 | Evidencija komentara | Dodavanje i pregled komentara uz troškove. |
| 24 | Pretraga i filtriranje troškova | Pretraga po nazivu, opisu i dobavljaču; filtriranje po kategoriji, odjelu, projektu, statusu, valuti i iznosu. |
| 25 | Sortiranje podataka | Sortiranje liste troškova i budžeta po svim kolonama. |
| 36 | Dodavanje komentara | Tekstualni komentar na pojedinačni trošak s bilježenjem autora i vremena. |
| 37 | Pregled komentara | Hronološki prikaz komentara uz trošak s vizuelnim indikatorom u tabeli. |

#### Upravljanje budžetima

| ID | Stavka | Opis |
|:---|:---|:---|
| 14 | Planiranje budžeta | Kreiranje, pregled, uređivanje, odobravanje i odbijanje budžeta. |
| 44 | Povrat budžeta na doradu | Finansijski direktor vraća budžet uz obavezan komentar i notifikaciju računovođi. |
| 45 | Ispravka i ponovna dostava budžeta | Računovođa pregledava komentar, ispravlja budžet i ponovo šalje na odobravanje. |
| 46 | Pregled historije komentara budžeta | Hronološki prikaz svih komentara u procesu odobravanja s autorom, vremenom i tipom akcije. |

#### Pregled i poređenje podataka

| ID | Stavka | Opis |
|:---|:---|:---|
| 15 | Pregled podataka | Pregled liste troškova i osnovnih detalja za odgovorne korisnike. |
| 18 | Poređenje podataka | Ručno poređenje po kategorijama i stvarnih naspram planiranih troškova kroz modul izvještaja. |
| 26 | Odabir podataka za poređenje | Checkbox selekcija pojedinačnih troškova iz Data Overview tabele za dinamičko poređenje. |
| 27 | Poređenje po kategorijama i odjelima | Side-by-side uporedna matrica po kategoriji, odjelu i periodu. |
| 28 | Poređenje planiranih i stvarnih troškova | Variance Analysis modul s progress barovima i iskoristivošću budžeta. |
| 29 | Predviđanje potrošnje do kraja perioda | Backend i frontend projekcija budžeta na osnovu brzine trošenja u tekućem mjesecu. |
| 30 | Vizuelno poređenje podataka (tabela) | Paralelni prikaz odabranih troškova jedan pored drugog. |
| 31 | Grafički prikaz poređenja podataka | Grafički prikaz odabranih podataka s mogućnošću izbora tipa grafikona (bar, line, pie). |

#### Izvještaji

| ID | Stavka | Opis |
|:---|:---|:---|
| 20 | Izvještaj | Generisanje i export sažetih i detaljnih izvještaja u XLSX, CSV i PDF formatima. |

#### AI funkcionalnosti

| ID | Stavka | Opis |
|:---|:---|:---|
| 2 | Istraživanje o AI dijelu | Istraživanje koncepta AI sistema za analizu troškova, trendova, budžetskih odstupanja i anomalija. |
| 17 | AI analiza | AI prijedlog optimalne kategorije pri unosu troška i real-time pred-validacija s detekcijom anomalija (Z-score, IQR, duplikati, prekoračenja). |
| 19 | Generisanje upozorenja | Real-time upozorenja o odstupanjima, notifikacije o duplikatima i interaktivno rješavanje potencijalnih duplikata. |
| 32 | Identifikacija sumnjivih obrazaca potrošnje | Detekcija neuobičajenih termina unosa i anomalija u ponašanju korisnika s generisanjem upozorenja. |
| 33 | Detekcija periodičnih troškova | Automatsko prepoznavanje periodičnih troškova i upozorenje kada očekivani trošak izostane. |
| 38 | Inteligentni AI asistent | Chatbot za pitanja o troškovima, budžetima i anomalijama na prirodnom jeziku. |
| 39 | AI Executive Summary | Automatski generisan sažetak ključnih finansijskih informacija na Dashboardu. |
| 40 | Identifikacija dobavljača s najvećim rastom | Prikaz dobavljača s najvećim rastom troškova s postotkom promjene i razlikovanjem novih od postojećih. |
| 41 | AI preporuke za optimizaciju troškova | AI preporuke s obrazloženjem za smanjenje troškova na osnovu historijskih podataka. |
| 42 | Procjena rizika zavisnosti od dobavljača | Upozorenje kada jedan dobavljač učestvuje značajnim procentom ukupne potrošnje, s prikazom nivoa rizika. |
| 43 | Pregled periodičnih troškova za provjeru | Prikaz periodičnih troškova koji nisu evidentirani u očekivanom periodu na Dashboardu. |

#### Dashboard

| ID | Stavka | Opis |
|:---|:---|:---|
| 10 | Razvoj osnovnog UI Dashboarda | Kreiranje osnovnog korisničkog interfejsa za pregled sistema. |
| 34 | Centralni interaktivni Dashboard | Vizuelni prikaz ključnih finansijskih metrika na jednom mjestu s grafikonima i karticama. |
| 35 | Bliži prikaz stanja | Klik na grafikon otvara listu pojedinačnih troškova koji čine prikazanu sumu. |

### 6.3 Odložene stavke (Deferred)

#### Integracija OCR biblioteke — ID 22

| Atribut | Vrijednost |
|:---|:---|
| Tip | Technical Task |
| Prioritet | Medium |
| Procjena složenosti | 8 story points |
| Status | Deferred / ostavljeno za budući rad |

**Obrazloženje:** Tokom razvoja se pokazalo da korisnici uvoz podataka pretežno vrše kroz strukturirane CSV i Excel fajlove, što u potpunosti pokriva potrebe sistema. Uvoz skeniranih dokumenata i računa nije bio eksplicitno zahtijevan od strane Product Ownera tokom sprint reviewova, te je stavka odgođena u korist prioritetnijih funkcionalnosti — AI analize, poređenja podataka i notifikacijskog sistema.

#### Redis queue integracija — ID 23

| Atribut | Vrijednost |
|:---|:---|
| Tip | Technical Task |
| Prioritet | Medium |
| Procjena složenosti | 5 story points |
| Status | Deferred / ostavljeno za budući rad |

**Obrazloženje:** Tokom razvoja AI mikroservisa se pokazalo da FastAPI-jev ugrađeni mehanizam `BackgroundTasks` u potpunosti zadovoljava potrebe sistema za asinhronu obradu AI zadataka pri trenutnom obimu podataka. Uvođenje Redisa i zasebnog workera dodalo bi značajnu infrastrukturnu kompleksnost bez mjerljive koristi za sistem interne aplikacije s ograničenim brojem korisnika. Ova odluka je evidentirana u Decision Logu u Sprintu 9.

---

## 7. Glavne tehničke odluke

### 7.1 Autentifikacija i sigurnost

| ID | Odluka | Odabrano rješenje |
|:---|:---|:---|
| DEC-001 | Autentifikacija korisnika | Keycloak |
| DEC-002 | Provjera identiteta na backendu | JWT tokeni |
| DEC-003 | Validacija JWT tokena | JWKS endpoint (RS256) |
| DEC-004 | Login flow na frontendu | Authorization Code + PKCE |
| DEC-005 | Session management | JWT + httpOnly session cookie |
| DEC-006 | Provjera prava korisnika | Role iz JWT tokena + RBAC middleware |
| DEC-007 | Korisničke role | Administrator, Glavni računovođa, Finansijski direktor, Administrativni radnik |
| DEC-008 | Zaštita API ruta | Sve `/api` rute zaštićene `requireAuthentication` middlewareom |
| DEC-012 | Zaključavanje troškova | Status `ZAKLJUCAN` postavlja se automatski triggerom; izmjena blokirana na servisnom sloju (HTTP 400) |

- PKCE flow ne zahtijeva čuvanje client secreta u browseru — sigurniji za frontend aplikacije
- CORS propušta zahtjeve isključivo s definisanog `FRONTEND_ORIGIN`
- Backend provjerava `issuer`, `audience`, algoritam i javni ključ pri svakoj validaciji tokena

### 7.2 Baza podataka

| ID | Odluka | Odabrano rješenje |
|:---|:---|:---|
| DEC-009 | Inicijalizacija strukture baze | Automatsko pokretanje SQL migracije pri startu backenda |
| DEC-010 | Definisanje tabela i pravila | Raw SQL migracije (umjesto ORM-a) |
| DEC-011 | Zaključavanje troškova | Status `ZAKLJUCAN` u koloni `status_validacije` |
| DEC-018 | Brisanje troškova | Hard delete — trajno brisanje retka iz tabele |
| DEC-048 | Historija komentara budžeta | Zasebna relacijska tablica `budzet_komentari` |
| DEC-051 | Komentari uz troškove | Zasebna relacijska tablica `troskovi_komentari` |

- Raw SQL omogućava direktno provođenje poslovnih pravila kroz constrainte i triggere na nivou baze
- Brisanje troškova s komentarima blokirano je na servisnom sloju radi integriteta podataka
- Obje historijske tablice čuvaju: autor, timestamp, tip akcije — omogućavaju audit trail i hronološki prikaz

### 7.3 API i backend

| ID | Odluka | Odabrano rješenje |
|:---|:---|:---|
| DEC-013 | HTTP metoda za izmjenu troška | PUT — potpuna zamjena svih polja |
| DEC-014 | Zaštita zaključanih troškova | Provjera `statusValidacije === 'ZAKLJUCAN'` u servisnom sloju |
| DEC-015 | Validacija podataka troška | Servisni sloj (`validateCreateExpense`) + SQL ograničenja u bazi |
| DEC-016 | RBAC na CRUD endpointima | `requireAuthentication` + `requireRole` za POST, PUT, DELETE |
| DEC-017 | Keširanje liste troškova | Kratkotrajni cache od 30 sekundi uz invalidaciju nakon izmjena |

- PUT eliminira potrebu za praćenjem parcijalnih izmjena; sva polja troška obavezna su pri svakom zahtjevu
- Dvostruka validacija (servis + baza) osigurava jasne poruke grešaka korisniku i integritet podataka

### 7.4 Uvoz podataka

| ID | Odluka | Odabrano rješenje |
|:---|:---|:---|
| DEC-019 | Podržani formati uvoza | CSV, XLS, XLSX |
| DEC-020 | Tok uvoza | Dvostepeni: preview → potvrda |
| DEC-021 | Validacija uvezenih redova | Servisna validacija + SQL ograničenja |
| DEC-022 | Mapiranje referentnih podataka | Podržano mapiranje po ID-u i po nazivu |
| DEC-023 | Evidencija historije uvoza | Pohrana u bazi (status, broj redova, greške) |
| DEC-031 | Detaljna historija s greškama | Trajna pohrana u bazi sa JSON kolonama za greške i uvezene redove |

- Dvostepeni uvoz daje korisniku punu kontrolu: nevalidni redovi označeni su u preview prikazu i ne biraju se automatski
- Historija uvoza omogućava dugoročni audit trail; administrator može pregledati greške po redovima za svaki prošli uvoz

### 7.5 Izvještaji i eksport

| ID | Odluka | Odabrano rješenje |
|:---|:---|:---|
| DEC-027 | Generisanje Excel izvještaja | Backend pomoću `xlsx` biblioteke — višelistni fajl (Sažetak, Kategorije, Odjeli, Mjeseci) |
| DEC-028 | Generisanje PDF izvještaja | Ručna izgradnja PDF toka prema PDF specifikaciji — bez eksternih biblioteka |
| DEC-029 | Format prikaza datuma | Evropski standard `dd.mm.yyyy` unificiran kroz čitavu aplikaciju |

- PDF bez PDFKita/Puppeteera: minimalan memorijski otisak, bez eksternih zavisnosti, potpuno kompatibilno s Dockerom
- Excel fajlovi šalju se klijentu kao binarni stream direktno s backend API-ja

### 7.6 Frontend i UX

| ID | Odluka | Odabrano rješenje |
|:---|:---|:---|
| DEC-030 | Pretraga, filtriranje i sortiranje u Data Overview | Klijentsko filtriranje u Angular komponenti — backend se poziva jednom |
| DEC-032 | Odabir troškova za poređenje | Checkbox selekcija u tabeli |
| DEC-033 | Prikaz poređenja troškova | Tabelarni side-by-side s vizuelnim indikatorima razlika (zeleno/crveno) |
| DEC-034 | Variance Analysis prikaz | Dinamički progress bar s apsolutnim i procentualnim odstupanjem |
| DEC-036 | Grafički prikaz poređenja | Tab navigacija između tabelarnog i grafičkog prikaza; korisnik bira tip grafikona (bar, line, pie) |
| DEC-037 | Arhitektura Dashboarda | Widget-based s paralelnim HTTP zahtjevima pri inicijalizaciji |
| DEC-038 | Drill-down prikaz troškova | Modalni dijalog unutar Dashboarda — korisnik ostaje u kontekstu |

- Klijentsko filtriranje pruža instantan odziv bez mrežnog kašnjenja
- Paralelni API pozivi na Dashboardu smanjuju ukupno vrijeme učitavanja
- Modal za drill-down čuva kontekst Dashboarda bez preusmjeravanja

### 7.7 AI arhitektura i funkcionalnosti

| ID | Odluka | Odabrano rješenje |
|:---|:---|:---|
| DEC-035 | Arhitektura AI servisa | Monolit `ai-service` bez Redis queue i zasebnog workera |
| DEC-039 | Implementacija AI asistenta | Hibridni pristup: LLM + dinamički injektirani kontekst iz baze |
| DEC-040 | Sprečavanje hallucination | Eksplicitna instrukcija u system promptu s fallback porukom "Nema dovoljno podataka" |
| DEC-041 | AI Executive Summary | Automatsko generisanje pri otvaranju Dashboarda + keširanje (TTL 15 min) |
| DEC-042 | Algoritam detekcije periodičnih troškova | Statistička analiza intervala ponavljanja nad min. 3 prethodna perioda |
| DEC-043 | Prikaz izostalih periodičnih troškova | Widget na Dashboardu s nazivom, datumom posljednje evidencije i prosječnim iznosom |
| DEC-044 | Prag tolerancije za izostanak troška | Fiksni prag od 3 dana |
| DEC-045 | Procjena rizika zavisnosti od dobavljača | Trostepena skala: LOW / MEDIUM / HIGH s postotkom učešća |
| DEC-049 | Detekcija unosa van radnog vremena | Zastavica `OUT_OF_HOURS_ENTRY` za unose između 22:00–06:00 i vikendom |
| DEC-050 | Detekcija cijepanja računa | Agregacija troškova (isti dobavljač, kategorija, odjel, dan) čiji zbroj > 1.000 BAM → `POTENCIJALNO_CIJEPANJE_RACUNA` |

- Redis queue nije implementiran jer FastAPI `BackgroundTasks` zadovoljava trenutne potrebe pri ograničenom broju korisnika
- Hibridni LLM pristup izbjegava čisti LLM (ne poznaje podatke korisnika) i RAG (prezahtjevno za obim projekta)
- Keširanje Executive Summaryja sprečava prekomjerne LLM pozive pri svakom osvježavanju stranice

### 7.8 Workflow odobravanja budžeta

| ID | Odluka | Odabrano rješenje |
|:---|:---|:---|
| DEC-025 | Statusni tok odobravanja | Backend endpoint za promjenu statusa ograničen na ulogu finansijskog direktora |
| DEC-026 | Zabrana duplih budžeta | Validacija u servisu + SQL ograničenje preklapanja perioda u bazi |
| DEC-046 | Povrat budžeta na doradu | Status `Na doradi` + obavezan komentar + in-app notifikacija računovođi |
| DEC-047 | Pravo submita dorade | Samo kreator budžeta može submitovati doradu (backend vraća HTTP 403 za ostale) |
| DEC-048 | Pohrana historije komentara | Zasebna tablica `budzet_komentari` — svaka akcija kreira novi red |

- Obavezan komentar pri povratu osigurava da računovođa zna šta ispraviti
- Ograničavanje submita na kreatora povećava odgovornost i traceability u procesu odobravanja

### 7.9 Sažetak arhitekturnih odluka

| Oblast | Tehnologija / pristup |
|:---|:---|
| Autentifikacija | Keycloak + JWT (RS256) + Authorization Code + PKCE |
| Session management | JWT + httpOnly session cookie |
| Autorizacija | RBAC iz JWT tokena, `requireRole` middleware |
| Baza podataka | PostgreSQL, raw SQL migracije, hard delete |
| Validacija | Dvostruka: servisni sloj + SQL ograničenja |
| Keširanje | Kratkotrajni in-memory cache (30 s za liste, 15 min za AI summary) |
| Excel eksport | `xlsx` biblioteka, višelistni fajl, binarni stream |
| PDF eksport | Ručna izgradnja PDF toka, bez eksternih zavisnosti |
| AI servis | FastAPI monolit + `BackgroundTasks`, bez Redisa |
| AI asistent | Hibridni LLM s kontekstom iz baze, anti-hallucination system prompt |
| Frontend | Angular, klijentsko filtriranje, widget-based Dashboard |

---

## 8. Najveći problemi tokom razvoja i način rješavanja

### 8.1 Implementacija Keycloak autentifikacije
**Sprint:** 5 → riješeno u Sprintu 6

**Problem:** Tim se prvi put susreo s Keycloakom kao tehnologijom. Konfiguracija i razumijevanje JWT validacije, JWKS endpointa, PKCE flowa i upravljanja rolama zahtijevalo je značajno više vremena od planiranog, što je stvaralo pritisak tokom sprinta.

**Način rješavanja:**
- Članovi tima koji su radili na autentifikaciji organizovali su internu sesiju prenošenja znanja ostatku tima
- U narednom sprintu Keycloak znanje se pokazalo kao pozitivan efekt — tim je rješavao pitanja autentifikacije bez većih blokera
- Doneseno je nekoliko arhitekturnih odluka (DEC-001 do DEC-008) koje su jasno dokumentovane u Decision Logu

### 8.2 Nestabilan i nedokumentovan deployment proces
**Sprint:** 7 → djelimično riješeno u Sprintu 8, praćeno u Sprintu 9

**Problem:** Redeploy aplikacije na Railway platformi uzrokovao je ozbiljne blokere — kolega zadužen za deployment morao je forkati cijeli projekat kako bi nastavio s radom. Cijeli proces bio je koncentrisan na jednu osobu, što je stvaralo usko grlo i sistemski rizik.

**Način rješavanja:**
- U Sprintu 8 napisana je jasna interna step-by-step dokumentacija za redeploy na Railway platformi
- Organizovana je kratka interna sesija gdje je kolega koji radi deployment prenio znanje ostatku tima
- Uvedena je praksa da različiti članovi tima naizmjenično rade deploy, čime se znanje aktivno održava unutar čitavog tima
- U Sprintu 9 nastavljena je ista praksa rotacije deploymenta kao standardni dio procesa

### 8.3 Poteškoće s deployom AI servisa
**Sprint:** 9

**Problem:** Deploy AI mikroservisa nije uspio u prvim pokušajima, što je privremeno blokiralo isporuku funkcionalnosti vezanih za AI analizu.

**Način rješavanja:**
- Problem je prevaziđen zahvaljujući dobroj komunikaciji i saradnji unutar tima
- Kao sistemska mjera, donesena je odluka da se proces deploymenta AI servisa bolje dokumentuje
- Arhitekturno, AI servis je zadržan kao monolit bez Redisa i zasebnog workera (DEC-035), čime se smanjila operativna složenost deploymenta

### 8.4 Podcijenjen obim sprinta i loša procjena složenosti
**Sprint:** 6

**Problem:** Planirane stavke za Sprint 6 pokazale su se nedovoljnim jer je Keycloak implicitno riješio veći dio funkcionalnosti. Tim je ostao bez dovoljno posla, a dodatne stavke su preuzete reaktivno tek kada je problem uočen.

**Način rješavanja:**
- Uvedena je obavezna tehnološka provjera pri planiranju: za svaku stavku eksplicitno se provjerava da li je već djelimično ili potpuno riješena kroz postojeću infrastrukturu
- Sprint planning se završava s jednom ili dvije rezervne stavke manjeg prioriteta
- Uvedeni su kraći interni check-in sastanci sredinom sprinta s eksplicitnom tačkom o obimu preostalog posla

### 8.5 Neusklađen API ugovor za historiju grešaka uvoza
**Sprint:** 8

**Problem:** Nedostatak rano definisanog ugovora o JSON formatu za greške uvoza uzrokovao je nesporazume između backend i frontend developera, što je usporilo spajanje prikaza loga grešaka na Data Overview stranici.

**Način rješavanja:**
- JSON format za greške uvoza je naknadno usaglašen između backend i frontend developera
- Praksa definisanja API ugovora unaprijed proširena je i na format specifičnih JSON odgovora, a ne samo na strukturu ruta
- Greške po redovima uvoza sada se trajno čuvaju u bazi u JSON kolonama (DEC-031)

### 8.6 Loša distribucija napora i pritisak pred kraj sprinta
**Sprint:** 5 → poboljšano u Sprintu 7

**Problem:** Veći dio napora bio je koncentrisan pri kraju sprinta, što je stvaralo pritisak i smanjivalo prostor za testiranje i iteracije.

**Način rješavanja:**
- Uvedeni su kraći interni check-in sastanci sredinom sprinta (od Sprinta 6 nadalje)
- U Sprintu 7 akcioni plan iz Sprinta 6 pokazao je konkretan pozitivan efekt — posao je ravnomjernije raspoređen bez pritiska pred kraj
- Uvedena je standardna praksa pravovremenog završavanja funkcionalnosti

### 8.7 Pregled problema po sprintovima

| Sprint | Glavni problem | Status rješavanja |
|:---|:---|:---|
| Sprint 5 | Keycloak — nova tehnologija, sporo istraživanje |  Riješeno u Sprintu 6 |
| Sprint 5 | Neravnomjerna distribucija napora | Riješeno u Sprintu 7 |
| Sprint 6 | Podcijenjen obim — Keycloak riješio stavke implicitno |  Riješeno uvođenjem rezervnih stavki i tehnološke provjere |
| Sprint 7 | Nestabilan deployment, ovisnost o jednoj osobi |  Riješeno dokumentacijom i rotacijom u Sprintu 8 |
| Sprint 8 | Neusklađen JSON format za greške uvoza |  Riješeno naknadnim usaglašavanjem i trajnom pohranom |
| Sprint 9 | Poteškoće s deployom AI servisa |  Riješeno komunikacijom; dokumentacija u toku |

---

## 9. Preporuke za nastavak razvoja

### 9.1 Visoki prioritet

#### Redis queue + AI worker

| Atribut | Vrijednost |
|:---|:---|
| Povezane odluke | DEC-035 |
| Procjena složenosti | Visoka |
| Trigger za implementaciju | Porast broja korisnika ili obima AI zadataka |

**Kontekst:** Tokom razvoja odlučeno je da se AI servis implementira kao monolit bez Redis queuea i zasebnog workera, jer FastAPI `BackgroundTasks` zadovoljava potrebe sistema pri trenutnom obimu i broju korisnika. Ova odluka je svjesno donesena s napomenom da može zahtijevati refaktor pri skaliranju.

**Preporučena akcija:** Uvesti Celery + Redis arhitekturu s jasnom podjelom na `ai-service` (API sloj) i `ai-worker` (asinhronа obrada zadataka). Implementacija se preporučuje kada se primijeti da `BackgroundTasks` postaje usko grlo — mjerljivi indikatori su povećano kašnjenje AI odgovora ili rast redova čekanja.

#### OCR integracija

| Atribut | Vrijednost |
|:---|:---|
| Backlog ID | 22 |
| Procjena složenosti | 8 story points |
| Prioritet u backlogu | Medium |

**Kontekst:** OCR integracija odložena je jer korisnici uvoz podataka pretežno vrše kroz CSV i Excel fajlove. Uvoz skeniranih dokumenata i računa nije bio eksplicitno zahtijevan od Product Ownera tokom sprint reviewova.

**Preporučena akcija:** Prije implementacije provesti evaluaciju stvarne potrebe na osnovu korisničkog feedbacka. Razmotriti dvije opcije:
- **Tesseract** — open-source, bez troškova licenciranja, pogodan za kontrolisane uvjete skeniranja
- **Google Vision / AWS Textract** — cloud rješenja, viša tačnost na složenim dokumentima, ali s troškovima po pozivu

### 9.2 Srednji prioritet

#### Server-side paginacija i filtriranje

| Atribut | Vrijednost |
|:---|:---|
| Povezane odluke | DEC-030 |
| Trigger za implementaciju | Rast dataseta — vidljivo usporavanje prikaza tabela |

**Kontekst:** Data Overview modul trenutno vrši pretragu, filtriranje i sortiranje lokalno u Angular komponenti. Ovo pruža instantan odziv pri trenutnom obimu podataka, ali je direktno ograničeno veličinom dataseta koji se može efikasno učitati u memoriju browsera.

**Preporučena akcija:** Implementirati server-side paginaciju s query parametrima (`page`, `pageSize`, `sortBy`, `sortOrder`, `filters`) na backend API-ju uz prilagodbu Angular komponente.

#### Soft delete troškova

| Atribut | Vrijednost |
|:---|:---|
| Povezane odluke | DEC-018 |
| Trigger za implementaciju | Zahtjev za audit trailom ili oporavkom obrisanih zapisa |

**Kontekst:** Troškovi se trenutno trajno brišu iz tabele `troskovi`. Finansijski sistemi standardno zahtijevaju mogućnost oporavka obrisanih zapisa i cjelovit audit trail.

**Preporučena akcija:** Uvesti `deleted_at` timestamp kolonu u tabelu `troskovi`. Svi upiti trebaju podrazumijevano filtrirati zapise gdje je `deleted_at IS NULL`, a brisanje postaje logičko postavljanje timestampa umjesto fizičkog uklanjanja retka.

### 9.3 Niži prioritet

#### Konfigurabilni prag tolerancije za periodične troškove

| Atribut | Vrijednost |
|:---|:---|
| Povezane odluke | DEC-044 |
| Trenutno rješenje | Fiksni prag od 3 dana |

**Kontekst:** Prag tolerancije od 3 dana definisan je kao fiksna vrijednost jer konfigurabilni prag po kategoriji dodaje nepotrebnu složenost za trenutne potrebe. Različite kategorije troškova mogu imati različite prihvatljive tolerance kašnjenja.

**Preporučena akcija:** Uvesti konfigurabilni prag po kategoriji troška s podrazumijevanom vrijednošću od 3 dana, dostupan administratoru kroz admin sučelje bez promjena u kodu.

#### Push notifikacije

| Atribut | Vrijednost |
|:---|:---|
| Povezane odluke | DEC-043 |
| Trenutno rješenje | Widget na Dashboardu |

**Kontekst:** Push notifikacije su razmatrane ali odbačene u korist Dashboard widgeta zbog složenosti implementacije. Widget zahtijeva da korisnik aktivno otvori aplikaciju kako bi vidio upozorenje.

**Preporučena akcija:** Implementirati push notifikacije putem WebSocket konekcije ili browser Push API-ja za kritična upozorenja. Email notifikacije su alternativa s manjom tehničkom složenošću kao prvi korak.

### 9.4 Sažetak preporuka

| Prioritet | Stavka | Trigger / uvjet |
|:---|:---|:---|
|  Visoki | Redis queue + AI worker | Mjerljivo kašnjenje AI odgovora ili rast broja korisnika |
|  Visoki | OCR integracija | Eksplicitni zahtjev korisnika za uvoz skeniranih dokumenata |
|  Srednji | Server-side paginacija | Vidljivo usporavanje tabela pri rastu dataseta |
|  Srednji | Soft delete troškova | Zahtjev za audit trailom ili oporavkom obrisanih zapisa |
|  Niži | Konfigurabilni prag tolerancije | Zahtjev za finijom kontrolom detekcije periodičnih troškova |
|  Niži | Push notifikacije | Zahtjev za proaktivnim obavještavanjem izvan aplikacije |

---

## 10. Zaključak

Funkcionalni dio projekta je u potpunosti završen za svih 44 implementirane stavke. Sistem pokriva cjelokupan workflow: od autentifikacije i upravljanja korisnicima, preko unosa, uvoza i analize troškova, do budžetiranja, AI-potpomognutih uvida i exporta izvještaja.

Dvije odložene stavke (OCR integracija i Redis queue) predstavljaju svjesne arhitekturalne odluke dokumentovane tokom razvoja, a ne propuste u implementaciji. Preporučene nadogradnje nisu ispravke nedostataka, nego prirodni sljedeći koraci pri rastu sistema i korisničke baze — implementacija Redis queuea i server-side paginacije treba biti vođena mjerljivim pokazateljima performansi, a ne uvedena preventivno.
