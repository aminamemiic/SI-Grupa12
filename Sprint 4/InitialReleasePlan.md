# Pregled release plana

Ovaj dokument definira inicijalni plan isporuke sistema za upravljanje finansijama i troškovima. Plan je organiziran u 6 inkremenata koji pokrivaju sprintove od 5 do 10. 

## Pregled inkremenata

| Inkrement | Naziv | Sprintovi | Ključni cilj |
|-----------|-------|-----------|--------------|
| **I1** | Autentifikacija, RBAC i osnovno upravljanje troškovima | Sprint 5 i 6 | Sigurna prijava, RBAC, te CRUD operacije nad troškovima |
| **I2** | Pregled i uvoz podataka | Sprint 7 | Pregled liste, detalji i uvoz fajlova |
| **I3** | Analiza i izvještavanje | Sprint 8 | Filtriranje, izvještaji i planiranje budžeta |
| **I4** | Poređenje i AI analiza | Sprint 9 | Poređenje podataka i AI uvidi |
| **I5** | Vizualizacija i dashboard | Sprint 10 | Dashboard, grafički prikazi i upozorenja |

---

# Detalji po inkrementima

## Inkrement 1:  Autentifikacija, RBAC i osnovno upravljanje troškovima

| | |
|---|---|
| **Naziv inkrementa** | Inkrement 1 –  Autentifikacija, RBAC i osnovno upravljanje troškovima |
| **Cilj inkrementa** | Uspostaviti sigurnu osnovu sistema kroz mehanizme autentifikacije i RBAC-a, te omogućiti primarne operacije unosa i upravljanja troškovima (CRUD). |
| **Okvirni sprintovi** | Sprint 5 i 6 |

### Glavne funkcionalnosti


- Prijava korisnika (Sign In) – unos korisničkog imena i lozinke (US #6)
- Odjava korisnika (Sign Out) – sigurno zatvaranje sesije (US #7)
- Osnovna infrastruktura za upravljanje sesijama
- Zaštita svih ruta/ekrana koji zahtijevaju autentifikaciju
- Dodjela uloga korisnicima (US #1)
- Ograničenje pristupa funkcijama prema ulozi (US #2)
- Pregled korisničkih uloga (US #8)
- Izmjena uloga korisnika (US #9)
- Ručni unos troška putem forme (US #3)
- Unos atributa troška – kategorija, projekat, odjel (US #4)
- Validacija unosa troška (US #5)
- Kreiranje, ažuriranje i brisanje troška – CRUD (US #10, #11, #12)
  
### Zavisnosti

- Potrebna je definirana baza korisnika za validaciju prijave
- Definisane korisničke uloge moraju biti dogovorene prije implementacije RBAC matrice
- Kategorije, projekti i odjeli moraju biti prethodno definisani u sistemu
- Validaciona pravila moraju biti dogovorena s poslovnim analitičarima

### Glavni rizici

- Rizik sigurnosnih propusta u autentifikaciji – mitigacija kroz standardne biblioteke i hashing lozinki
- Nejasne sesijske politike (trajanje sesije, timeout) mogu uzrokovati UX probleme
- Kasno definiranje korisničkih podataka može blokirati razvoj
- Složenost RBAC matrice može uzrokovati kašnjenje – preporučuje se rano definiranje svih uloga
- Nekonzistentnost između uloga i dostupnih funkcija može stvoriti sigurnosne rupe
- Loša UX forme za unos troška može usporiti korištenje sistema
- Nedefinisane kategorije/odjeli blokiraju unos atributa troška

---


## Inkrement 2: Pregled podataka i uvoz

| | |
|---|---|
| **Naziv inkrementa** | Inkrement 2 – Pregled podataka i uvoz |
| **Cilj inkrementa** | Omogućiti korisnicima pregled liste troškova, detaljni uvid u pojedinačne zapise te uvoz podataka iz eksternih fajlova. |
| **Okvirni sprintovi** | Sprint 7 |

### Glavne funkcionalnosti

- Pregled liste podataka / troškova (US #14)
- Detaljan prikaz pojedinačnog zapisa (US #15)
- Uvoz podataka iz CSV ili Excel fajla (US #16)
- Automatska obrada uvezenih podataka (US #17)
- Validacija uvezenih podataka prije spremanja (US #18)

### Zavisnosti

- Zavisi od Inkrementa 2 (postoje troškovi u sistemu koje je moguće prikazati)
- Potrebna je definisana struktura CSV/Excel šablona za uvoz
- RBAC mora biti implementiran da se pregled ograniči prema ulozi

### Glavni rizici

- Različiti formati ulaznih fajlova mogu uzrokovati greške pri parsiranju – potrebno testirati više varijanti
- Veliki fajlovi pri uvozu mogu ugroziti performanse sistema
- Loša validacija uvezenih podataka može kontaminirati bazu netačnim podacima
- Korisnici možda nisu upoznati s formatom fajla – potrebna je jasna dokumentacija/šablon

---
## Inkrement 3: Analiza, izvještavanje i planiranje budžeta

| | |
|---|---|
| **Naziv inkrementa** | Inkrement 3 – Analiza, izvještavanje i planiranje budžeta |
| **Cilj inkrementa** | Pružiti napredne mogućnosti pretrage i filtriranja podataka, generisanja izvještaja za donošenje odluka te kreiranje i upravljanje budžetima. |
| **Okvirni sprintovi** | Sprint 8 |

### Glavne funkcionalnosti

- Filtriranje podataka po kriterijima (US #19)
- Pretraga podataka po ključnim riječima (US #20)
- Sortiranje podataka (US #21)
- Generisanje izvještaja o troškovima (US #22)
- Izvještaj filtriran po vremenskom periodu (US #23)
- Export izvještaja u PDF/Excel (US #24)
- Sažeti izvještaj s ključnim informacijama (US #25)
- Kreiranje novog budžeta po kategorijama/odjelima/periodu (US #26)
- Pregled postojećih budžeta (US #27)
- Uređivanje postojećeg budžeta (US #28)

### Zavisnosti

- Zavisi od Inkrementa 3 (podaci moraju biti dostupni za filtriranje i izvještaje)
- Export funkcionalnost zahtijeva integraciju s bibliotekama za generisanje PDF/Excel fajlova
- Planiranje budžeta zahtijeva prethodno definisane kategorije i odjele (Inkrement 2)

### Glavni rizici

- Kompleksni filteri mogu biti zahtjevni za implementaciju i testiranje
- Export u više formata povećava scope – prioritizirati PDF pa Excel
- Nejasni zahtjevi za budžet (koji periodi, koji nivoi granularnosti) mogu uzrokovati redizajn
- Performanse pri generisanju izvještaja nad velikim skupovima podataka

---

## Inkrement 4: Poređenje podataka i AI analiza

| | |
|---|---|
| **Naziv inkrementa** | Inkrement 4 – Poređenje podataka i AI analiza |
| **Cilj inkrementa** | Implementirati funkcionalnosti poređenja planiranih i stvarnih troškova te integrirati AI modul za automatsku detekciju anomalija, analizu trendova i predviđanje potrošnje. |
| **Okvirni sprintovi** | Sprint 9 |

### Glavne funkcionalnosti

- Odabir podataka za poređenje (US #29)
- Poređenje po kategorijama (US #30)
- Poređenje planiranih i stvarnih troškova (US #31)
- Slanje automatskih notifikacija o anomalijama (US #32)
- Tekstualni sažetak uz svaku notifikaciju (US #33)
- AI automatska validacija i detekcija anomalija pri unosu (US #34)
- AI dubinska analiza trendova na zahtjev (US #35)
- Predviđanje potrošnje do kraja perioda (US #36)
- Pametno AI grupisanje troškova – sugestija kategorije (US #37)

### Zavisnosti

- Zavisi od Inkrementa 4 (planiranje budžeta – potrebni planirani podaci za poređenje)
- AI funkcionalnosti zahtijevaju dovoljnu količinu historijskih podataka za treniranje/infereciranje
- Notifikacijski sistem zahtijeva definisanje kanala dostave (in-app, email?)
- Potrebno dogovoriti: da li je AI sugestija kategorije automatska ili samo preporuka?

### Glavni rizici

- AI modeli mogu davati netačne preporuke na malom skupu podataka – potreban minimalni dataset
- Integracija eksternog AI/ML servisa uvodi vanjsku zavisnost i moguće latencije
- Notifikacije putem emaila zahtijevaju konfiguraciju SMTP/mail servisa
- Korisnici mogu biti skeptični prema AI sugestijama – važno osigurati da korisnik ima zadnju riječ
- Detekcija anomalija može generisati previše lažnih alarma (false positives)

---

## Inkrement 5: Vizualizacija, dashboard i napredne funkcionalnosti

| | |
|---|---|
| **Naziv inkrementa** | Inkrement 5 – Vizualizacija, dashboard i napredne funkcionalnosti |
| **Cilj inkrementa** | Razviti centralni interaktivni dashboard s ključnim metrikama, grafičkim prikazom poređenja podataka, naprednom detekcijom sumnjivih obrazaca te omogućiti evidenciju komentara uz troškove. |
| **Okvirni sprintovi** | Sprint 10 |

### Glavne funkcionalnosti

- Vizuelno poređenje podataka – prikaz jedan pored drugog (US #38)
- Grafički prikaz poređenja (bar, line, pie) (US #39)
- Identifikacija sumnjivih obrazaca potrošnje – interna revizija (US #40)
- Detekcija periodičnih troškova i upozorenje o izostanku (US #41)
- Centralni interaktivni dashboard s ključnim metrikama (US #42)
- Bliži prikaz stanja – drill-down u grafikon (US #43)
- Dodavanje komentara uz trošak (US #44)
- Pregled komentara uz trošak (US #45)

### Zavisnosti

- Zavisi od svih prethodnih inkremenata – dashboard agregira podatke iz cijelog sistema
- Grafički prikazi zahtijevaju integraciju s charting bibliotekom (npr. Chart.js, Recharts)
- Detekcija periodičnih troškova oslanja se na AI analizu iz Inkrementa 5
- Drill-down funkcionalnost zahtijeva ispravno implementirane detaljne prikaze (Inkrement 3)

### Glavni rizici

- Dashboard kompleksnost može uzrokovati performansne probleme – razmotriti lazy loading i paginaciju
- Real-time osvježavanje dashboarda povećava tehničku složenost
- Izbor tipa grafikona (bar/line/pie) zahtijeva UX odluke – uključiti korisnike u testiranje
- Komentari mogu otvoriti pitanje moderacije i vidljivosti između korisnika
- Ovo je posljednji inkrement – kumulativni tehnički dug iz prethodnih inkremenata može usporiti razvoj

---
