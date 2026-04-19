# Architecture Overview

## 1. Kratak opis arhitektonskog pristupa

Sistem je projektovan kao višeslojna web aplikacija, sa razdvojenim frontend, backend, AI i persistence slojevima. Predložena arhitektura prati princip razdvajanja odgovornosti (Separation of Concerns) kako bi se osigurala nesmetana i nezavisna izmjena, testiranje i skaliranje svakog dijela sistema. Persistence sloj (sloj podataka) predstavlja centralno skladište svih poslovnih podataka sistema — jedino backend ima direktan pristup ovom sloju, čime se osigurava integritet i sigurnost podataka.


**Ključni arhitektonski stil:**  
Layered monolitni backend, s RESTful API komunikacijom i izdvojenim AI servisom; ostavlja se mogućnost kasnijeg prelaska na mikroservise za AI komponentu.

### Osnovni principi

- **Modularnost** – svaka funkcionalnost se razvija i deploy-a nezavisno unutar zajedničkog backenda  
- **Sigurnost** – GDPR usklađenost i RBAC kontrola su ugrađeni od početka razvoja  
- **AI kao servis** – AI modul komunicira s ostatkom sistema kroz definirani API, što omogućava zamjenu ili upgrade AI modela bez utjecaja na ostale dijelove  

---

## 2. Glavne komponente sistema

### 2.1 Korisnici

U sistemu su definisane četiri tipa korisnika (uloge):

- Administrator  
- Glavni računovođa  
- Finansijski direktor  
- Administrativni radnik  

Sve uloge koriste isti Auth & RBAC sloj na backendu koji na osnovu JWT tokena određuje dozvole.

**Razlike:**
- Admin: puni pristup + upravljanje korisnicima i sigurnošću  
- Glavni računovođa i Finansijski direktor: pristup finansijama, bez upravljanja sistemom  
- Administrativni radnik: radi samo s vlastitim podacima  

---

### 2.2 Prezentacijski sloj – Frontend

Korisnički interfejs kojeg koriste svi tipovi korisnika sistema. Realizovan kao Single Page Application (SPA).

- Dashboard (grafikoni, pregledi, upozorenja)  
- Forme za unos i planiranje budžeta  
- Uvoz podataka  
- Pregled i poređenje troškova  
- Upozorenja  
- Admin panel (upravljanje korisnicima i rolama)  

---

### 2.3 Aplikativni sloj – Backend

Odgovoran za:

- Poslovnu logiku  
- Validaciju podataka  
- Autentifikaciju i autorizaciju  
- Komunikaciju između komponenti  

Najznačajniji dio ove komponente jeste autentifikacija i RBAC, na osnovu kojih se odobrava i odvija sva komunikacija u sistemu. Nakon što se korisnik prijavi na sistem, izdaje mu se JWT token, koji onda prati svaki naredni zahtjev prema API-ju. Zatim nastupa RBAC, koji provjerava permisije te odobrava ili odbija zahjev. 

Kada se prođe ovaj “korak”, nastupa poslovna logika sistema. Poslovni sloj podrazumijeva prije svega validaciju podataka, te upravljanje budžetima i troškovima. Ovdje također nastupa i orkestracija definisanih vanjskih servisa te logovanje svake akcije, generisanje fajlova i bilježenje komentara. Svaki od ovih akcija ide dalje prema bazi podataka, AI modulu, ingestion servisu ili notification engine-u. Naravno, na kraju, HTTP odgovori se prikazuju korisniku na frontendu.

U aplikativni sloj, također spada i sistem za generisanje upozorenja. Bilo da se analiza pokrene automatski ili ručno, AI modul radi provjere u bazi i ukoliko postoji anomalija, notification engine kreira zapis upozorenja, a sistem provjerava RBAC tabelu kome treba ići kreirano upozorenje. 

#### Funkcionalnosti:

- RESTful API  
- Autentifikacija i autorizacija (JWT + RBAC)
- Uvoz podataka (CSV / Excel / OCR)  
- Upravljanje notifikacijama  

---

### 2.4 Specijalizovani servisi

#### 2.4.1 AI Analitički modul

Komponenta odgovorna za obradu finansijskih podataka. Komunicira s backendom kroz API poziv.

Sastoji se od:

1. **Statistički/ML sloj** - radi sa brojevima, filtrira rezultate
2. **LLM sloj** - pretvara numerički nalaz u čitljivo objašnjenje

Funkcionalnosti:

- Analiza trendova  
- Detekcija odstupanja  
- Otkrivanje anomalija  
- Generisanje izvještaja  

---

#### 2.4.2 Data Ingestion Service (Servis za uvoz podataka)

Poseban podsistem za čitanje eksternih dokumenata i njihov uvoz u sistem, čime se uklanja potreba za ručnim unosom.

Servis sadrži tri odvojena kanala da obradu CSV i Excel formata te OCR engine. OCR engine je složeniji od preostala dva kanala, jer uvodi confidence score između 0 i 1 za svako polje, te stoga zahtijeva često ljudsku provjeru.

Funkcionalnosti:

- Parser za CSV i Excel formate
- OCR engine za skenirane dokumente i račune
- Validacija i mapiranje podataka

---

### 2.5 Sloj podataka

Centralno skladište svih podataka sistema.

- Planirani budžeti i stvarni troškovi
- Korisnici, kategorije, odjeli
- Historija anomalija i komentara

---

<img width="7212" height="6960" alt="Flowchart" src="https://github.com/user-attachments/assets/881e4ecc-4dec-4b4f-a504-478ecacfe017" />


---

## 3. Odgovornosti komponenti

| Komponenta | Odgovornost |
|----------|------------|
| Frontend | Prikazuje podatke korisniku, prikuplja input putem formi, vrši osnovnu klijentsku validaciju. Ne sadrži poslovnu logiku |
| Backend API | Provodi autentifikaciju, autorizaciju, poslovnu logiku i upravlja pozivima prema bazi i AI modulu |
| AI modul | Prima strukturirane finansijske podatke, provodi statističku i ML analizu, vraća nalaze (anomalije, trendovi, odstupanja) u JSON formatu |
| Baza podataka | Trajno čuva sve poslovne podatke. Jedino Backend pristupa bazi |
| Data Ingestion servis | Prima externe fajlove, ekstaktuje strukturirane podatke (CSV parser / OCR), validira i šalje prema Backendu za upis u bazu |
| Notification Engine | Podsistem unutar Backenda koji na osnovu AI nalaza kreira upozorenja i šalje ih relevantnim korisnicima |
| Auth & RBAC | Upravlja korisničkim identitetima, sesijama i pravima pristupa. Svaki API poziv prolazi kroz ovaj sloj |

---

## 4. Tok podataka i interakcija

### 4.1 Ručni unos troška

Korisnik putem frontenda popunjava formu za unos troška → Frontend šalje HTTP POST zahtjev prema Backend API-ju → Backend validira podatke i provjera RBAC dozvole → Trošak se upisuje u bazu → Backend asinhrono poziva AI modul za ažuriranje analize → Ako AI detektuje anomaliju, Notification Engine kreira upozorenje → Upozorenje se prikazuje relevantnim korisnicima na dashboardu.

---

### 4.2 Uvoz podataka (CSV / Excel / OCR)

Korisnik uploaduje fajl putem frontenda → Backend prima fajl i prosljeđuje ga Data Ingestion Servisu → Servis parsira sadržaj (CSV parser ili OCR engine) → Ekstraktovani podaci se mapiraju na interni model i validiraju → Backend upisuje validirane zapise u bazu → Pokreće se AI analiza nad novim podacima → Sistem generira izvještaj o uspješnosti uvoza (koliko stavki uvezeno, koliko odbijeno).

---

### 4.3 AI analiza i upozorenja

Backend periodično (ili na zahtjev) šalje agregirane finansijske podatke AI modulu → AI modul analizira trendove, poredi planirano s ostvarenim, traži statističke anomalije → Rezultati se vraćaju Backendu u strukturiranom JSON formatu → Backend upisuje nalaze u bazu i aktivira Notification Engine → Upozorenja se prikazuju korisnicima s objašnjenjem: gdje je anomalija, koliko iznosi odstupanje, preporuka za akciju.

---

### 4.4 Pregled i izvještavanje

Korisnik odabire parametre izvještaja (period, odjel, kategorija) → Frontend šalje GET zahtjev prema Backendu → Backend dohvaća podatke iz baze, agregira ih → Vraća JSON odgovor → Frontend renderuje grafikone i tabele → Korisnik može eksportovati izvještaj u CSV/Excel format putem Export API-ja.

---

**Napomena:**  
Sva komunikacija između Frontenda i Backenda odvija se putem RESTful HTTP/HTTPS API-ja. AI modul i Data Ingestion Servis komuniciraju s Backendom kroz interni API (unutar iste mreže), ne izlažući se direktno na internet.

---

## 5. Ključne tehničke odluke

| Odluka | Obrazloženje |
|------|-------------|
| REST API | Odabrana zbog jednostavnosti integracije, dobre podrške u svim razvojnim alatima i lake dokumentacije putem OpenAPI/Swagger standarda. |
| JWT autentifikacija | Stateless token-based autentifikacija omogućava horizontalno skaliranje backenda bez potrebe za centralnim session storage-om. |
| RBAC mdoel pristupa | Uloge su definirane na nivou backenda. Sprečava neautorizovani pristup podacima. |
| AI kao izdvojeni modul | AI logika odvojena od core backenda omogućava nezavisno ažuriranje modela i zamjenu bez uticaja na ostatak sistema. |
| Docker kontejnerizacija | Svi servisi (backend, AI modul, baza, ingestion servis) pokreću se u Docker kontejnerima. Osigurava konzistentnost između razvojnog i produkcijskog okruženja. |
| Relacijska baza podataka | Strukturiranost finansijskih podataka mapira se na relacijski model s referencijalnim integritetom. |
| Asinhrona obrada AI nalaza | AI analiza se pokreće asinhorno (queue-based) kako bi unos troška bio brz i ne bi čekao na završetak analize. |
| OCR kao zasebna biblioteka | OCR funkcionalnost integrirana je kao biblioteka u Data Ingestion Servisu, odvojena od core logike, što olakšava zamjenu ili upgrade OCR engina. |

---

## 6. Ograničenja i rizici

### 6.1 Tehnička ograničenja

- Kvalitet ekstrakcije podataka iz skeniranih dokumenata ovisi o kvalitetu slike. Loše slike mogu zahtijevati ručnu korekciju. (OCR tačnost)
- Za veće skupove podataka, AI analiza može potrajati duže. Asinhrona obrada ublažava ovo, ali korisnici ne dobijaju trenutne rezultate. (AI model latencija)
- Relacijska baza može postati usko grlo pri veoma velikom broju transakcija. (Skalabilnost baze)
- Sistem je dizajniran kao online aplikacija, nema podrške za offline rad ili sinhronizaciju. (Ograničena offline funkcionalnost)


---

### 6.2 Sigurnosni rizici

- Standardni web rizici ublaženi ORM-om, input validacijom i Content Security Policy headerima. (SQL Injection / XSS)
- Pogrešna konfiguracija rola može dovesti do curenja podataka. (Neautorizovani pristup podacima)
- CSV/Excel parser mora biti zaštićen od CSV injection. OCR biblioteka treba biti izolovana. (Uvoz malicioznih fajlova)
- Platne i lične informacije zaposlenika moraju biti enkriptovane. (GDPR usklađenost)

---

### 6.3 Arhitektonski rizici

- Ako odabrani AI pristup ne daje zadovoljavajuće rezultate, zamjena zahtijeva značajan redizajn AI modula. (Ovisnost o jednom AI modelu)
- Trenutna arhitektura je monolitni backend. Ako sistem značajno poraste, može biti potrebna migracija prema mikroservisima. (Monolitni backend)

---

## 7. Otvorena pitanja

| Pitanje | Status |
|--------|-------|
| Izbor OCR biblioteke | Koji OCR engine koristiti (Tesseract, AWS Textract, Google Vision API)? Odluka ovisi o tačnosti, cijeni i GDPR zahtjevima za pohranu podataka. |
| Hosting i deployment | On-premise ili cloud deployment? Izbor utiče na GDPR usklađenost, posebno za cloud rješenja. |
| Notifikacijski kanal | Hoće li upozorenja biti dostupna samo unutar sistema (in-app), ili i putem emaila integracije? |
| Strategija Backup-a | Definisati učestalost i lokaciju backup-a baze podataka, posebno s obzirom na osjetljivost finansijskih podataka. |
