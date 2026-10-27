# User Stories 

## Upravljanje korisnicima (RBAC)

### User story 1
#### ID: 1
#### Naziv: Dodjela uloga korisnicima
Kao administrator, želim dodijeliti uloge korisnicima kako bih kontrolisao pristup sistemu

**Sprint:** 5

**Poslovna vrijednost:** Osigurava sigurnost sistema

**Prioritet:** High  
**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da korisnici postoje u sistemu <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Sign in
<br>
**Acceptance Criteria** <br>
Kada administrator dodijeli ulogu korisniku, tada sistem mora sačuvati promjene <br>
Korisnik mora imati pristup samo dozvoljenim funkcijama <br>
Sistem ne smije dozvoliti nevažeće uloge <br>


### User story 2
#### ID: 2
#### Naziv: Ograničenje pristupa funkcijama
Kao administrator, želim ograničiti pristup određenim funkcionalnostima na osnovu uloge kako bih zaštitio osjetljive podatke

**Sprint:** 5

**Poslovna vrijednost:** Sprječava neovlašten pristup

**Prioritet:** High  
**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da su uloge definisane <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Dodjela uloga
<br>
**Acceptance Criteria** <br>
Kada korisnik pokuša pristupiti zabranjenoj funkciji, tada sistem mora odbiti pristup <br>
Sistem mora prikazati poruku o zabrani pristupa <br>
Pravila moraju važiti za sve korisnike <br>


## Unos troškova

### User story 1
#### ID: 3
#### Naziv: Ručni unos troška
Kao administrativni zaposlenik želim unijeti trošak putem forme kako bih mogao evidentirati sve relevantne finansijske podatke

**Sprint:** 5

**Poslovna vrijednost:** Omogućava centralizovanu evidenciju troškova

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da korisnik ima pristup sistemu  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Sign in  
**Acceptance Criteria**  
Kada korisnik unese sve potrebne podatke i klikne na “Sačuvaj”, tada sistem mora spremiti trošak u bazu  
Kada je trošak uspješno spremljen, tada sistem mora prikazati trošak u listi  
Sistem ne smije prikazati grešku prilikom spremanja validnih podataka  



### User story 2
#### ID: 4
#### Naziv: Unos atributa troška
Kao administrativni zaposlenik želim da prilikom unosa troška mogu odabrati kategoriju, projekat i odjel kako bi trošak bio pravilno organizovan

**Sprint:** 5

**Poslovna vrijednost:** Omogućava lakšu analizu i filtriranje troškova

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da su kategorije, projekti i odjeli definisani  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Ručni unos troška  
**Acceptance Criteria**  
Kada korisnik popuni sva obavezna polja, tada sistem mora povezati trošak sa odabranim atributima  
Kada neki atribut nije odabran, tada sistem mora upozoriti korisnika  



### User story 3
#### ID: 5
#### Naziv: Validacija unosa troška
Kao administrativni zaposlenik želim da sistem provjerava validnost unesenih podataka kako bih izbjegao greške

**Sprint:** 5

**Poslovna vrijednost:** Osigurava tačnost podataka

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da postoje definisana validaciona pravila  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Ručni unos troška  
**Acceptance Criteria**  
Kada korisnik unese neispravne podatke, tada sistem mora prikazati odgovarajuću grešku  
Sistem ne smije dozvoliti spremanje nevalidnih podataka  



## Sign In

### User story 1
#### ID: 6
#### Naziv: Prijava  
Kao ovlašteni korisnik sistema želim unijeti svoje korisničko ime i lozinku kako bih koristio funkcionalnosti prilagođene mojoj korisničkoj ulozi  

**Sprint:** 5

**Poslovna vrijednost:** Prijava omogućava pristup svim funkcionalnostima  
**Prioritet:** Low  

## Sign Out

### User story 1
#### ID: 7
#### Naziv: Odjava  
Kao prijavljeni korisnik želim odjaviti se iz sistema kako bih zaštitio svoje podatke i spriječio neovlašteni pristup kada završim s radom  

**Sprint:** 5

**Poslovna vrijednost:** Odjava štiti osjetljive finansijske podatke firme  
**Prioritet:** Low  

## Upravljanje korisnicima (RBAC)

### User story 1
#### ID: 8
#### Naziv: Pregled korisničkih uloga
Kao administrator, želim vidjeti sve korisnike i njihove uloge kako bih imao pregled sistema

**Sprint:** 6

**Poslovna vrijednost:** Olakšava upravljanje korisnicima

**Prioritet:** Medium

**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da korisnici postoje <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Dodjela uloga
<br>
**Acceptance Criteria** <br>
Kada administrator otvori listu korisnika, tada sistem mora prikazati korisnike i njihove uloge <br>
Sistem ne smije prikazati grešku <br>
Podaci moraju biti tačni i ažurni <br>


### User story 2
#### ID: 9
#### Naziv: Izmjena uloga
Kao administrator, želim mijenjati uloge korisnicima kako bih prilagodio njihove privilegije

**Sprint:** 6

**Poslovna vrijednost:** Fleksibilnost sistema

**Prioritet:** Medium

**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da korisnik već ima dodijeljenu ulogu <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Dodjela uloga i zavisi od Pregled korisnika
<br>
**Acceptance Criteria** <br>
Kada administrator promijeni ulogu korisniku, tada sistem mora sačuvati promjenu <br>
Sistem ne smije prikazati grešku <br>
romjena mora odmah stupiti na snagu <br>


## CRUD troškova

### User story 1
#### ID: 10
#### Naziv: Kreiranje troška
Kao korisnik sistema želim kreirati novi trošak kako bih mogao dodavati nove zapise

**Sprint:** 6

**Poslovna vrijednost:** Omogućava praćenje troškova

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da korisnik ima odgovarajuća prava  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Unos troškova  
**Acceptance Criteria**  
Kada korisnik kreira trošak, tada sistem mora spremiti podatke u bazu  
Sistem ne smije prikazati grešku prilikom kreiranja  



### User story 2
#### ID: 11
#### Naziv: Ažuriranje troška
Kao administrativni zaposlenik želim izmijeniti postojeći trošak kako bih mogao ispraviti podatke

**Sprint:** 6

**Poslovna vrijednost:** Održava tačnost podataka

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da trošak postoji u sistemu  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Pregled podataka  
**Acceptance Criteria**  
Kada korisnik izmijeni trošak i sačuva promjene, tada sistem mora ažurirati podatke  
Sistem ne smije prikazati grešku prilikom ažuriranja  



### User story 3
#### ID: 12
#### Naziv: Brisanje troška
Kao administrativni zaposlenik želim obrisati trošak kako bih uklonio netačne zapise

**Sprint:** 6

**Poslovna vrijednost:** Održava kvalitet baze

**Prioritet:** Medium

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da trošak postoji  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Pregled podataka  
**Acceptance Criteria**  
Kada korisnik potvrdi brisanje, tada sistem mora ukloniti trošak iz baze  
Sistem ne smije prikazati grešku prilikom brisanja  



### User story 4
#### ID: 13
#### Naziv: Kontrola pristupa CRUD operacijama
Kao administrator želim ograničiti CRUD operacije prema ulozi korisnika

**Sprint:** 6

**Poslovna vrijednost:** Osigurava sigurnost sistema

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da su uloge definisane  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Upravljanje korisnicima  
**Acceptance Criteria**  
Kada korisnik bez ovlasti pokuša izvršiti akciju, tada sistem mora blokirati pristup  
Sistem mora prikazati poruku o zabrani pristupa  



## Pregled podataka

### User story 1
#### ID: 14
#### Naziv: Pregled liste podataka
Kao glavni računovođa/finansijski direktor želim vidjeti listu podataka kako bih imao uvid u dostupne informacije

**Sprint:** 7

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



### User story 2
#### ID: 15
#### Naziv: Detaljan prikaz podataka
Kao glavni računovođa/finansijski direktor želim otvoriti detalje pojedinačnog zapisa kako bih vidio sve detalje vezane za njega

**Sprint:** 7

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


## Uvoz podataka

### User story 1
#### ID: 16
#### Naziv: Uvoz podataka iz fajla
Kao administrativni zaposlenik želim uvesti troškove iz CSV ili Excel fajla kako bih ubrzao unos

**Sprint:** 7

**Poslovna vrijednost:** Smanjuje manuelni rad

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da je fajl validnog formata  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Unos troškova  
**Acceptance Criteria**  
Kada korisnik učita fajl, tada sistem mora prikazati podatke za obradu  
Sistem ne smije prikazati grešku za validan fajl  



### User story 2
#### ID: 17
#### Naziv: Obrada uvezenih podataka
Kao administrativni zaposlenik želim da sistem automatski obradi podatke kako bi bili spremni za spremanje

**Sprint:** 7

**Poslovna vrijednost:** Automatizuje proces unosa

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da su podaci strukturirani  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Uvoz podataka  
**Acceptance Criteria**  
Kada sistem obradi podatke, tada ih mora transformisati u odgovarajući format  
Sistem ne smije izgubiti podatke tokom obrade  



### User story 3
#### ID: 18
#### Naziv: Validacija uvezenih podataka
Kao administrativni zaposlenik želim provjeriti ispravnost podataka prije spremanja

**Sprint:** 7

**Poslovna vrijednost:** Održava kvalitet baze

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da postoje validaciona pravila  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Obrada podataka  
**Acceptance Criteria**  
Kada postoje neispravni zapisi, tada sistem mora označiti greške  
Sistem ne smije spremiti nevalidne podatke  



## Pregled podataka

### User story 1
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


### User story 2
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



### User story 3
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



## Izvještaj

### User story 1
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



### User story 2
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



### User story 3
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



### User story 4
#### ID: 25
#### Naziv: Sažeti izvještaj
Kao menadžer želim vidjeti sažeti prikaz ključnih informacija

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


## Planiranje budžeta

### User story 1
#### ID: 26
#### Naziv: Kreiranje novog budžeta  
Kao glavni računovođa želim kreirati novi budžet po kategorijama, odjelima i vremenskom periodu kako bih mogao planirati troškove firme  

**Sprint:** 8

**Poslovna vrijednost:** Kreiranje budžeta je temeljna funkcionalnost cijelog sistema, bez unesenog plana nije moguće pratiti odstupanja, generisati upozorenja niti provoditi AI analizu  
**Prioritet:** High  

## Acceptance Criteria

### User story 1
#### ID: 27
#### Naziv: Pregled postojećeg budžeta  
Kao glavni računovođa ili finansijski direktor želim pregledati listu svih kreiranih budžeta i njihove detalje kako bih imao uvid u planirane iznose po kategorijama, odjelima i vremenskim periodima  

**Sprint:** 8

**Poslovna vrijednost:** Pregled budžeta omogućava svim odgovornim osobama da u svakom trenutku imaju jasnu sliku finansijskog plana firme  
**Prioritet:** High  

### User story 2
#### ID: 28
#### Naziv: Uređivanje postojećeg budžeta  
Kao glavni računovođa želim urediti postojeći budžet kako bih mogao ispraviti greške ili prilagoditi finansijski plan novim zahtjevima  

**Sprint:** 8

**Poslovna vrijednost:** Projekti se proširuju i bez mogućnosti uređivanja računovođa bi morao ponovo kreirati budžete što može dovesti do čestih grešaka  
**Prioritet:** High  

## Poređenje podataka

### User story 1
#### ID: 29
#### Naziv: Odabir podataka za poređenje
Kao glavni računovođa/finansijski direktor želim odabrati više zapisa kako bih ih mogao uporediti

**Sprint:** 9

**Poslovna vrijednost:** Osnova za funkcionalnost poređenja  

**Prioritet:** High  

**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da postoji lista podataka <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Pregled podataka
<br>
**Acceptance Criteria** <br>
Kada korisnik odabere više zapisa, tada sistem mora omogućiti poređenje <br>
Kada korisnik odabere samo jedan zapis, tada sistem ne smije omogućiti poređenje  <br>
Sistem mora jasno označiti odabrane zapise <br>


### User story 2
#### ID: 30
#### Naziv: Poređenje po kategorijama
Kao glavni računovođa/finansijski direktor, želim porediti podatke po kategorijama (npr. sektor, vremenski period) kako bih dobio detaljniji uvid u razlike.

**Sprint:** 9

**Poslovna vrijednost:** Omogućava precizniju analizu podataka

**Prioritet:** High  

**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da podaci imaju definisane kategorije  <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Odabir podataka za poređenje 
<br>
**Acceptance Criteria** <br>
Kada korisnik odabere kategoriju, tada sistem mora prikazati poređenje unutar te kategorije   <br>
Sistem mora omogućiti izbor više kategorija   <br>


### User story 3
#### ID: 31
#### Naziv: Poređenje planiranih i stvarnih troškova
Kao korisnik, želim porediti planirane i stvarne troškove kako bih identifikovao odstupanja.

**Sprint:** 9

**Poslovna vrijednost:** Omogućava bolju kontrolu troškova

**Prioritet:** High  

**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da postoje planirani i stvarni podaci <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Odabir podataka za poređenje i zavisi od Planiranje budžeta 
<br>
**Acceptance Criteria** <br>
Kada korisnik odabere podatke za poređenje, tada sistem mora prikazati planirane i stvarne troškove    <br>
Sistem mora jasno označiti razlike tj. odstupanja <br>


## Generisanje upozorenja

### User story 1
#### ID: 32
#### Naziv: Slanje notifikacije
Kao glavni računovođa želim primiti automatsku notifikaciju kada sistem detektuje anomaliju uočenu nakon AI analize

**Sprint:** 9

**Poslovna vrijednost:** Sprečava da greške prođu neopažene

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- 


## Acceptance Criteria

### User story 1
#### ID: 33
#### Naziv: Sažetak o uočenoj anomaliji
Kao glavni računovođa želim dobiti tekstualni opis uz svaku notifikaciju kako bih razumio ozbiljnost situacije

**Sprint:** 9

**Poslovna vrijednost:** Omogućava da se odmah stvori početna slika kakav problem je u pitanju

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- Da li se notifikacije slati i van aplikacije, npr. na mail?


## AI analiza

### User story 1
#### ID: 34
#### Naziv: Automatska validacija i detekcija anomalija pri unosu
Kao glavni računovođa želim da sistem odmah provjeri svaki uneseni trošak u odnosu na prosjek kategorije i prethodne obrasce kako bi spriječio unos nerealnih cifara ili duplih računa

**Sprint:** 9

**Poslovna vrijednost:** Osigurava čistu bazu podataka

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- 


## Acceptance Criteria

### User story 1
#### ID: 35
#### Naziv: Dubinska analiza trendova na zahtjev
Kao glavni računovođa želim jednim klikom pokrenuti AI analizu cjelokupne baze kako bih dobio izvještaj o kretanju troškova i predviđanje budžeta za naredni period

**Sprint:** 9

**Poslovna vrijednost:** Pruža dubinski uvid u poslovanje i pomaže u planiranju

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- Koliko unazad AI treba gledati podatke za validno predviđanje?


### User story 2
#### ID: 36
#### Naziv: Predviđanje potrošnje do kraja perioda
Kao glavni računovođa želim da sistem na osnovu trenutne brzine trošenja novca projektuje krajnje stanje budžeta za tekući mjesec.

**Sprint:** 9

**Poslovna vrijednost:** Omogućava planiranje i proaktivno djelovanje

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- 


### User story 3
#### ID: 37
#### Naziv: Pametno grupisanje troškova
Kao administrativni zaposlenik želim da mi AI predloži kategoriju troška na osnovu naziva stavke prilikom ručnog unosa.

**Sprint:** 9

**Poslovna vrijednost:** Ubrzava rad administracije.

**Prioritet:** Medium

# Pretpostavke i otvorena pitanja:
- Šta ako AI pogriješi, odnosno da li korisnik ima zadnju riječ (samo sugestije ili automatsko razvrstavanje)?


## Poređenje podataka

### User story 1
#### ID: 38
#### Naziv: Vizuelno poređenje podataka
Kao glavni računovođa/finansijski direktor, želim vidjeti podatke prikazane jedan pored drugog kako bih lakše uočio razlike

**Sprint:** 10

**Poslovna vrijednost:** Poboljšava donošenje odluke

**Prioritet:** High  
**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da su zapisi odabrani <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Odabir podataka za poređenje 
<br>
**Acceptance Criteria** <br>
Kada korisnik pokrene poređenje, tada sistem mora prikazati podatke paralelno <br>
Sistem mora jasno prikazati razlike između podataka <br>
Prikaz mora biti pregledan i razumljiv <br>


### User story 2
#### ID: 39
#### Naziv: Grafički prikaz poređenja podataka
Kao glavni računovođa/finansijski direktor, želim vidjeti grafički prikaz podataka kako bih lakše razumio razliike

**Sprint:** 10

**Poslovna vrijednost:** Poboljšava vizualizaciju i razumijevanje podataka

**Prioritet:** Medium

**Pretpostavke i otvorena pitanja** <br>
Pretpostavlja se da podaci postoje u strukturiranom obliku <br>
Koji tip grafikona koristiti (bar, line, pie)?  <br>

**Veze sa drugim storyjima ili zavisnostima** <br>
Zavisi od Odabir podataka za poređenje i zavisi od Poređenje planiranih i stvarnih troškova 
<br>
**Acceptance Criteria** <br>
Kada korisnik pokrene poređenje, tada sistem mora prikazati grafički prikaz podataka  <br>
Sistem mora omogućiti izbor tipa grafikona  <br>
Sistem ne smije prikazati grešku prilikom učitavanja grafikona <br>


## Acceptance Criteria

### User story 1
#### ID: 40
#### Naziv: Identifikacija sumnjivih obrazaca potrošnje
Kao glavni računovođa želim da sistem identifikuje neuobičajene termine unosa ili odstupanja u ponašanju korisnika kako bi se osigurala maksimalna kontrola.

**Sprint:** 10

**Poslovna vrijednost:** Povećava sigurnost i služi kao interna revizija koja radi konstantno

**Prioritet:** Medium

# Pretpostavke i otvorena pitanja:
- 


### User story 2
#### ID: 41
#### Naziv: Detekcija periodičnih troškova
Kao glavni računovođa želim da sistem identifikuje troškove koji se ponavljaju i upozori ako neki od njih izostane.

**Sprint:** 10

**Poslovna vrijednost:** Osigurava da se nijedna obaveza ne zaboravi

**Prioritet:** Medium

# Pretpostavke i otvorena pitanja:
- 


## Razvoj osnovnog UI Dashboarda

### User story 1
#### ID: 42
#### Naziv: Centralni interaktivni Dashboard
Kao glavni računovođa želim imati vizuelni prikaz ključnih metrika na jednom mjestu kako bih odmah razumio stanje budžeta.

**Sprint:** 10

**Poslovna vrijednost:** Štedi vrijeme jer se svi bitni podaci nalaze na jednom mjestu

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- Da li Dashboard treba imati real-time osvježavanje?


## Acceptance Criteria

### User story 1
#### ID: 43
#### Naziv: Bliži prikaz stanja
Kao glavni računovođa želim da klikom na npr. određeni grafikon dobijem listu svih pojedinačnih troškova koji čine sumu.

**Sprint:** 10

**Poslovna vrijednost:** Omogućava da "uvećamo" sliku, odnosno da umjesto na kompletan prikaz fokus prebacimo na specifičan dio

**Prioritet:** Medium

# Pretpostavke i otvorena pitanja:
- 


## Evidencija komentara

### User story 1
#### ID: 44
#### Naziv: Dodavanje komentara  
Kao glavni računovođa želim dodati komentar na trošak kako bih dodatno pojasnio određenu stavku  

**Sprint:** 10

**Poslovna vrijednost:** Omogućava bolju interpretaciju troškova i komunikaciju između korisnika  
**Prioritet:** Low  

## Acceptance Criteria

### User story 1
#### ID: 45
#### Naziv: Pregled komentara  
Kao glavni računovođa ili finansijski direktor želim pregledati komentare uz trošak kako bih imao uvid u dodatna objašnjenja  

**Sprint:** 10

**Poslovna vrijednost:** Povećava transparentnost i razumijevanje podataka  
**Prioritet:** Low
