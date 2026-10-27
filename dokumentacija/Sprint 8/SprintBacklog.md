| ID | Naziv zadatka / Story-ja | Odgovorne osobe | Status | Napomena |
|:---|:---|:---|:---|:---|
| US-14 | **Pregled liste podataka** - Kao glavni računovođa/finansijski direktor želim vidjeti listu podataka kako bih imao uvid u dostupne informacije | Adna Bajramović, Amina Memić| Done | Uz konsultaciju s ostatkom tima |
| US-15 | **Detaljan prikaz podataka** - Kao glavni računovođa/finansijski direktor želim otvoriti detalje pojedinačnog zapisa kako bih vidio sve detalje vezane za njega| Adna Bajramović, Amina Memić | Done | Uz konsultaciju s ostatkom tima |
| US-19 | **Filtriranje podataka** - Kao glavni računovođa/finansijski direktor želim filtrirati podatke po određenim kriterijima kako bih mogao pronaći lakše relevantne informacije| Nejla Ćenanović, Elvedina Halilović | Done | Uz konsultaciju s ostatkom tima |
| US-20 | **Pretraga podataka** - Kao glavni računovođa/finansijski direktor želim pretraživati podatke u listi putem ključnih riječi | Elvedina Halilović , Nejla Ćenanović| Done | Uz konsultaciju s ostatkom tima  |
| US-21 | **Sortiranje podataka** - Kao glavni računovođa/finansijski direktor želim sortirati podatke po datumu, nazivu i vrijednosti kako bih ih lakše organizovaoa | Elvedina Halilović, Nejla Ćenanović | Done  | Uz konsultaciju s ostatkom tima |
| US-22 | **Generisanje izvještaja** - Kao finansijski direktor želim generisati izvještaj o troškovima kako bih imao pregled finansijskog stanja | Omer Valjevac, Faris Aljić | Done | Uz konsultaciju s ostatkom tima |
| US-23 | **Izvještaj po periodu** - Kao finansijski direktor želim filtrirati izvještaj po vremenskom periodu | Omer Valjevac, Faris Aljić | Done | Uz konsultaciju s ostatkom tima |
| US-24 | **Export izvještaja** - Kao korisnik želim izvesti izvještaj u različitim formatima | Omer Valjevac, Ramiz Plančić | Done | Uz konsultaciju s ostatkom tima |
| US-25 | **Sažeti izvještaj** -Kao finansijski direktor želim vidjeti sažeti prikaz ključnih informacija | Omer Valjevac, Ramiz Plančić | Done | Uz konsultaciju s ostatkom tima |

#### ID: 14
#### Naziv: Pregled liste podataka
Kao glavni računovođa/finansijski direktor želim vidjeti listu podataka kako bih imao uvid u dostupne informacije

**Sprint:** 8

**Poslovna vrijednost:** Omogućava brz pregled podataka  

**Prioritet:** High  

**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da podaci postoje u sistemu <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Sign in
<br>
**Acceptance Criteria** <br>
Kada korisnik otvori stranicu sa podacima, tada sistem mora prikazati listu podataka <br>
Kada nema podataka, tada sistem mora prkazati odgovarajuću poruku  <br>
Sistem ne smije prikazati grešku prilikom učitavanja liste

#### ID: 15
#### Naziv: Detaljan prikaz podataka
Kao glavni računovođa/finansijski direktor želim otvoriti detalje pojedinačnog zapisa kako bih vidio sve detalje vezane za njega

**Sprint:** 8

**Poslovna vrijednost:** Omogućava dublju analizu podataka

**Prioritet:** Medium

**Pretpostavke i otvorena pitanja**
Pretpostavlja se da zapis postoji <br>
**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Pregled liste podataka
<br>
**Acceptance Criteria** <br>
Kada korisnik klikne na zapis, tada sistem mora prikazati detalje tog zapisa <br>
Ako korisnik klikne na zapis, tada prikaz mora sadržavati sve relevantne informacije  <br>
Sistem ne smije prikazati grešku prilkom učitavanja detalja

#### ID: 19
#### Naziv: Filtriranje podataka
Kao glavni računovođa/finansijski direktor želim filtrirati podatke po određenim kriterijima kako bih mogao pronaći lakše relevantne informacije

**Sprint:** 8

**Poslovna vrijednost:** Smanjuje vrijeme pretrage

**Prioritet:** High  


**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da podaci postoje u sistemu <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Pregled liste podataka <br>
<br>
**Acceptance Criteria** <br>
Kada korisnik odabere filter kriterij, tada sistem mora prikazati filtrirane podatke <br>
Kada nema podataka, tada sistem mora prikazati poruku "Nema rezultata" <br>
Kada korisnik resetuje filtere, tada sistem mora prikazati sve podatke

#### ID: 20
#### Naziv: Pretraga podataka
Kao glavni računovođa/finansijski direktor želim pretraživati podatke u listi putem ključnih riječi

**Sprint:** 8

**Poslovna vrijednost:** Poboljšava korisničko iskustvo

**Prioritet:** High  


**Pretpostavke i otvorena pitanja**
Pretpostavlja se da postoji polje za pretragu <br>
**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Pregled liste podataka
<br>
**Acceptance Criteria** <br>
Kada korisnik unese ključnu riječ, tada sistem mora prikazati odgovarajuće podatke <br>
Kada nema podataka, tada sistem mora prikazati poruku "Nema rezultata" <br>
Sistem ne smije napraviti grešku prilikom pretrage

#### ID: 21
#### Naziv: Sortiranje podataka
Kao glavni računovođa/finansijski direktor želim sortirati podatke po datumu, nazivu i vrijednosti kako bih ih lakše organizovao

**Sprint:** 8

**Poslovna vrijednost:** Pomaže u analizi i organizaciji podataka

**Prioritet:** Medium 

**Pretpostavke i otvorena pitanja**
Pretpostavlja se da podaci imaju atribute za sortiranje <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Pregled liste podataka
<br>
**Acceptance Criteria** <br>
Kada korisnik odabere kriterij sortiranja, podaci se moraju sortirati ispravno <br>
Kada korisnik promijeni način sortiranja, tada sistem mora ažurirati prikaz  <br>

#### ID: 22
#### Naziv: Generisanje izvještaja
Kao finansijski direktor želim generisati izvještaj o troškovima kako bih imao pregled finansijskog stanja

**Sprint:** 8

**Poslovna vrijednost:** Podržava donošenje odluka

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da podaci postoje  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Pregled podataka  
**Acceptance Criteria**  
Kada korisnik generiše izvještaj, tada sistem mora prikazati podatke  
Sistem ne smije prikazati grešku prilikom generisanja  

#### ID: 23
#### Naziv: Izvještaj po periodu
Kao finansijski direktor želim filtrirati izvještaj po vremenskom periodu

**Sprint:** 8

**Poslovna vrijednost:** Omogućava analizu trendova

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da podaci imaju vremensku oznaku  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Generisanje izvještaja  
**Acceptance Criteria**  
Kada korisnik odabere period, tada sistem mora prikazati relevantne podatke  
Sistem ne smije prikazati podatke van odabranog perioda  

#### ID: 24
#### Naziv: Export izvještaja
Kao korisnik želim izvesti izvještaj u različitim formatima

**Sprint:** 8

**Poslovna vrijednost:** Olakšava dijeljenje podataka

**Prioritet:** Medium

**Pretpostavke i otvorena pitanja**  
Koji formati su podržani (PDF, Excel)?  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Generisanje izvještaja  
**Acceptance Criteria**  
Kada korisnik izvrši export, tada sistem mora generisati i omogućiti preuzimanje fajla  
Sistem ne smije prikazati grešku tokom izvoza  

#### ID: 25
#### Naziv: Sažeti izvještaj
Kao finansijski direktor želim vidjeti sažeti prikaz ključnih informacija

**Sprint:** 8

**Poslovna vrijednost:** Omogućava brzu procjenu stanja

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da postoje agregirani podaci  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Generisanje izvještaja  
**Acceptance Criteria**  
Kada korisnik otvori izvještaj, tada sistem mora prikazati ključne informacije  
Sistem ne smije prikazati grešku prilikom učitavanja
