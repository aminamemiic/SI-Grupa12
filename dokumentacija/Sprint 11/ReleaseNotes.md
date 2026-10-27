# Release Notes - Finalna verzija (v1.0.0)

Dobrodošli u zvanični izvještaj o izdanju (**Release Notes**) za finalnu verziju sistema za upravljanje troškovima i budžetima (SI Grupa 12). Ovaj dokument pruža detaljan pregled isporučenih funkcionalnosti, tehničkih rješenja, poznatih ograničenja i planiranih stavki koje su odložene za budući rad.

---

## 1. Sažetak projekta i obim isporuke

Svrha projekta je razvoj web aplikacije koja finansijskim timovima i menadžerima omogućava centralizovano praćenje, analizu i kontrolu troškova poslovanja i budžeta uz podršku vještačke inteligencije (AI).

U okviru finalnog Product Backloga, razvojni tim je planirao ukupno **46 stavki**:
- **Isporučeno (Done):** 44 stavke (95.6% planiranog obima)
- **Odloženo za budući rad (Deferred):** 2 stavke (4.4% planiranog obima)
- **Djelimično završeno ili nezavršeno (Partially / Not Done):** 0 stavki

Finalna isporuka obuhvata potpuno funkcionalan Angular frontend, Express/TypeScript backend REST API, Python FastAPI AI servis, PostgreSQL bazu podataka sa automatskim migracijama i seed podacima, te pripremljenu Docker Compose konfiguraciju za lokalno i produkcijsko okruženje.

---

## 2. Najvažnije isporučene funkcionalnosti

Sve isporučene funkcionalnosti su u potpunosti razvijene, ručno verifikovane i pokrivene paketom od **459 automatizovanih backend testova** koji u potpunosti prolaze.

### 2.1. Autentifikacija i upravljanje korisnicima (RBAC)
- **Keycloak integracija:** Autentifikacija se vrši preko eksternog Keycloak servera (Authorization Code + PKCE flow).
- **Role-Based Access Control (RBAC):** Pristup i dozvole su strogo ograničeni na osnovu 4 predefinisane uloge:
  - `admin` – potpun pristup svim modulima i Keycloak administraciji za kreiranje korisnika.
  - `administrativni_radnik` – unos, ažuriranje i brisanje troškova, uvoz fajlova i komentarisanje.
  - `glavni_racunovodja` – kreiranje i ažuriranje budžeta, slanje na odobrenje, pregled izvještaja i notifikacija.
  - `finansijski_direktor` – odobravanje, odbijanje i vraćanje budžeta na doradu, pregled izvještaja i notifikacija.
- **Sigurnost:** Sve rute na backendu su zaštićene JWT middleware provjerom (RS256 algoritam sa JWKS validacijom).

### 2.2. Upravljanje troškovima i komentarima
- **CRUD troškova:** Kompletan ručni unos i izmjena troškova sa validacijom iznosa, datuma, kategorije, odjela, projekta i valute.
- **Zaštita zaključanih troškova:** Troškovi koji prođu validaciju dobijaju status `ZAKLJUCAN` i njihova izmjena ili brisanje su onemogućeni na nivou baze i servisa radi očuvanja integriteta podataka.
- **Napredna pretraga i filtriranje:** Pretraga po nazivu, opisu i dobavljaču, te filtriranje po kategorijama, odjelima, projektima, statusu, valuti i rasponu iznosa.
- **Komentari na troškove:** Mogućnost dodavanja komentara na pojedinačni trošak sa bilježenjem autora i timestampa.

### 2.3. Masovni uvoz podataka (Ingestion)
- **Podržani formati:** Uvoz podataka iz CSV, XLS i XLSX fajlova (veličine do 10 MB).
- **Dvostepeni uvoz:** Tok se sastoji od uvoza datoteke, preview prikaza sa validacijom svakog reda, te potvrde korisnika prije konačnog upisa validnih redova u bazu.
- **Logovanje grešaka:** Trajno bilježenje historije uvoza u bazi sa detaljnim JSON logom grešaka za svaki nevalidan red.

### 2.4. Workflow budžetiranja
- **Planiranje budžeta:** Kreiranje budžeta po kategorijama, odjelima i periodima uz sprečavanje preklapanja perioda.
- **Workflow odobravanja:** Finansijski direktor može odobriti, odbiti ili vratiti budžet na doradu. Vraćanje na doradu zahtijeva obavezan komentar.
- **Ponovna dostava:** Samo kreator budžeta (računovođa) ima pravo ispraviti budžet sa statusom `Na doradi` i poslati ga ponovo na odobrenje.
- **Audit trail:** Kompletna historija komentara i akcija tokom procesa odobravanja budžeta se trajno bilježi.

### 2.5. Pregled, poređenje podataka i izvještaji
- **Data Overview:** Checkbox selekcija pojedinačnih troškova iz tabele za dinamičko poređenje.
- **Poređenje podataka:** Tabelarni side-by-side i grafički prikaz (bar, line, pie grafikoni pomoću Chart.js) poređenja odabranih stavki.
- **Variance Analysis:** Analiza planiranih budžeta naspram stvarnih troškova s prikazom procentualne iskoristivosti i progress barovima.
- **Predviđanje potrošnje:** Backend i frontend projekcija potrošnje do kraja perioda na osnovu trenutne brzine trošenja.
- **Izvoz izvještaja:** Generisanje višelisnih Excel fajlova (Summary, Kategorije, Odjeli, Mjeseci), CSV fajlova i PDF dokumenata (PDF je implementiran ručno, bez eksternih biblioteka, radi boljih performansi).

### 2.6. AI i analitičke funkcionalnosti
- **AI prijedlog kategorije:** Prilikom ručnog unosa troška, sistem predlaže optimalnu kategoriju koristeći Gemini API sa fallbackom na interni Python AI servis.
- **Pred-validacija i detekcija anomalija:** Real-time klijentska pred-validacija sa detekcijom anomalija (Z-score, IQR, duplikati, prekoračenja) prije snimanja.
- **AI Executive Summary:** Automatski generisan sažetak ključnih finansijskih metrika na Dashboardu (keširan na 15 minuta).
- **AI preporuke:** Generisanje preporuka za optimizaciju troškova na osnovu historijskih trendova.
- **Rast i rizik dobavljača:** Identifikacija dobavljača sa najvećim rastom troškova i procjena rizika zavisnosti (LOW / MEDIUM / HIGH skala).
- **Detekcija periodičnih troškova:** Prepoznavanje periodičnih troškova i prikaz upozorenja na Dashboardu ako očekivani periodični trošak kasni više od 3 dana.
- **Detekcija sumnjivih obrazaca:** Detekcija unosa van radnog vremena (`OUT_OF_HOURS_ENTRY`) i cijepanja računa (`POTENCIJALNO_CIJEPANJE_RACUNA`).
- **Inteligentni AI asistent:** Chatbot na Dashboardu koji odgovara na pitanja korisnika na prirodnom jeziku (hibridni pristup koji kombinuje LLM i dinamički kontekst iz baze podataka).

---

## 3. Jasna razlika između stvarno isporučenog i planiranog (Nezavršene stavke)

Sljedeće dvije stavke su bile planirane u Product Backlogu, ali **nisu dio finalne isporuke**. One su svjesno odložene za budući rad (**Deferred**) na osnovu analize potreba i tehničke kompleksnosti:

| ID | Naziv stavke | Status | Obrazloženje i razlozi za nezavršavanje |
|:---|:---|:---|:---|
| **22** | **Integracija OCR biblioteke** | **Deferred (Odloženo)** | Tokom razvoja se pokazalo da korisnici uvoze podatke pretežno kroz strukturirane CSV i Excel fajlove, što u potpunosti pokriva sve operativne potrebe sistema. Uvoz skeniranih dokumenata i računa nije bio prioritet Product Owneru na sprint reviewima, te je stavka odgođena u korist prioritetnijih modula (AI analitika, poređenje, komentari). |
| **23** | **Redis queue integracija** | **Deferred (Odloženo)** | Tokom razvoja AI mikroservisa, utvrđeno je da FastAPI-jev ugrađeni mehanizam `BackgroundTasks` u potpunosti zadovoljava potrebe asinhronog izvršavanja AI zadataka pri trenutnom obimu podataka. Uvođenje Redisa i zasebnog workera bi značajno povećalo infrastrukturnu kompleksnost sistema bez opipljive koristi za interni tim korisnika. Odluka je formalno evidentirana u Decision Logu u Sprintu 9. |

---

## 4. Poznata ograničenja sistema (Limitations)

Sistem posjeduje određena ograničenja koja su definisana poslovnim pravilima, trenutnom arhitekturom i obimom projekta:

- **AI Ovisnost i Fallback:** Prijedlog kategorije i AI asistent zavise od dostupnosti eksternog Gemini API-ja. Ukoliko Gemini API ključ nije konfigurisan ili servis nije dostupan, sistem prelazi na interni Python AI servis. Ukoliko ni on nije dostupan, korisniku se prikazuje obavještenje o nedostupnosti AI prijedloga.
- **In-App Notifikacije:** Upozorenja o anomalijama, promjenama statusa budžeta i duplikatima su implementirana holds isključivo unutar aplikacije (Dashboard i notifikacioni modul). E-mail, SMS i push notifikacije van aplikacije nisu dio ove verzije.
- **Vanjske integracije:** Sistem nema direktnu integraciju sa eksternim bankarskim sistemima, ERP rješenjima ili državnim servisima e-faktura. Podaci se unose isključivo ručno ili kroz podržane fajlove za uvoz.
- **Single-Tenant pretpostavka:** Sistem je zamišljen za rad unutar jedne organizacije ili tima sa zajedničkom bazom podataka. Podjela na više potpuno izolovanih firmi (multi-tenancy) na istoj instalaciji nije podržana.
- **Statistička AI ograničenja:** Detekcija periodičnih troškova, anomalije, preporuke za optimizaciju i zavisnost od dobavljača rade na osnovu statističkih pravila, IQR/Z-score formula i heuristika nad podacima, a ne kroz duboke neuronske mreže, pa ih treba koristiti kao analitičku podršku, a ne kao automatske finansijske odluke.
- **Nedostatak produkcijskih modula:** Backup baze, antivirusno skeniranje uvoza, napredni audit logovi aktivnosti korisnika i rate limiting na API-ju nisu implementirani kao zasebni moduli unutar ove verzije aplikacije.

---

## 5. Poznati bugovi i specifična ponašanja

U finalnoj verziji sistema **nema poznatih blokirajućih ili padajućih bugova**. Svi automatizovani testovi uspješno prolaze. Ipak, uočena su sljedeća ponašanja i rubni slučajevi na koje treba obratiti pažnju:

- **Detekcija periodičnih troškova:** Algoritam pretpostavlja sličan naziv troška i mjesečni obrazac. Sezonski, kvartalni ili troškovi sa drastično različitim nazivima (iako su od istog dobavljača) mogu ostati neprepoznati od strane statističkog algoritma.
- **Ograničenja kod viševalutnog prikaza na grafikonima:** Aplikacija podržava unos troškova u različitim valutama (BAM, EUR, USD), ali agregirani grafikoni na Dashboardu sumiraju iznose bez automatske konverzije po trenutnom kursu centralne banke u realnom vremenu, što može dovesti do vizuelno neusklađenih prikaza ukoliko se unose miješane valute. Preporučuje se unificiran unos podataka ili analiza filtrirana po pojedinačnim valutama.
- **AI asistent i rubni podaci:** Iako je implementiran hibridni model sa kontekstom iz baze i anti-hallucination zaštitom, ukoliko u bazi podataka ima premalo podataka ili su tabele prazne, AI asistent može vratiti generički odgovor ("Nema dovoljno podataka za analizu").

---

## 6. Tehničko okruženje i deployment

- **Frontend:** Angular 21, TypeScript, RxJS, Chart.js.
- **Backend:** Node.js, Express, TypeScript, Jest (za testiranje).
- **AI Servis:** Python 3.10+, FastAPI.
- **Baza podataka:** PostgreSQL 16.
- **Identitet i uloge:** Keycloak.
- **Deployment:** Aplikacija se pokreće u Docker kontejnerima. Konfiguracija zahtijeva ispravno podešene environment varijable (baza, Keycloak klijenti i realmi, te `GEMINI_API_KEY` za punu AI funkcionalnost).
