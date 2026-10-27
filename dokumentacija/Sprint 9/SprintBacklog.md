| ID | Naziv zadatka / Story-ja | Odgovorne osobe | Status | Napomena |
|:---|:---|:---|:---|:---|
| US-29 | **Odabir podataka za poređenje** - Kao glavni računovođa/finansijski direktor želim odabrati više zapisa kako bih ih mogao uporediti | Elvedina Halilović, Nejla Ćenanović| Done | Uz konsultaciju s ostatkom tima |
| US-30 | **Poređenje po kategorijama** - Kao glavni računovođa/finansijski direktor, želim porediti podatke po kategorijama (npr. odjel, vremenski period) kako bih dobio detaljniji uvid u razlike.|Elvedina Halilović, Nejla Ćenanović | Done | Uz konsultaciju s ostatkom tima |
| US-31 | **Poređenje planiranih i stvarnih troškova** - Kao glavni računovođa/finansijski direktor želim porediti planirane i stvarne troškove kako bih identifikovao odstupanja| Nejla Ćenanović, Elvedina Halilović | Done | Uz konsultaciju s ostatkom tima |
| US-32 | **Slanje notifikacije** - Kao glavni računovođa želim primiti automatsku notifikaciju kada sistem detektuje anomaliju uočenu nakon AI analize | Amina Memić | Done | Uz konsultaciju s ostatkom tima |
| US-33 | **Sažetak o uočenoj anomaliji** - Kao glavni računovođa želim dobiti tekstualni opis uz svaku notifikaciju kako bih razumio ozbiljnost situacije | Amina Memić, Adna Bajramović | Done | Uz konsultaciju s ostatkom tima |
| US-34 | **Automatska validacija i detekcija anomalija pri unosu** - Kao glavni računovođa želim da sistem odmah provjeri svaki uneseni trošak u odnosu na prosjek kategorije i prethodne obrasce kako bi spriječio unos nerealnih cifara ili duplih računa | Adna Bajramović | Done | Uz konsultaciju s ostatkom tima |
| US-35 | **Dubinska analiza trendova na zahtjev** - Kao glavni računovođa želim jednim klikom pokrenuti AI analizu cjelokupne baze kako bih dobio izvještaj o kretanju troškova i predviđanje budžeta za naredni period | Faris Aljić | Done | Uz konsultaciju s ostatkom tima |
| US-36 | **Predviđanje potrošnje do kraja perioda** - Kao glavni računovođa želim da sistem na osnovu trenutne brzine trošenja novca projektuje krajnje stanje budžeta za tekući mjesec| Faris Aljić | Done | Uz konsultaciju s ostatkom tima |
| US-37 | **Pametno grupisanje troškova** - Kao administrativni zaposlenik želim da mi AI predloži kategoriju troška na osnovu naziva stavke prilikom ručnog unosa | Omer Valjevac | Done | Uz konsultaciju s ostatkom tima |

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


## Acceptance Criteria

### User story 1
#### ID: 33
#### Naziv: Sažetak o uočenoj anomaliji
Kao glavni računovođa želim dobiti tekstualni opis uz svaku notifikaciju kako bih razumio ozbiljnost situacije

**Sprint:** 9

**Poslovna vrijednost:** Omogućava da se odmah stvori početna slika kakav problem je u pitanju

**Prioritet:** High


## AI analiza

### User story 1
#### ID: 34
#### Naziv: Automatska validacija i detekcija anomalija pri unosu
Kao glavni računovođa želim da sistem odmah provjeri svaki uneseni trošak u odnosu na prosjek kategorije i prethodne obrasce kako bi spriječio unos nerealnih cifara ili duplih računa

**Sprint:** 9

**Poslovna vrijednost:** Osigurava čistu bazu podataka

**Prioritet:** High


## Acceptance Criteria

### User story 1
#### ID: 35
#### Naziv: Dubinska analiza trendova na zahtjev
Kao glavni računovođa želim jednim klikom pokrenuti AI analizu cjelokupne baze kako bih dobio izvještaj o kretanju troškova i predviđanje budžeta za naredni period

**Sprint:** 9

**Poslovna vrijednost:** Pruža dubinski uvid u poslovanje i pomaže u planiranju

**Prioritet:** High


### User story 2
#### ID: 36
#### Naziv: Predviđanje potrošnje do kraja perioda
Kao glavni računovođa želim da sistem na osnovu trenutne brzine trošenja novca projektuje krajnje stanje budžeta za tekući mjesec.

**Sprint:** 9

**Poslovna vrijednost:** Omogućava planiranje i proaktivno djelovanje

**Prioritet:** High


### User story 3
#### ID: 37
#### Naziv: Pametno grupisanje troškova
Kao administrativni zaposlenik želim da mi AI predloži kategoriju troška na osnovu naziva stavke prilikom ručnog unosa.

**Sprint:** 9

**Poslovna vrijednost:** Ubrzava rad administracije.

**Prioritet:** Medium
