# User Stories 

## Pregled podataka

### User story 1
#### ID: 1 
#### Naziv: Pregled liste podataka
Kao glavni računovođa/finansijski direktor želim vidjeti listu podataka kako bih imao uvid u dostupne informacije

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
#### ID: 2 
#### Naziv: Filtriranje podataka
Kao glavni računovođa/finansijski direktor želim filtrirati podatke po određenim kriterijima kako bih mogao pronaći lakše relevantne informacije

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

### User story 3
#### ID: 3
#### Naziv: Pretraga podataka
Kao glavni računovođa/finansijski direktor želim pretraživati podatke u listi putem ključnih riječi

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


### User story 4
#### ID: 4
#### Naziv: Detaljan prikaz podataka
Kao glavni računovođa/finansijski direktor želim otvoriti detalje pojedinačnog zapisa kako bih vidio sve detalje vezane za njega

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

### User story 5
#### ID: 5
#### Naziv: Sortiranje podataka
Kao glavni računovođa/finansijski direktor želim sortirati podatke po datumu, nazivu i vrijednosti kako bih ih lakše organizovao

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


## Poređenje podataka

### User story 1
#### ID: 6 
#### Naziv: Odabir podataka za poređenje
Kao glavni računovođa/finansijski direktor želim odabrati više zapisa kako bih ih mogao uporediti

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
#### ID: 7 
#### Naziv: Vizuelno poređenje podataka
Kao glavni računovođa/finansijski direktor, želim vidjeti podatke prikazane jedan pored drugog kako bih lakše uočio razlike

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

### User story 3
#### ID: 8
#### Naziv: Poređenje po kategorijama
Kao glavni računovođa/finansijski direktor, želim porediti podatke po kategorijama (npr. sektor, vremenski period) kako bih dobio detaljniji uvid u razlike.

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

### User story 4
#### ID: 9 
#### Naziv: Poređenje planiranih i stvarnih troškova
Kao korisnik, želim porediti planirane i stvarne troškove kako bih identifikovao odstupanja.

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

### User story 5
#### ID: 10 
#### Naziv: Grafički prikaz poređenja podataka
Kao glavni računovođa/finansijski direktor, želim vidjeti grafički prikaz podataka kako bih lakše razumio razliike

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

## Upravljanje korisnicima (RBAC)

### User story 1
#### ID: 11
#### Naziv: Dodjela uloga korisnicima
Kao administrator, želim dodijeliti uloge korisnicima kako bih kontrolisao pristup sistemu

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
#### ID: 12
#### Naziv: Ograničenje pristupa funkcijama
Kao administrator, želim ograničiti pristup određenim funkcionalnostima na osnovu uloge kako bih zaštitio osjetljive podatke

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

### User story 3
#### ID: 13
#### Naziv: Pregled korisničkih uloga
Kao administrator, želim vidjeti sve korisnike i njihove uloge kako bih imao pregled sistema

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

### User story 4
#### ID: 14
#### Naziv: Izmjena uloga
Kao administrator, želim mijenjati uloge korisnicima kako bih prilagodio njihove privilegije

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

## Unos troškova

### User story 1
#### ID: 15
#### Naziv: Ručni unos troška
Kao administrativni zaposlenik želim unijeti trošak putem forme kako bih mogao evidentirati sve relevantne finansijske podatke

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
#### ID: 16
#### Naziv: Unos atributa troška
Kao administrativni zaposlenik želim da prilikom unosa troška mogu odabrati kategoriju, projekat i odjel kako bi trošak bio pravilno organizovan

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
#### ID: 17
#### Naziv: Validacija unosa troška
Kao administrativni zaposlenik želim da sistem provjerava validnost unesenih podataka kako bih izbjegao greške

**Poslovna vrijednost:** Osigurava tačnost podataka

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da postoje definisana validaciona pravila  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Ručni unos troška  
**Acceptance Criteria**  
Kada korisnik unese neispravne podatke, tada sistem mora prikazati odgovarajuću grešku  
Sistem ne smije dozvoliti spremanje nevalidnih podataka  


## CRUD troškova

### User story 1
#### ID: 18
#### Naziv: Kreiranje troška
Kao korisnik sistema želim kreirati novi trošak kako bih mogao dodavati nove zapise

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
#### ID: 19
#### Naziv: Ažuriranje troška
Kao administrativni zaposlenik želim izmijeniti postojeći trošak kako bih mogao ispraviti podatke

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
#### ID: 20
#### Naziv: Brisanje troška
Kao administrativni zaposlenik želim obrisati trošak kako bih uklonio netačne zapise

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
#### ID: 21
#### Naziv: Kontrola pristupa CRUD operacijama
Kao administrator želim ograničiti CRUD operacije prema ulozi korisnika

**Poslovna vrijednost:** Osigurava sigurnost sistema

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da su uloge definisane  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Upravljanje korisnicima  
**Acceptance Criteria**  
Kada korisnik bez ovlasti pokuša izvršiti akciju, tada sistem mora blokirati pristup  
Sistem mora prikazati poruku o zabrani pristupa  


## Uvoz podataka

### User story 1
#### ID: 22
#### Naziv: Uvoz podataka iz fajla
Kao administrativni zaposlenik želim uvesti troškove iz CSV ili Excel fajla kako bih ubrzao unos

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
#### ID: 23
#### Naziv: Obrada uvezenih podataka
Kao administrativni zaposlenik želim da sistem automatski obradi podatke kako bi bili spremni za spremanje

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
#### ID: 24
#### Naziv: Validacija uvezenih podataka
Kao administrativni zaposlenik želim provjeriti ispravnost podataka prije spremanja

**Poslovna vrijednost:** Održava kvalitet baze

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da postoje validaciona pravila  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Obrada podataka  
**Acceptance Criteria**  
Kada postoje neispravni zapisi, tada sistem mora označiti greške  
Sistem ne smije spremiti nevalidne podatke  


## Izvještaj

### User story 1
#### ID: 25
#### Naziv: Generisanje izvještaja
Kao finansijski direktor želim generisati izvještaj o troškovima kako bih imao pregled finansijskog stanja

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
#### ID: 26
#### Naziv: Izvještaj po periodu
Kao finansijski direktor želim filtrirati izvještaj po vremenskom periodu

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
#### ID: 27
#### Naziv: Export izvještaja
Kao korisnik želim izvesti izvještaj u različitim formatima

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
#### ID: 28
#### Naziv: Sažeti izvještaj
Kao menadžer želim vidjeti sažeti prikaz ključnih informacija

**Poslovna vrijednost:** Omogućava brzu procjenu stanja

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da postoje agregirani podaci  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Generisanje izvještaja  
**Acceptance Criteria**  
Kada korisnik otvori izvještaj, tada sistem mora prikazati ključne informacije  
Sistem ne smije prikazati grešku prilikom učitavanja

## Generisanje upozorenja

### User story 1
#### ID: 29
#### Naziv: Slanje notifikacije
Kao glavni računovođa želim primiti automatsku notifikaciju kada sistem detektuje anomaliju uočenu nakon AI analize

**Poslovna vrijednost:** Sprečava da greške prođu neopažene

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- 

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od AI analiza
- Zavisi od Upravljanje korisnicima / RBAC

## Acceptance Criteria
- Kada AI identifikuje anomaliju, tada sistem mora generisati notifikaciju unutar aplikacije
- Notifikacija mora sadržavati naslov i kratki opis problema

### User story 2
#### ID: 30
#### Naziv: Sažetak o uočenoj anomaliji
Kao glavni računovođa želim dobiti tekstualni opis uz svaku notifikaciju kako bih razumio ozbiljnost situacije

**Poslovna vrijednost:** Omogućava da se odmah stvori početna slika kakav problem je u pitanju

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- Da li se notifikacije slati i van aplikacije, npr. na mail?

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od AI analiza
- Zavisi od Upravljanje korisnicima / RBAC

## Acceptance Criteria
- Kada korisnik otvori notifikaciju, tada sistem mora prikazati tekstualno obrazloženje
- Sistem mora naznačiti nivo ozbiljnosti (crveno, narandžasto, žuto)

## AI analiza

### User story 1
#### ID: 31
#### Naziv: Automatska validacija i detekcija anomalija pri unosu
Kao glavni računovođa želim da sistem odmah provjeri svaki uneseni trošak u odnosu na prosjek kategorije i prethodne obrasce kako bi spriječio unos nerealnih cifara ili duplih računa

**Poslovna vrijednost:** Osigurava čistu bazu podataka

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- 

## Veze sa drugim storyjima ili zavisnostima:
- Preduvjet za Generisanje upozorenja
- Zavisi od Unos troškova i Uvoz podataka
- Zavisi od Upravljanje korisnicima / RBAC

## Acceptance Criteria
- Kada se unese novi trošak, tada sistem mora u pozadini izvršiti poređenje s podacima te kategorije
- Ako sistem detektuje odstupanje, tada isto mora označava
- Sistem mora prepoznati dupli unos ako uoči podudaranje

### User story 2
#### ID: 32
#### Naziv: Dubinska analiza trendova na zahtjev
Kao glavni računovođa želim jednim klikom pokrenuti AI analizu cjelokupne baze kako bih dobio izvještaj o kretanju troškova i predviđanje budžeta za naredni period

**Poslovna vrijednost:** Pruža dubinski uvid u poslovanje i pomaže u planiranju

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- Koliko unazad AI treba gledati podatke za validno predviđanje?

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od Unos i uvoz troškova
- Zavisi od Planiranje budžeta
- Preduvjet za Razvoj Dashboarda
- Zavisi od Upravljanje korisnicima / RBAC

## Acceptance Criteria
- Kada korisnik pokrene AI analizu, tada sistem mora obraditi sve podatke i generisati vizuelni prikaz trendova
- Rezultat analize mora uključivati procjenu troškova za naredni mjesec

### User story 3
#### ID: 33
#### Naziv: Identifikacija sumnjivih obrazaca potrošnje
Kao glavni računovođa želim da sistem identifikuje neuobičajene termine unosa ili odstupanja u ponašanju korisnika kako bi se osigurala maksimalna kontrola.

**Poslovna vrijednost:** Povećava sigurnost i služi kao interna revizija koja radi konstantno

**Prioritet:** Medium

# Pretpostavke i otvorena pitanja:
- 

## Veze sa drugim storyjima ili zavisnostima:
- Povezan s Generisanje upozorenja
- Zavisi od Upravljanje korisnicima / RBAC

## Acceptance Criteria
- Kada korisnik unese trošak u vrijeme koje odstupa od uobičajenog radnog vremena, tada sistem mora označiti taj unos zastavicom
- Kada se detektuje učestalo brisanje ili modifikovanje unesenih zapisa od strane korisnika, tada sistem mora generisati upozorenje

### User story 4
#### ID: 34
#### Naziv: Predviđanje potrošnje do kraja perioda
Kao glavni računovođa želim da sistem na osnovu trenutne brzine trošenja novca projektuje krajnje stanje budžeta za tekući mjesec.

**Poslovna vrijednost:** Omogućava planiranje i proaktivno djelovanje

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- 

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od Planiranje budžeta
- Preduvjet za UI Dashboard
- Zavisi od Upravljanje korisnicima / RBAC

## Acceptance Criteria
- Kada korisnik otvori analitiku, tada sistem mora izračunati i prikazati procjenu ukupnog troška na kraju mjeseca
- Kada projekcija pokazuje da će budžet biti premašen, tada sistem mora prikazati procenat prekoračenja

### User story 5
#### ID: 35
#### Naziv: Pametno grupisanje troškova
Kao administrativni zaposlenik želim da mi AI predloži kategoriju troška na osnovu naziva stavke prilikom ručnog unosa.

**Poslovna vrijednost:** Ubrzava rad administracije.

**Prioritet:** Medium

# Pretpostavke i otvorena pitanja:
- Šta ako AI pogriješi, odnosno da li korisnik ima zadnju riječ (samo sugestije ili automatsko razvrstavanje)?

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od Ručni unos troška
- Povezan s Validacija unosa
- Zavisi od Upravljanje korisnicima / RBAC

## Acceptance Criteria
- Kada korisnik unese naziv troška, tada sistem mora analizirati ključne riječi i predložiti najvjerovatniju kategoriju
- Sistem mora omogućiti korisniku da ručno promijeni predloženu kategoriju ako smatra da AI sugestija nije dobra
  
### User story 6
#### ID: 36
#### Naziv: Detekcija periodičnih troškova
Kao glavni računovođa želim da sistem identifikuje troškove koji se ponavljaju i upozori ako neki od njih izostane.

**Poslovna vrijednost:** Osigurava da se nijedna obaveza ne zaboravi

**Prioritet:** Medium

# Pretpostavke i otvorena pitanja:
- 

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od Pregled podataka
- Povezan s Generisanje upozorenja
- Zavisi od Upravljanje korisnicima / RBAC

## Acceptance Criteria
- Kada sistem detektuje da se određeni trošak ponavlja u nekim intervalima, tada ga mora označiti kao periodični trošak
- Ako periodični trošak ne bude unesen do par dana nakon uobičajenog datuma, tada sistem mora poslati podsjetnika

## Razvoj osnovnog UI Dashboarda

### User story 1
#### ID: 36
#### Naziv: Centralni interaktivni Dashboard
Kao glavni računovođa želim imati vizuelni prikaz ključnih metrika na jednom mjestu kako bih odmah razumio stanje budžeta.

**Poslovna vrijednost:** Štedi vrijeme jer se svi bitni podaci nalaze na jednom mjestu

**Prioritet:** High

# Pretpostavke i otvorena pitanja:
- Da li Dashboard treba imati real-time osvježavanje?

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od Sign in / RBAC
- Zavisi od AI analiza
- Zavisi od Planiranje budžeta

## Acceptance Criteria
- Kada korisnik otvori Dashboard, tada sistem mora prikazati: odnos ukupna potrošnja-budžet, troškove po odjelima i listu posljednjih AI upozorenja
- Sistem mora koristiti "semafor boje" kako bi dočarao stanje

### User story 2
#### ID: 37
#### Naziv: Bliži prikaz stanja
Kao glavni računovođa želim da klikom na npr. određeni grafikon dobijem listu svih pojedinačnih troškova koji čine sumu.

**Poslovna vrijednost:** Omogućava da "uvećamo" sliku, odnosno da umjesto na kompletan prikaz fokus prebacimo na specifičan dio

**Prioritet:** Medium

# Pretpostavke i otvorena pitanja:
- 

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od Pregled podataka

## Acceptance Criteria
- Kada korisnik klikne na grafikon, tada sistem mora otvoriti tabelarni prikaz svih troškova koji pripadaju tom segmentu
- Mora se omogućiti povratak na početni ekran

---
## Planiranje budžeta

### User story 1
#### ID: 38
#### Naziv: Kreiranje novog budžeta  
Kao glavni računovođa želim kreirati novi budžet po kategorijama, odjelima i vremenskom periodu kako bih mogao planirati troškove firme  

**Poslovna vrijednost:** Kreiranje budžeta je temeljna funkcionalnost cijelog sistema, bez unesenog plana nije moguće pratiti odstupanja, generisati upozorenja niti provoditi AI analizu  
**Prioritet:** High  
## Pretpostavke i otvorena pitanja
Otvoreno pitanje: Da li postoji gornji limit ukupnog iznosa budžeta?

## Veze sa drugim storyjima
- Preduvjet za Pregled i uređivanje budžeta
- Zavisi od Upravljanje korisnicima / RBAC
- Preduvjet za Poređenje podataka
- Zavisi od Sign in

## Acceptance Criteria
- Kada ovlašteni korisnik pristupi modulu za planiranje budžeta, ako klikne dugme "Kreiraj novi budžet", tada sistem mora prikazati formu za kreiranje novog budžeta sa obaveznim poljima: naziv budžeta, vremenski period (datum početka i završetka), odjel, kategorija i planirani iznos.
- Kada ovlašteni korisnik ispravno popuni sva obavezna polja, ako klikne "Sačuvaj", tada sistem mora sačuvati budžet i prikazati poruku "Budžet je uspješno kreiran".
- Sistem ne smije dozvoliti kreiranje budžeta sa iznosom manjim ili jednakim nuli. .
- Sistem ne smije dozvoliti kreiranje budžeta ako datum završetka prethodi datumu početka.
- Kada korisnik pokuša kreirati budžet sa praznim poljima, tada sistem mora vizualno označiti prazna obavezna polja.

### User story 2
#### ID: 39
#### Naziv: Pregled postojećeg budžeta  
Kao glavni računovođa ili finansijski direktor želim pregledati listu svih kreiranih budžeta i njihove detalje kako bih imao uvid u planirane iznose po kategorijama, odjelima i vremenskim periodima  

**Poslovna vrijednost:** Pregled budžeta omogućava svim odgovornim osobama da u svakom trenutku imaju jasnu sliku finansijskog plana firme  
**Prioritet:** High  
## Pretpostavke i otvorena pitanja
- Pretpostavlja se da je barem jedan budžet već kreiran 

## Veze sa drugim storyjima
- Zavisi od Kreiranje budžeta 
- Zavisi od Sign in
- Zavisi od Upravljanje korisnicima / RBAC
- Preduvjet za Uređivanje budžeta 

## Acceptance Criteria
- Kada ovlašteni korisnik pristupi modulu za planiranje budžeta, tada sistem mora prikazati listu svih kreiranih budžeta..
- Kada korisnik odabere određeni budžet iz liste, tada sistem mora prikazati detaljan pregled tog budžeta sa svim stavkama raspoređenim po kategorijama, odjelima.
- Kada korisnik pristupi modulu za pregled budžeta, ako ne postoji nijedan kreiran budžet, tada sistem mora prikazati poruku "Trenutno nema kreiranih budžeta" umjesto prazne liste.
- Sistem ne smije prikazati opciju za uređivanje za neovlaštene korisnike.

### User story 3
#### ID: 40
#### Naziv: Uređivanje postojećeg budžeta  
Kao glavni računovođa želim urediti postojeći budžet kako bih mogao ispraviti greške ili prilagoditi finansijski plan novim zahtjevima  

**Poslovna vrijednost:** Projekti se proširuju i bez mogućnosti uređivanja računovođa bi morao ponovo kreirati budžete što može dovesti do čestih grešaka  
**Prioritet:** High  
## Pretpostavke i otvorena pitanja
- Pretpostavlja se da korisnik može pronaći i otvoriti budžet
Otvoreno pitanje: Da li se budžet može obrisati?

## Veze sa drugim storyjima
- Zavisi od Pregled budžeta
- Zavisi od Upravljanje korisnicima / RBAC)
- Povezan sa Poređenje podataka (izmjene budžeta direktno utiču na poređenja)
- Povezan sa Generisanje upozorenja (izmjena budžeta može promijeniti pragove upozorenja)

## Acceptance Criteria
- Kada se ovlašteni korisnik nalazi na detaljnom pregledu postojećeg budžeta, ako klikne dugme "Uredi", tada sistem mora omogućiti izmjenu.
- Kada se ovlašteni korisnik nalazi na formi za uređivanje budžeta sa validno popunjenim poljima, ako klikne dugme "Sačuvaj", tada sistem mora ažurirati podatke budžeta.
- Sistem ne smije dozvoliti da uređivanjem nastanu dva budžeta sa istim odjelom, kategorijom i vremenskim periodom. Korisnik treba dobiti upozorenje "Budžet za ovaj period i odjel već postoji".
- Sistem ne smije dozvoliti uređivanje budžeta sa iznosom manjim ili jednakim nuli.
- Kada ovlašteni korisnik počne uređivati budžet ali ne sačuva izmjene, ako pokuša napustiti stranicu, tada sistem mora prikazati upozorenje "Želite li sačuvati izmjene?"
---

## Sign In

### User story 1
#### ID: 41 
#### Naziv: Prijava  
Kao ovlašteni korisnik sistema želim unijeti svoje korisničko ime i lozinku kako bih koristio funkcionalnosti prilagođene mojoj korisničkoj ulozi  

**Poslovna vrijednost:** Prijava omogućava pristup svim funkcionalnostima  
**Prioritet:** Low  
## Pretpostavke i otvorena pitanja
- Pretpostavlja se da administrator unaprijed kreira korisničke račune
- Pretpostavlja se da svaki korisnik ima dodijeljenu ulogu pri kreiranju računa

## Veze sa drugim storyjima
- Preduvjet za sve ostale user storije (korisnik mora biti prijavljen)
- Zavisi od Upravljanje korisnicima / RBAC

## Acceptance Criteria
- Kada korisnik otvori aplikaciju, tada sistem mora prikazati stranicu za prijavu sa poljima za email i lozinku i dugmetom "Prijavi se".
- Kada korisnik unese ispravne podatke, ako klikne "Prijavi se", tada sistem mora prepoznati korisnika.
- Kada se korisnik uspješno prijavi, tada sistem mora preusmjeriti korisnika na dashboard u skladu sa njegovom ulogom
- Kada korisnik unese neispravne podatke, tada sistem mora prikazati generičku poruku greške.
- Sistem ne smije prikazati unesenu lozinku u čitljivom obliku.
- Sistem ne smije dozvoliti pristup korisniku koji nije prijavljen, direktan pristup putem URL-a mora preusmjeriti korisnika na stranicu za prijavu.
- Kada korisnik pokuša prijaviti se sa praznim poljima, tada sistem mora vizualno označiti prazna obavezna polja.
---

## Sign Out

### User story 1
#### ID: 42  
#### Naziv: Odjava  
Kao prijavljeni korisnik želim odjaviti se iz sistema kako bih zaštitio svoje podatke i spriječio neovlašteni pristup kada završim s radom  

**Poslovna vrijednost:** Odjava štiti osjetljive finansijske podatke firme  
**Prioritet:** Low  
## Pretpostavke i otvorena pitanja
- Pretpostavlja se da je korisnik prethodno prijavljen
Otvoreno pitanje: Koliko dugo traje aktivna sesija prije automatske odjave?

## Veze sa drugim storyjima
- Zavisi od Sign in (odjava nema smisla bez prijave)

## Acceptance Criteria
- Kada je korisnik prijavljen i nalazi se na bilo kojoj stranici sistema, ako pogleda navigaciju, tada sistem mora prikazati vidljivu opciju "Odjavi se".
- Kada se korisnik nalazi na bilo kojoj stranici sistema, ako klikne "Odjavi se", tada sistem treba preusmjeriti korisnika na stranicu za prijavu.
- Kada se korisnik uspješno odjavio, ako pritisne dugme za povratak u browseru, tada sistem ne smije prikazati sadržaj. Korisnik mora ostati na stranici za prijavu.
---

## Evidencija komentara

### User story 1
#### ID: 43
#### Naziv: Dodavanje komentara  
Kao glavni računovođa želim dodati komentar na trošak kako bih dodatno pojasnio određenu stavku  

**Poslovna vrijednost:** Omogućava bolju interpretaciju troškova i komunikaciju između korisnika  
**Prioritet:** Low  
## Pretpostavke i otvorena pitanja:
Otvoreno pitanje: Da li je potrebna mogućnost uređivanja ili brisanja komentara?

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od Sign in 
- Zavisi od Unos troškova 
- Povezan sa Pregled podataka (komentari su vidljivi u pregledu)

## Acceptance Criteria
- Kada korisnik otvori trošak, ako klikne “Dodaj komentar”, tada sistem mora omogućiti unos teksta.
- Kada korisnik unese validan tekst i klikne "Pošalji", tada sistem mora sačuvati komentar i prikazati ga u listi komentara ispod te stavke.
- Sistem mora povezati komentar sa odgovarajućim troškom.
- Sistem ne smije dozvoliti unos praznog komentara.

### User story 2
#### ID: 44 
#### Naziv: Pregled komentara  
Kao glavni računovođa ili finansijski direktor želim pregledati komentare uz trošak kako bih imao uvid u dodatna objašnjenja  

**Poslovna vrijednost:** Povećava transparentnost i razumijevanje podataka  
**Prioritet:** Low  
## Pretpostavke:
- Pretpostavlja se da komentari postoje

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od dodavanje komentara

## Acceptance Criteria
- Sistem mora prikazati listu komentara za odabrani trošak.
- Kada se korisnik nalazi na detaljnom pregledu troška koji ima komentare, tada sistem mora uz svaki komentar prikazati ime autora te datum i vrijeme kreiranja.
- Sistem mora prikazati sadržaj komentara.
- Sistem mora prikazati komentare sortirane od najstarijeg prema najnovijem.
