# User Stories 

## Pregled podataka

### User story 1
#### ID: 1 
#### Naziv: Pregled liste podataka
Kao korisnik želim vidjeti listu podataka kako bih imao uvid u dostupne informacije

**Poslovna vrijednost:** Omogućava brz pregled podataka  

**Prioritet:** High  

### User story 2
#### ID: 2 
#### Naziv: Filtriranje podataka
Kao korisnik želim filtrirati podatke po određenim kriterijima kako bih mogao pronaći lakše relevantne informacije

**Poslovna vrijednost:** Smanjuje vrijeme pretrage

**Prioritet:** High  

### User story 3
#### ID: 3
#### Naziv: Pretraga podataka
Kao korisnik želim pretraživati podatke u listi putem ključnih riječi

**Poslovna vrijednost:** Poboljšava korisničko iskustvo

**Prioritet:** High  

### User story 4
#### ID: 4
#### Naziv: Detaljan prikaz podataka
Kao korisnik želim otvoriti detalje pojedinačnog zapisa kako bih vidio sve detalje vezane za njega

**Poslovna vrijednost:** Omogućava dublju analizu podataka

**Prioritet:** Medium

### User story 5
#### ID: 5
#### Naziv: Sortiranje podataka
Kao korisnik želim sortirati podatke po datumu, nazivu, vrijednosti kako bih ih lakše organizovao

**Poslovna vrijednost:** Pomaže u analizi i organizaciji podataka

**Prioritet:** Medium 

## Poređenje podataka

### User story 1
#### ID: 6 
#### Naziv: Odabir podataka za poređenje
Kao korisnik želim odabrati više zapisa kako bih ih mogao uporediti

**Poslovna vrijednost:** Osnova za funkcionalnost poređenja  

**Prioritet:** High  

### User story 2
#### ID: 7 
#### Naziv: Vizuelno poređenje podataka
Kao korisnik, želim vidjeti podatke prikazane jedan pored drugog kako bih lakše uočio razlike

**Poslovna vrijednost:** Poboljšava donošenje odluke

**Prioritet:** High  

## Upravljanje korisnicima (RBAC)

### User story 1
#### ID:
#### Naziv: Dodjela uloga korisnicima
Kao administrator, želim dodijeliti uloge korisnicima kako bih kontrolisao pristup sistemu

**Poslovna vrijednost:** Osigurava sigurnost sistema

**Prioritet:** High  

### User story 2
#### ID:
#### Naziv: Ograničenje pristupa funkcijama
Kao administrator, želim ograničiti pristup određenim funkcionalnostima na osnovu uloge kako bih zaštitio osjetljive podatke

**Poslovna vrijednost:** Sprječava neovlašten pristup

**Prioritet:** High  

### User story 3
#### ID:
#### Naziv: Pregled korisničkih uloga
Kao administrator, želim vidjeti sve korisnike i njihove uloge kako bih imao pregled sistema

**Poslovna vrijednost:** Olakšava upravljanje korisnicima

**Prioritet:** Medium

### User story 4
#### ID:
#### Naziv: Izmjena uloga
Kao administrator, želim mijenjati uloge korisnicima kako bih prilagodio njihove privilegije

**Poslovna vrijednost:** Fleksibilnost sistema

**Prioritet:** Medium

## Unos troškova

### User story 1
#### ID:  
#### Naziv: Ručni unos troška  
Kao administrativni zaposlenik želim unijeti trošak putem forme kako bih mogao evidentirati sve relevantne finansijske podatke

**Poslovna vrijednost:** Omogućava centralizovanu i strukturiranu evidenciju troškova  
**Prioritet:** High  

**Acceptance criteria:**
- Given korisnik je prijavljen u sistem  
- When unese sve potrebne podatke i klikne na “Sačuvaj”  
- Then trošak se sprema u bazu i prikazuje u listi  

---

### User story 2
#### ID:  
#### Naziv: Unos atributa troška  
Kao administrativni zaposlenik želim da prilikom unosa troška mogu odabrati kategoriju, projekat i odjel kako bi trošak bio pravilno organizovan i kasnije lako analiziran  

**Poslovna vrijednost:** Omogućava naprednu analizu i filtriranje troškova  
**Prioritet:** High  

**Acceptance criteria:**
- Given korisnik unosi novi trošak  
- When popuni sva obavezna polja  
- Then sistem ispravno povezuje trošak sa kategorijom, odjelom i projektom  

---

### User story 3
#### ID:  
#### Naziv: Validacija unosa  
Kao administrativni zaposlenik želim da sistem automatski provjerava validnost unesenih podataka kako bih izbjegao greške kao što su negativan iznos, pogrešan format datuma ili prazna obavezna polja  

**Poslovna vrijednost:** Osigurava tačnost i pouzdanost podataka  
**Prioritet:** High  

**Acceptance criteria:**
- Given korisnik unosi podatke  
- When neko polje nije validno ili nije popunjeno  
- Then sistem prikazuje grešku i ne dozvoljava spremanje  

---

## CRUD troškova

### User story 1
#### ID:  
#### Naziv: Kreiranje troška  
Kao korisnik sistema želim imati mogućnost kreiranja novog troška kako bih mogao dodavati nove zapise u sistem kada nastanu novi troškovi  

**Poslovna vrijednost:** Omogućava kontinuirano praćenje troškova  
**Prioritet:** High  

**Acceptance criteria:**
- Given korisnik ima odgovarajuća prava  
- When kreira novi trošak  
- Then trošak se sprema u bazu  

---

### User story 2
#### ID:  
#### Naziv: Ažuriranje troška  
Kao administrativni zaposlenik želim izmijeniti postojeći trošak kako bih mogao ispraviti greške ili ažurirati podatke kada se promijene  

**Poslovna vrijednost:** Održava tačnost i ažurnost podataka  
**Prioritet:** High  

**Acceptance criteria:**
- Given trošak postoji u sistemu  
- When korisnik izmijeni podatke i potvrdi  
- Then izmjene se spremaju i prikazuju u sistemu  

---

### User story 3
#### ID:  
#### Naziv: Brisanje troška  
Kao administrativni zaposlenik želim obrisati trošak kako bih uklonio netačne, duplirane ili nepotrebne zapise iz sistema  

**Poslovna vrijednost:** Održava kvalitet i čistoću baze podataka  
**Prioritet:** Medium  

**Acceptance criteria:**
- Given trošak postoji  
- When korisnik potvrdi brisanje  
- Then trošak se trajno uklanja iz sistema  

---

### User story 4
#### ID:  
#### Naziv: Kontrola pristupa  
Kao administrator želim ograničiti pristup CRUD operacijama na osnovu korisničkih uloga kako bih osigurao da samo ovlašteni korisnici mogu mijenjati ili brisati podatke  

**Poslovna vrijednost:** Osigurava sigurnost i kontrolu nad podacima  
**Prioritet:** High  

**Acceptance criteria:**
- Given korisnik nema odgovarajuću ulogu  
- When pokuša izvršiti CRUD operaciju  
- Then sistem blokira akciju i prikazuje poruku o grešci  

---

## Uvoz podataka

### User story 1
#### ID:  
#### Naziv: Uvoz iz CSV/Excel fajla  
Kao administrativni zaposlenik želim uvesti veći broj troškova putem CSV ili Excel fajla kako bih izbjegao ručni unos svakog pojedinačnog zapisa  

**Poslovna vrijednost:** Značajno ubrzava unos podataka i smanjuje manuelni rad  
**Prioritet:** High  

**Acceptance criteria:**
- Given korisnik ima validan fajl  
- When učita fajl u sistem  
- Then podaci se učitavaju i prikazuju za obradu  

---

### User story 2
#### ID:  
#### Naziv: Obrada podataka  
Kao administrativni zaposlenik želim da sistem automatski obradi podatke iz uvezenog fajla kako bih ih mogao brzo i bez dodatnog ručnog rada spremiti u bazu 

**Poslovna vrijednost:** Omogućava automatizovan unos podataka  
**Prioritet:** High  

**Acceptance criteria:**
- Given fajl je učitan  
- When sistem obradi podatke  
- Then podaci se transformišu u odgovarajući format  

---

### User story 3
#### ID:  
#### Naziv: Validacija podataka  
Kao administrativni zaposlenik želim provjeriti ispravnost svih uvezenih podataka kako bih spriječio unos netačnih ili nepotpunih zapisa  

**Poslovna vrijednost:** Održava kvalitet i pouzdanost baze podataka  
**Prioritet:** High  

**Acceptance criteria:**
- Given podaci su učitani  
- When postoje neispravni zapisi  
- Then sistem označava greške i preskače nevalidne unose  

---

### User story 4
#### ID:  
#### Naziv: OCR unos  
Kao administrativni zaposlenik želim unositi troškove putem OCR tehnologije sa skeniranih računa ili dokumenata kako bih dodatno automatizovao unos podataka  

**Poslovna vrijednost:** Smanjuje potrebu za ručnim unosom i ubrzava proces digitalizacije  
**Prioritet:** Medium  

**Acceptance criteria:**
- Given korisnik učita sliku dokumenta  
- When sistem izvrši OCR  
- Then podaci se automatski popunjavaju u formu  

---

## Izvještaj

### User story 1
#### ID:  
#### Naziv: Generisanje izvještaja  
Kao finansijski direktor želim generisati pregledan izvještaj o troškovima kako bih imao jasan uvid u finansijsko stanje organizacije  

**Poslovna vrijednost:** Omogućava donošenje informisanih odluka  
**Prioritet:** High  

**Acceptance criteria:**
- Given korisnik ima pristup  
- When generiše izvještaj  
- Then sistem prikazuje podatke o troškovima  

---

### User story 2
#### ID:  
#### Naziv: Izvještaj po periodu  
Kao finansijski direktor želim filtrirati izvještaje po vremenskom periodu kako bih mogao analizirati trendove i promjene kroz vrijeme  

**Poslovna vrijednost:** Omogućava analizu trendova i planiranje  
**Prioritet:** High  

**Acceptance criteria:**
- Given korisnik odabere period  
- When generiše izvještaj  
- Then prikazuju se samo relevantni podaci  

---

### User story 3
#### ID:  
#### Naziv: Export izvještaja  
Kao korisnik želim izvesti izvještaj u različitim formatima kako bih ga mogao dijeliti sa drugim korisnicima ili arhivirati  

**Poslovna vrijednost:** Olakšava komunikaciju i razmjenu podataka  
**Prioritet:** Medium  

**Acceptance criteria:**
- Given izvještaj je generisan  
- When korisnik klikne export  
- Then fajl se preuzima  

---

### User story 4
#### ID:  
#### Naziv: Sažeti izvještaj  
Kao vlasnik ili menadžer želim vidjeti sažeti prikaz ključnih finansijskih informacija kako bih brzo procijenio stanje poslovanja  

**Poslovna vrijednost:** Podržava brzo i efikasno donošenje odluka  
**Prioritet:** High  

**Acceptance criteria:**
- Given korisnik je vlasnik ili menadžer  
- When otvori izvještaj  
- Then sistem prikazuje ključne informacije u sažetom obliku

## Generisanje upozorenja

### User story 1
#### ID: 1
#### Naziv: Slanje notifikacije
Kao glavni računovođa želim primiti automatsku notifikaciju kada sistem detektuje anomaliju uočenu nakon AI analize

**Poslovna vrijednost:** Sprečava da greške prođu neopažene

**Prioritet:** High

### User story 2
#### ID: 2
#### Naziv: Sažetak o uočenoj anomaliji
Kao glavni računovođa želim dobiti tekstualni opis uz svaku notifikaciju kako bih razumio ozbiljnost situacije

**Poslovna vrijednost:** Omogućava da se odmah stvori početna slika kakav problem je u pitanju

**Prioritet:** High

## AI analiza

### User story 1
#### ID: 1
#### Naziv: Automatska validacija i detekcija anomalija pri unosu
Kao glavni računovođa želim da sistem odmah provjeri svaki uneseni trošak u odnosu na prosjek kategorije i prethodne obrasce kako bi spriječio unos nerealnih cifara ili duplih računa

**Poslovna vrijednost:** Osigurava čistu bazu podataka

**Prioritet:** High

### User story 2
#### ID: 2
#### Naziv: Dubinska analiza trendova na zahtjev
Kao glavni računovođa želim jednim klikom pokrenuti AI analizu cjelokupne baze kako bih dobio izvještaj o kretanju troškova i predviđanje budžeta za naredni period

**Poslovna vrijednost:** Pruža dubinski uvid u poslovanje i pomaže u planiranju

**Prioritet:** High

## Razvoj osnovnog UI Dashboarda

### User story 1
#### ID: 1
#### Naziv: Centralni vizuelni prikaz
Kao glavni računovoća želim imati jedan ekran s grafičkim prikazom ključnih pokazatelja kako bih vidio odnos planiranih i stvarnih troškova

**Poslovna vrijednost:** Štedi vrijeme jer se svi bitni podaci nalaze na jednom mjestu

**Prioritet:** High

---
## Planiranje budžeta

### User story 1
#### ID:
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
#### ID:  
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
- Kada ne postoji nijedan kreiran budžet, tada sistem mora prikazati poruku "Trenutno nema kreiranih budžeta" umjesto prazne liste.
- Sistem ne smije prikazati opciju za uređivanje za neovlaštene korisnike.

### User story 3
#### ID:  
#### Naziv: Uređivanje postojećeg budžeta  
Kao glavni računovođa želim urediti postojeći budžet kako bih mogao ispraviti greške ili prilagoditi finansijski plan novim zahtjevima  

**Poslovna vrijednost:** Projekti se proširuju i bez mogućnosti uređivanja tim bi morao brisati i ponovo kreirati budžete što može dovesti do čestih grešaka  
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
#### ID:   
#### Naziv: Prijava  
Kao ovlašteni korisnik sistema želim unijeti svoje korisničko ime i lozinku kako bih koristio funkcionalnosti prilagođene mojoj korisničkoj ulozi  

**Poslovna vrijednost:** Prijava je ključna za ovaj sistem jer bez nje nijedan korisnik ne može pristupiti funkcionalnostima  
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
#### ID:  
#### Naziv: Odjava  
Kao prijavljeni korisnik želim odjaviti se iz sistema kako bih zaštitio svoje podatke i spriječio neovlašteni pristup kada završim s radom  

**Poslovna vrijednost:** Odjava je osnovna sigurnosna mjera koja štiti osjetljive finansijske podatke firme  
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
#### ID:
#### Naziv: Dodavanje komentara  
Kao glavni računovođa želim dodati komentar na trošak kako bih dodatno pojasnio određenu stavku  

**Poslovna vrijednost:** Omogućava bolju interpretaciju troškova i komunikaciju između korisnika  
**Prioritet:** Low  
## Pretpostavke i otvorena pitanja:
Otvoreno pitanje: Da li je potrebna mogućnost uređivanja ili brisanja komentara?

## Veze sa drugim storyjima ili zavisnostima:
- Zavisi od Sign in 
- Zavisi od Unos troškova - komentar se veže uz postojeći trošak
- Povezan sa Pregled podataka - komentari su vidljivi u pregledu

## Acceptance Criteria
- Kada korisnik otvori trošak, ako klikne “Dodaj komentar”, tada sistem mora omogućiti unos teksta.
- Kada korisnik unese validan tekst i klikne "Pošalji", tada sistem mora sačuvati komentar i prikazati ga u listi komentara ispod te stavke.
- Sistem mora povezati komentar sa odgovarajućim troškom.
- Sistem ne smije dozvoliti unos praznog komentara.

### User story 2
#### ID: 
#### Naziv: Pregled komentara  
Kao glavni računovođa ili finansijski direktor želim pregledati komentare uz trošak kako bih imao uvid u dodatna objašnjenja  

**Poslovna vrijednost:** Povećava transparentnost i razumijevanje podataka  
**Prioritet:** Low  
## Pretpostavke:
- Pretpostavlja se da komentari postoje

## Veze:
- Zavisi od dodavanje komentara

## Acceptance Criteria
- Sistem mora prikazati listu komentara za odabrani trošak.
- Kada se korisnik nalazi na detaljnom pregledu troška koji ima komentare, tada sistem mora uz svaki komentar prikazati ime autora te datum i vrijeme kreiranja.
- Sistem mora prikazati sadržaj komentara.
- Sistem mora prikazati komentare sortirane od najstarijeg prema najnovijem.
