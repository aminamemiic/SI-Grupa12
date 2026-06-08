# Svrha projekta

Svrha projekta je razvoj web aplikacije koja finansijskom menadžeru i finansijskim timovima omogućava centralizovano praćenje, analizu, kontrolu troškova poslovanja i budžeta uz pomoć umjetne inteligencije.
Sistem rješava ključni problem ručnog i vremenski zahtjevnog procesa analize troškova — umjesto toga, korisnicima pruža automatsku klasifikaciju troškova po kategorijama, odjelima, projektima i vremenskim periodima, kao i pravovremeno otkrivanje odstupanja od planiranog budžeta i neuobičajenih obrazaca potrošnje.
Krajnji cilj je pružiti menadžeru i finansijskim timovima jasne, brze i pouzdane uvide u finansijsko stanje firme kroz automatski generisana upozorenja, sažetke i izvještaje — čime se smanjuje rizik od prekoračenja budžeta, poboljšava finansijska disciplina i podržava donošenje odluka zasnovano na podacima.

# Problem koji sistem rješava

Firme svakodnevno generišu veliki broj troškova kroz različite odjele, projekte i kategorije. Praćenje i analiza tih troškova najčešće se provode ručno — putem tabela, nepovezanih softverskih alata ili izoliranih finansijskih sistema — što rezultira sporim, fragmentiranim i procesima koji su podložni greškama.

Konkretni problemi s kojima se firme suočavaju uključuju:

- **Rasutost podataka** — podaci o troškovima dolaze iz različitih izvora (Excel tabele, PDF fakture, ERP sistemi) i nisu objedinjeni na jednom mjestu
- **Kasno otkrivanje odstupanja** — prekoračenja budžeta se uočavaju tek na kraju mjeseca ili kvartala, kada je već teško poduzeti korektivne mjere
- **Nedostatak automatskih upozorenja** — ne postoji mehanizam koji pravovremeno obavještava odgovorne osobe o neuobičajenim ili zabrinjavajućim obrascima potrošnje
- **Ograničen uvid za rukovodstvo** — menadžment nema brz, pregledan i pouzdan pregled finansijskog stanja firme u realnom vremenu
- **Ručna klasifikacija troškova** — kategorizacija troškova po odjelima, projektima i vrstama troši značajno radno vrijeme i podložna je ljudskim greškama

Posljedice ovih problema ogledaju se u povećanom riziku od prekoračenja budžeta, otežanom finansijskom planiranju i donošenju odluka bez pouzdane podloge u podacima.
Ovaj sistem rješava navedene probleme kroz centralizovano prikupljanje podataka o troškovima, njihovu automatsku klasifikaciju i AI-podržanu analizu — omogućavajući pravovremeno otkrivanje odstupanja, generisanje upozorenja i pružanje jasnih finansijskih uvida rukovodstvu.

# Glavne korisničke uloge

- **Administrativni radnik**

  Zadužen za unos i ažuriranje podataka o troškovima.

- **Finansijski direktor**

  Odgovoran za donošenje ključnih finansijskih odluka.

- **Glavni računovođa**

  Odgovoran za upravljanje računovodstvom i podacima.

# Glavne funkcionalnosti sistema

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

# Pregled rada kroz sprintove

## Sprint 5 — Temelj sistema: autentifikacija i unos troškova
Implementirana prijava i odjava korisnika, dodjela i ograničenje pristupa prema ulogama (RBAC), te ručni unos troškova s validacijom i kategorizacijom po atributima (kategorija, projekat, odjel).

## Sprint 6 — CRUD operacije i upravljanje korisnicima
Implementirane osnovne operacije nad troškovima (kreiranje, ažuriranje, brisanje), kontrola pristupa CRUD operacijama prema ulozi, te pregled i izmjena korisničkih uloga od strane administratora.

## Sprint 7 — Pregled i uvoz podataka
Implementiran pregled liste i detaljan prikaz pojedinačnih zapisa, te uvoz troškova iz CSV i Excel fajlova s automatskom obradom i validacijom uvezenih podataka.

## Sprint 8 — Pretraga, izvještavanje i planiranje budžeta
Implementirani filtriranje, pretraga i sortiranje podataka, generisanje izvještaja po vremenskim periodima s mogućnošću exporta, kreiranje, pregled i uređivanje budžeta po kategorijama, odjelima i vremenskim periodima.

## Sprint 9 — AI analiza i poređenje podataka
Implementirana automatska detekcija anomalija pri unosu, dubinska analiza trendova, predviđanje potrošnje do kraja perioda, pametno grupisanje troškova putem AI sugestija, odabir i poređenje podataka po kategorijama, te generisanje notifikacija i sažetaka o uočenim anomalijama.

## Sprint 10 — Vizualizacija, dashboard i evidencija komentara
Implementirani vizuelno i grafičko poređenje podataka, centralni interaktivni dashboard s ključnim metrikama, identifikacija sumnjivih obrazaca i periodičnih troškova, te dodavanje i pregled komentara uz pojedinačne troškove.

## Pregled završenih,djelimično završenih i nezavršenih stavki

| Metrika | Vrijednost |
|:---|:---|
| Ukupan broj stavki | 46 |
| Done | 44 |
| Deferred / ostavljeno za budući rad | 2 |
| Partially Done | 0 |
| Not Done | 0 |

---

## 1. Završene stavke (Done)

### 1.1 Infrastruktura i tehničke postavke

| ID | Stavka | Opis |
|:---|:---|:---|
| 1 | Isplanirati izgled baze podataka | Organizacija baze podataka za budžete, troškove, korisnike, kategorije, odjele, projekte i vremenske periode. |
| 8 | Postavljanje razvojnog okruženja | Konfiguracija Docker-a, baze podataka i backend frameworka. |
| 9 | Definisanje API ugovora | Dokumentacija ruta između frontenda i backenda. |
| 12 | Keycloak integracija | Integracija Keycloak identity providera za autentifikaciju i upravljanje korisničkim identitetima. |
| 13 | Docker Compose – produkcijska konfiguracija | Konfiguracija produkcijskog okruženja. |
| 3 | GDPR & Security | Osigurana zaštita osjetljivih finansijskih podataka. |

### 1.2 Autentifikacija i upravljanje korisnicima

| ID | Stavka | Opis |
|:---|:---|:---|
| 5 | Sign in | Sistem za autentifikaciju korisnika. |
| 6 | Sign out | Funkcionalnost odjave iz sistema. |
| 7 | Upravljanje korisnicima (RBAC) | Regulisanje različitih nivoa pristupa kroz role korisnika. |

### 1.3 Upravljanje troškovima

| ID | Stavka | Opis |
|:---|:---|:---|
| 4 | Unos troškova | Sistem za ručni unos stvarnih pristiglih troškova. |
| 11 | Implementacija CRUD za troškove | Osnovne operacije nad tabelom troškova u bazi. |
| 16 | Uvoz podataka | Uvoz troškova iz CSV, XLS i XLSX fajlova s preview-om, obradom, validacijom i historijom uvoza. |
| 24 | Pretraga i filtriranje troškova | Pretraga po nazivu, opisu i dobavljaču; filtriranje po kategoriji, odjelu, projektu, statusu, valuti i iznosu. |
| 25 | Sortiranje podataka | Sortiranje liste troškova i budžeta po svim kolonama. |
| 21 | Evidencija komentara | Dodavanje i pregled komentara uz troškove. |
| 36 | Dodavanje komentara | Tekstualni komentar na pojedinačni trošak s bilježenjem autora i vremena. |
| 37 | Pregled komentara | Hronološki prikaz komentara uz trošak s vizuelnim indikatorom u tabeli. |

### 1.4 Upravljanje budžetima

| ID | Stavka | Opis |
|:---|:---|:---|
| 14 | Planiranje budžeta | Kreiranje, pregled, uređivanje, odobravanje i odbijanje budžeta. |
| 44 | Povrat budžeta na doradu | Finansijski direktor vraća budžet uz obavezan komentar i notifikaciju računovođi. |
| 45 | Ispravka i ponovna dostava budžeta | Računovođa pregledava komentar, ispravlja budžet i ponovo šalje na odobravanje. |
| 46 | Pregled historije komentara budžeta | Hronološki prikaz svih komentara u procesu odobravanja s autorom, vremenom i tipom akcije. |

### 1.5 Pregled i poređenje podataka

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

### 1.6 Izvještaji

| ID | Stavka | Opis |
|:---|:---|:---|
| 20 | Izvještaj | Generisanje i export sažetih i detaljnih izvještaja u XLSX, CSV i PDF formatima. |

### 1.7 AI funkcionalnosti

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

### 1.8 Dashboard

| ID | Stavka | Opis |
|:---|:---|:---|
| 10 | Razvoj osnovnog UI Dashboarda | Kreiranje osnovnog korisničkog interfejsa za pregled sistema. |
| 34 | Centralni interaktivni Dashboard | Vizuelni prikaz ključnih finansijskih metrika na jednom mjestu s grafikonima i karticama. |
| 35 | Bliži prikaz stanja | Klik na grafikon otvara listu pojedinačnih troškova koji čine prikazanu sumu. |

---

## 2. Odložene stavke (Deferred)

### 2.1 Integracija OCR biblioteke — ID 22

| Atribut | Vrijednost |
|:---|:---|
| Tip | Technical Task |
| Prioritet | Medium |
| Procjena složenosti | 8 story points |
| Status | Deferred / ostavljeno za budući rad |

**Obrazloženje:** Nema implementacije OCR biblioteke u kodu ni njenog povezivanja sa postojećim tokovima. Tokom razvoja se pokazalo da korisnici uvoz podataka pretežno vrše kroz strukturirane CSV i Excel fajlove, što u potpunosti pokriva potrebe sistema. Uvoz skeniranih dokumenata i računa nije bio eksplicitno zahtijevan od strane Product Ownera tokom sprint reviewova, te je stavka odgođena u korist prioritetnijih funkcionalnosti — AI analize, poređenja podataka i notifikacijskog sistema.

**Preporučena akcija za sljedeći ciklus:** Evaluirati stvarnu potrebu za OCR funkcionalnosti na osnovu korisničkog feedbacka. Razmotriti integraciju biblioteke kao što je Tesseract ili cloud OCR servisa (Google Vision, AWS Textract).

---

### 2.2 Redis queue integracija — ID 23

| Atribut | Vrijednost |
|:---|:---|
| Tip | Technical Task |
| Prioritet | Medium |
| Procjena složenosti | 5 story points |
| Status | Deferred / ostavljeno za budući rad |

**Obrazloženje:** Nema implementacije Redis queue mehanizma između backend servisa i AI mikroservisa. Tokom razvoja AI mikroservisa se pokazalo da FastAPI-jev ugrađeni mehanizam `BackgroundTasks` u potpunosti zadovoljava potrebe sistema za asinhronu obradu AI zadataka pri trenutnom obimu podataka. Uvođenje Redisa i zasebnog workera dodalo bi značajnu infrastrukturnu kompleksnost bez mjerljive koristi za sistem interne aplikacije s ograničenim brojem korisnika. Ova odluka je evidentirana u Decision Logu u Sprintu 9.

**Preporučena akcija za sljedeći ciklus:** Implementirati Redis queue ukoliko broj korisnika ili obim AI zadataka porastu do tačke gdje `BackgroundTasks` postane usko grlo. Razmotriti Celery + Redis kao standardno rješenje.

---

## 3. Zaključak

Funkcionalni dio projekta je u potpunosti završen za 44 implementirane stavke. Sistem pokriva cjelokupan workflow: od autentifikacije i upravljanja korisnicima, preko unosa, uvoza i analize troškova, do budžetiranja, AI-potpomognutih uvida i exporta izvještaja.

Dvije odložene stavke (OCR integracija i Redis queue) predstavljaju svjesne arhitekturalne odluke dokumentovane tokom razvoja, a ne propuste u implementaciji. Preporučuje se njihova revizija u narednom razvojnom ciklusu na osnovu stvarnih potreba korisnika i rasta sistema.


