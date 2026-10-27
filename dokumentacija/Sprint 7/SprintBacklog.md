| ID | Naziv zadatka / Story-ja | Odgovorne osobe | Status | Napomena |
|:---|:---|:---|:---|:---|
| US-16 | **Uvoz podataka iz fajla** - Kao administrativni zaposlenik želim uvesti troškove iz CSV ili Excel fajla kako bih ubrzao unos | Adna Bajramović, Amina Memić, Omer Valjevac| Done | Uz konsultaciju s ostatkom tima |
| US-17 | **Obrada uvezenih podataka** - Kao administrativni zaposlenik želim da sistem automatski obradi podatke kako bi bili spremni za spremanje | Adna Bajramović, Amina Memić, Faris Aljić | Done | Uz konsultaciju s ostatkom tima |
| US-18 | **Validacija uvezenih podataka** - Kao administrativni zaposlenik želim provjeriti ispravnost podataka prije spremanja| Amina Memić, Adna Bajramović, Ramiz Plančić | Done | Uz konsultaciju s ostatkom tima |
| US-26 | **Kreiranje novog budžeta** - Kao glavni računovođa želim kreirati novi budžet po kategorijama, odjelima i vremenskom periodu kako bih mogao planirati troškove firme | Elvedina Halilović , Nejla Ćenanović, Omer Valjevac| Done | Uz konsultaciju s ostatkom tima  |
| US-27 | **Pregled postojećeg budžeta** - Kao glavni računovođa ili finansijski direktor želim pregledati listu svih kreiranih budžeta i njihove detalje kako bih imao uvid u planirane iznose po kategorijama, odjelima i vremenskim periodima | Elvedina Halilović, Nejla Ćenanović, Faris Aljić | Done  | Uz konsultaciju s ostatkom tima |
| US-28 | **Uređivanje postojećeg budžeta** - Kao glavni računovođa želim urediti postojeći budžet kako bih mogao ispraviti greške ili prilagoditi finansijski plan novim zahtjevima | Elvedina Halilović, Nejla Ćenanović, Ramiz Plančić | Done | Uz konsultaciju s ostatkom tima |
| US-29 | **Odobravanje budžeta** - Kao finansijski direktor, želim odobriti ili odbiti budžet koji je kreirao glavni računovođa, kako bih osigurao da samo pregledani i potvrđeni budžeti budu aktivni u sistemu. | Elvedina Halilović, Nejla Ćenanović | Done | Uz konsultaciju s ostatkom tima |

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


## Planiranje budžeta

### User story 4
#### ID: 26
#### Naziv: Kreiranje novog budžeta
Kao glavni računovođa želim kreirati novi budžet po kategorijama, odjelima i vremenskom periodu kako bih mogao planirati troškove firme

**Sprint:** 7

**Poslovna vrijednost:** Kreiranje budžeta je temeljna funkcionalnost cijelog sistema, jer bez unesenog plana nije moguće pratiti odstupanja, generisati upozorenja niti provoditi AI analizu

**Prioritet:** High

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Upravljanje korisnicima / RBAC   
Zavisi od Sign in  

**Acceptance Criteria**  
Kada ovlašteni korisnik pristupi modulu za planiranje budžeta i klikne dugme "Kreiraj novi budžet", tada sistem mora prikazati formu za kreiranje novog budžeta sa obaveznim poljima: naziv budžeta, vremenski period, datum početka i završetka, odjel, kategorija i planirani iznos  
Kada ovlašteni korisnik ispravno popuni sva obavezna polja i klikne "Sačuvaj", tada sistem mora sačuvati budžet i prikazati poruku "Budžet je uspješno kreiran"  
Sistem ne smije dozvoliti kreiranje budžeta sa iznosom manjim ili jednakim nuli  
Sistem ne smije dozvoliti kreiranje budžeta ako datum završetka prethodi datumu početka  
Kada korisnik pokuša kreirati budžet sa praznim poljima, tada sistem mora vizualno označiti prazna obavezna polja  



### User story 5
#### ID: 27
#### Naziv: Pregled postojećeg budžeta
Kao glavni računovođa ili finansijski direktor želim pregledati listu svih kreiranih budžeta i njihove detalje kako bih imao uvid u planirane iznose po kategorijama, odjelima i vremenskim periodima

**Sprint:** 7

**Poslovna vrijednost:** Pregled budžeta omogućava odgovornim osobama da u svakom trenutku imaju jasnu sliku finansijskog plana firme

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da je barem jedan budžet već kreiran    

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Kreiranje budžeta  
Zavisi od Sign in  
Zavisi od Upravljanje korisnicima / RBAC   

**Acceptance Criteria**  
Kada ovlašteni korisnik pristupi modulu za planiranje budžeta, tada sistem mora prikazati listu svih kreiranih budžeta  
Kada korisnik odabere određeni budžet iz liste, tada sistem mora prikazati detaljan pregled tog budžeta sa svim stavkama raspoređenim po kategorijama i odjelima  
Kada ne postoji nijedan kreiran budžet, tada sistem mora prikazati poruku "Trenutno nema kreiranih budžeta" umjesto prazne liste  
Sistem ne smije prikazati opciju za uređivanje neovlaštenim korisnicima  



### User story 6
#### ID: 28
#### Naziv: Uređivanje postojećeg budžeta
Kao glavni računovođa želim urediti postojeći budžet kako bih mogao ispraviti greške ili prilagoditi finansijski plan novim zahtjevima

**Sprint:** 7

**Poslovna vrijednost:** Projekti se proširuju i bez mogućnosti uređivanja tim bi morao brisati i ponovo kreirati budžete, što može dovesti do čestih grešaka

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da korisnik može pronaći i otvoriti budžet  

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Pregled budžeta  
Zavisi od Upravljanje korisnicima / RBAC   

**Acceptance Criteria**  
Kada se ovlašteni korisnik nalazi na detaljnom pregledu postojećeg budžeta i klikne dugme "Uredi", tada sistem mora omogućiti izmjenu  
Kada se ovlašteni korisnik nalazi na formi za uređivanje budžeta sa validno popunjenim poljima i klikne dugme "Sačuvaj", tada sistem mora ažurirati podatke budžeta  
Sistem ne smije dozvoliti da uređivanjem nastanu dva budžeta sa istim odjelom, kategorijom i vremenskim periodom. Korisnik treba dobiti upozorenje "Budžet za ovaj period i odjel već postoji"  
Sistem ne smije dozvoliti uređivanje budžeta sa iznosom manjim ili jednakim nuli  
Kada ovlašteni korisnik počne uređivati budžet ali ne sačuva izmjene i pokuša napustiti stranicu, tada sistem mora prikazati upozorenje "Želite li sačuvati izmjene?"  



### User story 7
#### ID: 29
#### Naziv: Odobravanje budžeta
Kao finansijski direktor želim odobriti ili odbiti budžet koji je kreirao glavni računovođa kako bih osigurao da samo pregledani i potvrđeni budžeti budu aktivni u sistemu

**Sprint:** 7

**Poslovna vrijednost:** Proces odobravanja osigurava kontrolu nad finansijskim planiranjem, jer sprječava da nepregledan ili netačan budžet postane aktivan i utiče na praćenje troškova, generisanje upozorenja i AI analizu

**Prioritet:** High

**Pretpostavke i otvorena pitanja**  
Pretpostavlja se da je budžet kreiran i da ima status "Nacrt"     

**Veze sa drugim storyjima ili zavisnostima**  
Zavisi od Kreiranje budžeta  
Zavisi od Upravljanje korisnicima / RBAC  
Zavisi od Sign in   

**Acceptance Criteria**  
Kada glavni računovođa kreira budžet, tada sistem mora automatski dodijeliti status "Nacrt" tom budžetu   
Kada finansijski direktor klikne "Odobri", tada sistem mora promijeniti status budžeta u "Odobren" i ukloniti opciju "Uredi" za sve korisnike  
Kada finansijski direktor klikne "Odbij", tada sistem mora promijeniti status budžeta u "Odbijen" i ukloniti opciju "Uredi" za sve korisnike  
Sistem ne smije prikazati opcije "Odobri" i "Odbij" korisnicima koji nisu finansijski direktor  
Kada je budžet u statusu "Odobren" ili "Odbijen", sistem ne smije dozvoliti uređivanje tog budžeta nijednom korisniku  
Dok je budžet u statusu "Nacrt", sistem mora dozvoliti glavnom računovođi da ga uređuje
