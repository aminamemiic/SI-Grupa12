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
Kao administrativni zaposlenik želim unijeti trošak putem forme kako bih mogao evidentirati sve relevantne finansijske podatke (iznos, datum, kategoriju, projekat i odjel) na jednom mjestu  

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
Kao korisnik sistema želim izmijeniti postojeći trošak kako bih mogao ispraviti greške ili ažurirati podatke kada se promijene  

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
Kao korisnik sistema želim obrisati trošak kako bih uklonio netačne, duplirane ili nepotrebne zapise iz sistema  

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
Kao sistem želim automatski parsirati i obraditi uvezene podatke kako bi se mogli pravilno spremiti u bazu  

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
Kao sistem želim provjeriti ispravnost svih uvezenih podataka kako bih spriječio unos netačnih ili nepotpunih zapisa  

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

# Planiranje budžeta

**ID storyja:** US-03a  
**Naziv storyja:** Kreiranje novog budžeta  

**Opis:**  
Kao menadžer ili računovođa, želim kreirati novi budžet po kategorijama, odjelima i vremenskom periodu, kako bih mogao planirati troškove firme.

**Poslovna vrijednost:**  
Kreiranje budžeta je temeljna funkcionalnost cijelog sistema, bez unesenog plana nije moguće pratiti odstupanja, generisati upozorenja niti provoditi AI analizu.

**Prioritet:** High  

---
## Planiranje budžeta

### User story 1
#### ID: US-03a  
#### Naziv: Kreiranje novog budžeta  
Kao menadžer ili računovođa želim kreirati novi budžet po kategorijama, odjelima i vremenskom periodu kako bih mogao planirati troškove firme  

**Poslovna vrijednost:** Kreiranje budžeta je temeljna funkcionalnost cijelog sistema, bez unesenog plana nije moguće pratiti odstupanja, generisati upozorenja niti provoditi AI analizu  
**Prioritet:** High  

### User story 2
#### ID: US-03b  
#### Naziv: Pregled postojećeg budžeta  
Kao menadžer, računovođa ili finansijski direktor želim pregledati listu svih kreiranih budžeta i njihove detalje kako bih imao uvid u planirane iznose po kategorijama, odjelima i vremenskim periodima  

**Poslovna vrijednost:** Pregled budžeta omogućava svim odgovornim osobama da u svakom trenutku imaju jasnu sliku finansijskog plana firme  
**Prioritet:** High  

### User story 3
#### ID: US-03c  
#### Naziv: Uređivanje postojećeg budžeta  
Kao menadžer ili računovođa želim urediti postojeći budžet kako bih mogao ispraviti greške ili prilagoditi finansijski plan novim zahtjevima  

**Poslovna vrijednost:** Projekti se proširuju i bez mogućnosti uređivanja tim bi morao brisati i ponovo kreirati budžete što može dovesti do čestih grešaka  
**Prioritet:** High  

---

## Sign In

### User story 1
#### ID: US-13a  
#### Naziv: Prijava  
Kao ovlašteni korisnik sistema želim unijeti svoje korisničko ime i lozinku kako bih koristio funkcionalnosti prilagođene mojoj korisničkoj ulozi  

**Poslovna vrijednost:** Prijava je ključna za ovaj sistem jer bez nje nijedan korisnik ne može pristupiti funkcionalnostima  
**Prioritet:** Low  

---

## Sign Out

### User story 1
#### ID: US-14  
#### Naziv: Odjava  
Kao prijavljeni korisnik želim odjaviti se iz sistema kako bih zaštitio svoje podatke i spriječio neovlašteni pristup kada završim s radom  

**Poslovna vrijednost:** Odjava je osnovna sigurnosna mjera koja štiti osjetljive finansijske podatke firme  
**Prioritet:** Low  

---

## Evidencija komentara

### User story 1
#### ID: US-12a  
#### Naziv: Dodavanje komentara  
Kao menadžer ili računovođa želim dodati komentar na trošak kako bih dodatno pojasnio određenu stavku  

**Poslovna vrijednost:** Omogućava bolju interpretaciju troškova i komunikaciju između korisnika  
**Prioritet:** Low  

### User story 2
#### ID: US-12b  
#### Naziv: Pregled komentara  
Kao menadžer ili računovođa želim pregledati komentare uz trošak kako bih imao uvid u dodatna objašnjenja  

**Poslovna vrijednost:** Povećava transparentnost i razumijevanje podataka  
**Prioritet:** Low 
