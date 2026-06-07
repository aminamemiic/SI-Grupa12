# Korisnički priručnik

## 1. Namjena sistema
Sistem je namijenjen internom finansijskom timu koji vodi evidenciju troškova, budžeta, izvještaja i notifikacija. Koristi se za:

- unos i uređivanje troškova
- import većeg broja troškova iz CSV i Excel fajla
- planiranje i odobravanje budžeta
- pregled objedinjene finansijske baze
- generisanje izvještaja i AI analiza
- praćenje notifikacija i upozorenja

Priručnik je pisan za krajnjeg korisnika, odnosno za osobu koja koristi aplikaciju u svakodnevnom radu, a ne za programera ili administratora sistema.

## 2. Korisničke uloge
U sistemu postoje sljedeće korisničke uloge:

| Uloga | Šta korisnik može raditi |
|---|---|
| `admin` | Ima pristup svim modulima, može upravljati troškovima, budžetima, pregledom podataka, izvještajima i notifikacijama, te ima pristup Keycloak admin panelu, a samim time kreiranju novih korisnika sistema i dodjeljivanju uloga. |
| `administrativni_radnik` | Unosi i uređuje troškove, radi import troškova i po potrebi dodaje komentare troškova. |
| `glavni_racunovodja` | Pregleda i uređuje budžete, šalje budžete na odobrenje, koristi pregled podataka, izvještaje i notifikacije. |
| `finansijski_direktor` | Odobrava ili odbija budžete, vraća budžete na doradu, koristi pregled podataka, izvještaje i notifikacije. |

> Napomena:
> Dostupnost pojedinih ekrana i akcija zavisi od uloge. Ako korisnik nema pravo pristupa, sistem ga vraća na početnu stranicu ili prikazuje poruku da pristup nije dozvoljen.

## 3. Prijava u sistem
Prijava se vrši preko Keycloak autentifikacije.

Koraci:
1. Otvorite početnu stranicu sistema.
2. Kliknite na dugme **Prijavi se**.
3. Sistem vas preusmjerava na Keycloak ekran za prijavu.
4. Unesite korisničko ime i lozinku.
5. Nakon uspješne prijave, sistem vas vraća u aplikaciju i otvara nadzornu ploču.

Očekivani rezultat:
- korisnik dobija aktivnu sesiju
- u gornjem desnom dijelu se prikazuje njegova uloga
- dostupni su samo ekrani koje ta uloga smije koristiti

> Napomena: 
> S obzirom da je ovo interni sistem finansijskog tima, nije moguće da se korisnik van tima registruje na sistem. Samo admin ima mogućnost kreiranja i dodjele korisničkih računa sa predefinisanim ulogama. 

## 4. Demo kredencijali
U projektu su pripremljeni demo nalozi za testiranje. Najvažniji poznati kredencijal je:

| Korisnik | Lozinka | Uloga |
|---|---|---|
| `tadej.pogacar` | `tadejpogacar` | Administratorski pristup |
| `amina.memic` | `aminamemic` | Administrativni radnik |
| `adna.bajramovic` | `adnabajramovic` | Administrativni radnik |
| `nejla.cenanovic` | `nejlacenanovic` | Glavni računovođa |
| `elvedina.halilovic` | `elvedinahalilovic` | Finansijski direktor |


## 5. Glavni ekrani

### 5.1 Početna stranica
Početna stranica prikazuje naziv sistema i dugme za prijavu.

Šta korisnik vidi:
- kratak opis sistema
- dugme **Prijavi se**


### 5.2 Nadzorna ploča
Nakon prijave korisnik dolazi na nadzornu ploču.

Šta se prikazuje:
- brzi ulazi prema modulima (sidebar)
- sažetak troškova
- sažetak budžeta
- troškovi po kategorijama i odjelima
- AI pomoćnik za pitanja o troškovima
  
  <img width="259.5" height="244.5" alt="image" src="https://github.com/user-attachments/assets/e77cdef4-63bc-4872-a010-91f6be0e5249" />
  
- AI preporuke i sažetak, dobavljači sa najvećim rastom, provjera periodičnih troškova

  <img width="461.5" height="430.5" alt="image" src="https://github.com/user-attachments/assets/63d67123-4a60-44b9-8aba-900a130b405f" />



### 5.3 Upravljanje troškovima
Ovaj ekran služi za ručni unos, uređivanje i brisanje troškova.

Šta se prikazuje:
- forma za unos ili izmjenu troška
- lista svih dostupnih troškova
- pretraga po nazivu, kategoriji, odjelu i valuti
- dugmad za uređivanje, brisanje i komentare
- upozorenja ako sistem prepozna anomaliju

  <img width="754" height="434.5" alt="image" src="https://github.com/user-attachments/assets/bed7337f-b906-4d8e-8cdf-3e99488d6d9f" />



### 5.4 Import troškova
Ekran za masovni unos troškova iz CSV ili XLSX fajla.

Šta se prikazuje:
- korak 1: odabir fajla

  <img width="764.5" height="429" alt="image" src="https://github.com/user-attachments/assets/16353c80-4e40-44f4-8422-0ed2b74bcb46" />

- korak 2: pregled i validacija redova

  <img width="763" height="431.5" alt="image" src="https://github.com/user-attachments/assets/9e153565-092f-4f4d-a8c2-192801425d4a" />

- korak 3: rezultat importa

  <img width="764.5" height="413" alt="image" src="https://github.com/user-attachments/assets/6f175827-c201-4ed2-ac1b-02151989c8b5" />


### 5.5 Planiranje budžeta
Na ovom ekranu korisnik kreira, uređuje i pregledava budžete.

Šta se prikazuje:
- forma za novi budžet
- lista budžeta
- detalji odabranog budžeta

  <img width="222.4" height="368.5" alt="image" src="https://github.com/user-attachments/assets/07ce57a7-6eeb-40e4-83af-0daf9a937851" />

- historija komentara

  <img width="217" height="263" alt="image" src="https://github.com/user-attachments/assets/568f1994-1c83-43eb-b2e4-b53154537f43" />

- projekcija potrošnje za tekući mjesec

  <img width="214" height="263.5" alt="image" src="https://github.com/user-attachments/assets/3e6b8c6d-27b3-4fa2-b493-682be56f7251" />



### 5.6 Pregled podataka
Ovaj ekran prikazuje objedinjene finansijske podatke iz baze.

Šta se prikazuje:
- zbirni broj troškova, budžeta, kategorija, odjela i dobavljača
- filtriranje i pretraga
- detaljan pregled pojedinačnih zapisa
- prikaz historije uvoza
- poređenje troškova (pojedinačno i grupno)

 <img width="738.5" height="436" alt="image" src="https://github.com/user-attachments/assets/ea2272cf-7b79-4eaa-b4ef-eb980c372f7b" />
 <img width="739" height="434.5" alt="image" src="https://github.com/user-attachments/assets/2d7d1f0f-1a11-47d7-a2a3-4b2f4961c7ca" />

> Napomena: 
> Svaku stavku unutar pregleda podataka je moguće kliknuti što će prikazati detaljan pregled. 

### 5.7 Izvještaji
Ekran za izradu sažetih i detaljnih izvještaja.

Šta se prikazuje:
- izbor tipa izvještaja
- odabir perioda
- grafički i tabelarni pregled troškova
- export u PDF, CSV i XLSX
- pokretanje AI analize (prikazuje kretanje troškova po mjesecima, predviđanje budžeta i preporuke)

 <img width="744" height="434.5" alt="image" src="https://github.com/user-attachments/assets/9ddc48fc-0202-4dfd-b94c-473b8a0fdc34" />


### 5.8 Notifikacije
Ekran za pregled sistemskih upozorenja i AI obavještenja.

Šta se prikazuje:
- lista notifikacija
- filter po prioritetu
- detalji obavijesti
- opcija označavanja kao pročitano (za odabranu notifikaciju ili svih notifikacija)
- za duplikate troškova: opcija odobri ili obriši

<img width="383" height="433" alt="image" src="https://github.com/user-attachments/assets/db1a285a-4dd5-42b2-98e0-deb8961eab2b" />


## 6. Najvažniji korisnički tokovi

### 6.1 Unos novog troška
Ovaj tok koriste administrativni radnik i administrator.

Koraci:
1. Otvorite modul **Upravljanje troškovima**.
2. U formi unesite naziv troška.
3. Unesite iznos i datum.
4. Odaberite kategoriju, odjel i valutu.
> Kategoriju je moguće odabrati putem AI prijedloga
5. Po potrebi dodajte projekat, dobavljača i opis.
6. Kliknite **Sačuvaj**.

Očekivani rezultat:
- sistem validira obavezna polja
- novi trošak se upisuje u listu
- nakon uspješnog snimanja prikazuje se poruka da je trošak sačuvan

Napomena:
- ako sistem prepozna anomaliju, prikazuje upozorenje, ali korisnik i dalje može nastaviti sa snimanjem

### 6.2 Uređivanje ili brisanje troška
Ovaj tok koriste administrativni radnik i administrator.

Koraci za uređivanje:
1. U listi troškova pronađite željeni zapis.
2. Kliknite **Uredi**.
3. Izmijenite podatke u formi.
4. Kliknite **Sačuvaj izmjene**.

Očekivani rezultat:
- izmijenjeni podaci se prikazuju u listi troškova
- sistem prikazuje poruku da je trošak uspješno ažuriran

Koraci za brisanje:
1. U listi troškova kliknite **Izbriši**.
2. Potvrdite brisanje u dijalogu.

Očekivani rezultat:
- trošak se uklanja iz liste
- sistem prikazuje poruku da je trošak obrisan

### 6.3 Import troškova iz fajla
Ovaj tok je namijenjen masovnom unosu podataka za administrativnog radnika i administratora.

Koraci:
1. Otvorite **Import troškova**.
2. Kliknite **Odaberite fajl** i izaberite CSV, XLSX ili XLS dokument.
3. Kliknite **Učitaj i prikaži preview**.
4. Pregledajte validirane redove i označite one koje želite uvesti.
5. Kliknite **Potvrdi import**.
6. Nakon završetka pregledajte sažetak rezultata.

Očekivani rezultat:
- sistem prikazuje broj validnih i nevalidnih redova
- nakon potvrde, odabrani troškovi se upisuju u bazu
- rezultat prikazuje koliko je zapisa uspješno ubačeno, a koliko je preskočeno

Ograničenja:
- fajl ne smije biti veći od 10 MB
- podržani su samo CSV i Excel formati
- nevalidni redovi se ne mogu uvesti

### 6.4 Kreiranje i odobravanje budžeta
Ovaj tok zavisi od uloge:
- glavni računovođa kreira ili ažurira budžet
- finansijski direktor odobrava, odbija ili vraća budžet na doradu

Koraci za kreiranje:
1. Otvorite **Planiranje budžeta**.
2. Kliknite **Kreiraj novi budžet**.
3. Unesite naziv, planirani iznos i period.
4. Odaberite odjel, projekat i kategorije.
5. Kliknite **Sačuvaj**.

Očekivani rezultat:
- novi budžet se pojavljuje u listi
- status je inicijalno nacrt 

Koraci za odobravanje:
1. U listi budžeta pronađite budžet koji je spreman za odluku.
2. Kliknite **Odobri** ili **Odbij**.

Očekivani rezultat:
- status budžeta se mijenja u odobren ili odbijen
- sistem prikazuje poruku o uspješnoj promjeni statusa

Koraci za vraćanje na doradu:
1. Otvorite budžet koji treba doraditi.
2. Kliknite **Vrati na doradu**.
3. Unesite komentar i potvrdite akciju.

Očekivani rezultat:
- budžet dobija status na doradi
- komentar se upisuje u historiju komentara
- glavni računovođa kasnije može ponovo poslati doradu na odobravanje

Napomena:
- odobren ili odbijen budžet se ne može uređivati
- korisnik koji nije ovlašten vidi poruku da nema pravo za tu akciju

### 6.5 Pregled podataka i poređenje
Ovaj tok koristi se za analizu postojećih podataka, a pristup imaju finansijski direktor, glavni računovođa i administrator.

Koraci:
1. Otvorite **Pregled podataka**.
2. U vrhu provjerite zbirne kartice sa ukupnim brojevima.
3. Po potrebi unesite pojam u pretragu sekcija ili tabelu.
4. Filtrirajte troškove po kategoriji, odjelu, statusu, valuti, dobavljaču ili iznosu.
5. Otvorite detalj konkretnog zapisa klikom na red.
6. Ako treba, označite dva ili više troškova i pokrenite poređenje.

Očekivani rezultat:
- sistem sužava prikaz na odabrane kriterije
- detaljni panel prikazuje sve relevantne informacije o zapisu
- poređenje prikazuje razlike između odabranih troškova

### 6.6 Izvještaji i AI analiza
Ovaj tok koriste finansijski direktor, glavni računovođa i administrator.

Koraci:
1. Otvorite **Izvještaji**.
2. Odaberite tip izvještaja: sažeti ili detaljni.
3. Po potrebi podesite period od i period do.
4. Kliknite **Generiši**.
5. Pregledajte sažetak, grafikone i tabelu zapisa.
6. Ako je potrebno, kliknite **Pokreni AI analizu**.
7. Izvezite izvještaj u PDF, CSV ili XLSX formatu.

Očekivani rezultat:
- sistem prikazuje broj troškova, ukupni iznos, prosjek i iskorištenost budžeta
- detaljni izvještaj prikazuje listu relevantnih troškova
- AI analiza prikazuje dodatne preporuke, trendove i predviđanja
- export preuzima datoteku na računar

### 6.7 Notifikacije i obrada duplikata
Ovaj tok služi za pregled upozorenja i brz odgovor.

Koraci:
1. Otvorite **Notifikacije**.
2. Pregledajte listu obavještenja i filtrirajte ih po prioritetu.
3. Kliknite na notifikaciju da vidite detalje.
4. Ako se radi o duplikatu troška, odaberite **Odobri** ili **Obriši**.
5. Po potrebi kliknite **Označi kao pročitano** ili **Označi sve kao pročitano**.

Očekivani rezultat:
- odabrana notifikacija se označava kao pročitana
- broj nepročitanih notifikacija se smanjuje
- kod duplikata, trošak ostaje u listi ili se uklanja, u zavisnosti od odluke

## 7. Očekivana ograničenja sistema
Sistem je namjerno ograničen pravilima pristupa i poslovnom logikom.

- korisnik ne može koristiti aplikaciju bez prijave
- korisnik ne može sam kreirati novi nalog unutar aplikacije
- korisnik ne može mijenjati svoje uloge
- administrativni radnik ne može odobravati budžete
- finansijski direktor ne može unositi troškove 
- glavni računovođa ne može odobriti budžet, ali može slati doradu i uređivati nacrte
- odobreni, odbijeni ili budžeti na čekanju ne mogu se uređivati
- import nije moguć za fajlove koji nisu podržani ili prelaze dozvoljenu veličinu
- korisnik ne može pristupiti modulima za koje nema dozvolu; sistem ga vraća na početni ekran i prikazuje obavještenje o zabrani pristupa
- Keycloak admin panel je dostupan samo administratoru

## 8. Šta korisnik ne može raditi
Korisnik ne može:

- mijenjati bazu podataka direktno kroz aplikaciju
- ručno mijenjati sistemske šifre, role i prava pristupa
- odobriti budžet ako njegova uloga to ne dozvoljava
- izbrisati ili uređivati zapis koji je zaključan poslovnim pravilima
- zaobići validaciju datuma, iznosa i obaveznih polja
- uvesti nevalidne redove kao ispravne bez da ih sistem prvo označi kao validne
- otvoriti zaštićene ekrane bez autentifikacije
- koristiti funkcije koje nisu dostupne njegovoj ulozi

## 9. Kratki primjer poslovnog toka
Primjer za finansijskog direktora:

1. Glavni računovođa kreira budžet i pošalje ga na odobravanje.
2. Finansijski direktor otvara modul **Planiranje budžeta**.
3. Pregleda detalje, komentar i projekciju budžeta.
4. Klikne **Vrati na doradu** ili **Odbij** ili **Odobri**.
5. Sistem ažurira status budžeta i upisuje odgovarajući komentar ili obavještenje.

Očekivani rezultat:
- status budžeta se promijeni
- istorija komentara ostaje sačuvana
- odgovorne osobe dobijaju odgovarajuću notifikaciju
