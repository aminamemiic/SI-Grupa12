# Domain Model

---

## 1. Glavni entiteti
* **Korisnik:** Osoba koja pristupa sistemu i koristi isti. Svaki korisnik ima definisanu Ulogu (Administrator, Glavni računovođa, Finansijski direktor, Administrativni zaposlenik) koja preko RBAC-a određuje i kontrolišve nivo pristupa
* **Trošak:** Entitet koji predstavlja finansijski izdatak. Sadrži podatke o iznosu, datumu i opis
* **Budžet:** Finansijski plan koji postavlja limite za određeni period, odjel ili kategoriju. Služi kao osnova za planiranje i praćenje troškova
* **Kategorija:** Logički povezana grupa troškova (npr. oprema, režije)
* **Odjel:** Organizaciona jedinica kojoj se dodjeljuje određeni budžet i kojoj pripadaju troškovi
* **Anomalija:** Entitet koji generiše AI kada detektuje odstupanje, grešku, sumnjiv obrazac potrošnje
* **Komentar:** Tekstualni zapis vezan za konkretan trošak, omogućava komunikaciju i pojašnjenja između korisnika

---

## 2. Ključni atributi

| Entitet | Atributi |
| :--- | :--- |
| **Korisnik** | ID, Ime, Prezime, Email, Lozinka, Uloga (RBAC) |
| **Trošak** | ID, Naziv, Iznos, Datum, Opis, ID_Kategorije, ID_Odjela, Unio_Korisnik_ID, Status (Validan/Sumnjiv) |
| **Budžet** | ID, Naziv, Planirani_Iznos, Datum_Pocetka, Datum_Zavrsetka, ID_Odjela, Status |
| **Kategorija** | ID, Naziv, Opis |
| **Odjel** | ID, Naziv, Opis |
| **Anomalija** | ID, Opis, Nivo_Ozbiljnosti (Crvena/Narandžasta/Žuta), Tip, Status_Potvrde, ID_Troska |
| **Komentar** | ID, Tekst, Vrijeme, Autor_ID, ID_Troška |

---

## 3. Veze između entiteta

* **Odjel – Budžet (1:N):** Jedan odjel može imati više budžeta kroz različite vremenske periode (kvartalno/godišnje), ali jedan budžet pripada tačno jednom odjelu
* **Kategorija – Trošak (1:N):** Svaki trošak mora pripadati jednoj specifičnoj kategoriji. Jedna kategorija može imati neograničen broj troškova.
* **Trošak – Anomalija (1:0..1):** Trošak ne mora nužno imati anomaliju. Ako AI detektuje problem, trošak se veže za tačno jednu anomaliju
* **Korisnik – Trošak (1:N):** Sistem prati koji je korisnik unio koji trošak
* **Trošak – Komentar (1:N):** Uz jedan trošak može biti vezano više komentara različitih korisnika radi pojašnjenja
* **Budžet – Kategorija (M:N):** Jedan budžet može pokrivati više kategorija, a ista kategorija se može pratiti kroz različite budžetske planove

---

## 4. Poslovna pravila važna za model

1.  **Pravilo integriteta budžeta:** Sistem ne dozvoljava kreiranje dva budžeta za isti odjel unutar istog vremenskog perioda kako bi se spriječilo preklapanje planova
2.  **AI Validacija:** Prilikom unosa novog troška, AI automatski poredi iznos s historijskim prosjekom te kategorije. Ako odstupanje prelazi 50%, automatski se kreira entitet **Anomalija** s visokim nivoom ozbiljnosti.
3.  **RBAC ograničenje:** Samo korisnici sa ulogom Glavni računovođa mogu vršiti izmjene i brisanje troškova, dok Finansijski direktor odobrava budžete i vrši pregled AI analize
4.  **Pravilo validacije troška:** Trošak se ne može sačuvati u bazi ako nisu definisani iznos, datum, kategorija i pripadajući odjel
5.  **Pravilo komentara:** Komentari se ne mogu brisati nakon unosa (radi transparentnosti), a prikazuju se hronološki (od najstarijeg)

# Use Case Modeli

---

## 1. Pregled liste podataka

**Akter:** Glavni računovođa / Finansijski direktor <br>
**Naziv use casea:** Pregled liste podataka

**Kratak opis:**
Korisnik pregledava listu svih dostupnih finansijskih podataka i troškova u sistemu.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima pravo pristupa modulu za pregled podataka
- Podaci postoje u bazi ili je modul dostupan za prikaz praznog stanja

**Glavni tok:**
1. Korisnik otvara modul za pregled podataka
2. Sistem dohvaća podatke iz baze
3. Sistem prikazuje listu dostupnih podataka
4. Korisnik pregledava prikazane stavke

**Alternativni tokovi:**
- Ako nema podataka u sistemu, sistem prikazuje poruku da trenutno nema dostupnih podataka
- Ako dođe do greške pri učitavanju, sistem prikazuje poruku o grešci
- Ako korisnik nema ovlaštenje, sistem zabranjuje pristup modulu

**Ishod:**
Korisniku je prikazana lista podataka ili odgovarajuća poruka o praznom stanju / grešci.

---

## 2. Filtriranje podataka

**Akter:** Glavni računovođa / Finansijski direktor <br>
**Naziv use casea:** Filtriranje podataka

**Kratak opis:**
Korisnik filtrira prikazane podatke prema zadanim kriterijima radi lakšeg pronalaska relevantnih informacija.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Lista podataka je učitana i prikazana
- Sistem podržava definisane filtere

**Glavni tok:**
1. Korisnik otvara listu podataka
2. Korisnik bira jedan ili više filtera
3. Sistem primjenjuje odabrane kriterije
4. Sistem prikazuje filtrirane rezultate
5. Korisnik pregledava rezultate

**Alternativni tokovi:**
- Ako nema rezultata za odabrane filtere, sistem prikazuje poruku "Nema rezultata"
- Ako korisnik resetuje filtere, sistem ponovo prikazuje sve podatke
- Ako dođe do greške pri filtriranju, sistem prikazuje poruku o grešci

**Ishod:**
Prikazani su filtrirani podaci u skladu sa odabranim kriterijima.

---

## 3. Pretraga podataka

**Akter:** Glavni računovođa / Finansijski direktor <br>
**Naziv use casea:** Pretraga podataka

**Kratak opis:**
Korisnik pretražuje podatke pomoću ključnih riječi kako bi brže pronašao tražene informacije.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Podaci su dostupni za pregled
- U sistemu postoji polje za pretragu

**Glavni tok:**
1. Korisnik otvara listu podataka
2. Korisnik unosi ključnu riječ u polje za pretragu
3. Sistem pretražuje dostupne podatke
4. Sistem prikazuje rezultate koji odgovaraju unesenom pojmu

**Alternativni tokovi:**
- Ako nema rezultata, sistem prikazuje poruku "Nema rezultata"
- Ako korisnik obriše uneseni pojam, sistem prikazuje kompletnu listu podataka
- Ako dođe do greške pri pretrazi, sistem prikazuje poruku o grešci

**Ishod:**
Prikazani su podaci koji odgovaraju unesenoj ključnoj riječi.

---

## 4. Detaljan prikaz podataka

**Akter:** Glavni računovođa / Finansijski direktor <br>
**Naziv use casea:** Pregled detalja zapisa

**Kratak opis:**
Korisnik otvara pojedinačni zapis i pregledava sve detaljne informacije povezane s njim.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Lista podataka je dostupna
- Odabrani zapis postoji u sistemu

**Glavni tok:**
1. Korisnik otvara listu podataka
2. Korisnik bira jedan zapis
3. Sistem učitava detalje odabranog zapisa
4. Sistem prikazuje detaljan pregled svih relevantnih informacija

**Alternativni tokovi:**
- Ako zapis više ne postoji, sistem prikazuje poruku da zapis nije pronađen
- Ako dođe do greške pri učitavanju detalja, sistem prikazuje poruku o grešci
- Ako korisnik nema pravo pregleda detalja, sistem zabranjuje pristup

**Ishod:**
Korisnik vidi detaljan prikaz odabranog zapisa.

---

## 5. Sortiranje podataka

**Akter:** Glavni računovođa / Finansijski direktor <br>
**Naziv use casea:** Sortiranje podataka

**Kratak opis:**
Korisnik sortira podatke po različitim kriterijima kako bi ih lakše organizovao i analizirao.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Lista podataka je učitana
- Podaci sadrže atribute po kojima je moguće sortiranje

**Glavni tok:**
1. Korisnik otvara listu podataka
2. Korisnik bira kriterij sortiranja
3. Sistem sortira podatke prema odabranom kriteriju
4. Sistem prikazuje sortiranu listu

**Alternativni tokovi:**
- Ako odabrani kriterij nije dostupan, sistem prikazuje poruku o grešci
- Ako dođe do greške pri sortiranju, sistem prikazuje poruku o grešci
- Ako korisnik promijeni kriterij, sistem ponovo sortira listu prema novom odabiru

**Ishod:**
Podaci su sortirani i prikazani prema odabranom kriteriju.

---

## 6. Ručni unos troška

**Akter:** Administrativni zaposlenik <br>
**Naziv use casea:** Ručni unos troška

**Kratak opis:**
Korisnik ručno unosi novi trošak putem forme i sprema ga u sistem.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima ovlaštenje za unos troškova
- Forma za unos troška je dostupna
- Kategorije, projekti i odjeli su definisani u sistemu

**Glavni tok:**
1. Korisnik otvara formu za unos troška
2. Korisnik unosi potrebne podatke o trošku (naziv, iznos, datum)
3. Korisnik odabire kategoriju, projekat i odjel
4. Korisnik klikne na opciju "Sačuvaj"
5. Sistem validira unesene podatke
6. Sistem sprema trošak u bazu
7. Sistem prikazuje potvrdu uspješnog unosa

**Alternativni tokovi:**
- Ako obavezna polja nisu popunjena, sistem upozorava korisnika i vizualno označava prazna polja
- Ako su podaci neispravni (npr. negativan iznos), sistem prikazuje validacijske greške i ne dozvoljava spremanje
- Ako dođe do greške pri spremanju, sistem prikazuje poruku o grešci
- Ako korisnik nema ovlaštenje, sistem zabranjuje unos

**Ishod:**
Novi trošak je uspješno sačuvan u sistemu sa svim atributima.

---

## 7. Ažuriranje troška

**Akter:** Administrativni zaposlenik <br>
**Naziv use casea:** Ažuriranje postojećeg troška

**Kratak opis:**
Korisnik mijenja podatke postojećeg troška kako bi ispravio greške ili ažurirao informacije.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima ovlaštenje za izmjenu troškova
- Trošak koji se uređuje postoji u sistemu

**Glavni tok:**
1. Korisnik otvara listu troškova
2. Korisnik bira trošak koji želi izmijeniti
3. Sistem prikazuje detalje troška
4. Korisnik bira opciju "Uredi"
5. Sistem prikazuje formu sa trenutnim podacima
6. Korisnik unosi izmjene
7. Korisnik klikne na "Sačuvaj"
8. Sistem validira nove podatke
9. Sistem ažurira trošak u bazi
10. Sistem prikazuje potvrdu o uspješnom ažuriranju

**Alternativni tokovi:**
- Ako trošak ne postoji, sistem prikazuje poruku o grešci
- Ako uneseni podaci nisu validni, sistem prikazuje greške i ne dozvoljava spremanje
- Ako korisnik nema pravo uređivanja, sistem zabranjuje pristup opciji
- Ako korisnik pokuša napustiti stranicu bez spremanja, sistem traži potvrdu

**Ishod:**
Trošak je uspješno ažuriran ili je korisnik obaviješten o problemu.

---

## 8. Brisanje troška

**Akter:** Administrativni zaposlenik <br>
**Naziv use casea:** Brisanje troška

**Kratak opis:**
Korisnik briše netačan ili nepotreban zapis troška iz sistema.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima ovlaštenje za brisanje troškova
- Trošak koji se briše postoji u sistemu

**Glavni tok:**
1. Korisnik otvara listu troškova
2. Korisnik bira trošak koji želi obrisati
3. Korisnik bira opciju "Obriši"
4. Sistem prikazuje poruku za potvrdu brisanja
5. Korisnik potvrđuje brisanje
6. Sistem uklanja trošak iz baze
7. Sistem prikazuje potvrdu o uspješnom brisanju

**Alternativni tokovi:**
- Ako korisnik odustane od potvrde, sistem ne vrši brisanje
- Ako korisnik nema pravo brisanja, sistem zabranjuje pristup opciji
- Ako dođe do greške pri brisanju, sistem prikazuje poruku o grešci

**Ishod:**
Trošak je uspješno obrisan ili je korisnik odustao od brisanja.

---

## 9. Uvoz podataka

**Akter:** Administrativni zaposlenik <br>
**Naziv use casea:** Uvoz podataka iz fajla

**Kratak opis:**
Korisnik uvozi troškove iz CSV ili Excel fajla kako bi ubrzao unos većeg broja podataka.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima pravo na uvoz podataka
- Fajl je dostupan na korisničkom uređaju
- Sistem podržava format odabranog fajla

**Glavni tok:**
1. Korisnik otvara modul za uvoz podataka
2. Korisnik bira fajl sa svog uređaja
3. Sistem učitava i parsira sadržaj fajla
4. Sistem prikazuje pregled podataka za potvrdu i označava eventualne greške
5. Korisnik potvrđuje uvoz
6. Sistem sprema podatke u bazu

**Alternativni tokovi:**
- Ako fajl nije podržanog formata, sistem prikazuje poruku o grešci
- Ako fajl sadrži neispravne podatke, sistem označava problematične stavke i ne dozvoljava uvoz dok se ne isprave
- Ako korisnik odustane od uvoza, sistem prekida proces
- Ako dođe do greške pri obradi fajla, sistem prikazuje poruku o grešci

**Ishod:**
Podaci iz fajla su uspješno uvezeni ili je korisnik obaviješten o problemima.

---

## 10. Poređenje podataka

**Akter:** Glavni računovođa / Finansijski direktor <br>
**Naziv use casea:** Poređenje podataka

**Kratak opis:**
Korisnik poredi više odabranih zapisa ili kategorija troškova kako bi uočio razlike i donio kvalitetnije odluke, uključujući poređenje planiranih i stvarnih troškova.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Podaci su dostupni za pregled
- Korisnik je odabrao najmanje dva zapisa ili kategorije za poređenje

**Glavni tok:**
1. Korisnik otvara listu podataka
2. Korisnik označava više zapisa ili odabire kategorije za poređenje
3. Korisnik pokreće opciju poređenja
4. Sistem učitava odabrane zapise
5. Sistem prikazuje podatke paralelno i ističe razlike
6. Korisnik može odabrati grafički prikaz poređenja

**Alternativni tokovi:**
- Ako je odabran samo jedan zapis, sistem ne dozvoljava poređenje i prikazuje odgovarajuće upozorenje
- Ako nijedan zapis nije odabran, sistem traži od korisnika da odabere podatke
- Ako korisnik odabere poređenje po kategorijama (npr. sektor, vremenski period), sistem prikazuje poređenje unutar odabrane kategorije i omogućuje izbor više kategorija
- Ako korisnik odabere poređenje planiranih i stvarnih troškova, sistem prikazuje oba skupa podataka i jasno označava odstupanja
- Ako dođe do greške pri učitavanju poređenja, sistem prikazuje poruku o grešci

**Ishod:**
Korisnik vidi uporedni prikaz odabranih podataka s jasno istaknutim razlikama i odstupanjima.

---

## 11. Grafički prikaz podataka

**Akter:** Glavni računovođa / Finansijski direktor <br>
**Naziv use casea:** Grafički prikaz podataka

**Kratak opis:**
Korisnik prikazuje podatke i rezultate poređenja u obliku grafikona radi lakše vizualne analize.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Podaci postoje u sistemu
- Korisnik ima pristup modulu za analitiku ili pregled podataka

**Glavni tok:**
1. Korisnik otvara modul za prikaz podataka
2. Korisnik bira opciju grafičkog prikaza
3. Korisnik bira tip grafikona (bar, line, pie)
4. Sistem obrađuje podatke za prikaz
5. Sistem generiše odgovarajući grafikon
6. Sistem prikazuje grafikon korisniku

**Alternativni tokovi:**
- Ako nema dovoljno podataka za prikaz grafikona, sistem prikazuje odgovarajuću poruku
- Ako dođe do greške pri generisanju grafikona, sistem prikazuje poruku o grešci
- Ako korisnik promijeni tip grafikona, sistem ponovo generiše prikaz prema novom odabiru

**Ishod:**
Podaci su prikazani u grafičkom obliku prema odabranom tipu vizualizacije.

---

## 12. Generisanje izvještaja

**Akter:** Finansijski direktor <br>
**Naziv use casea:** Generisanje izvještaja

**Kratak opis:**
Korisnik generiše izvještaj o troškovima i finansijskim podacima radi analize i donošenja odluka, uz mogućnost filtriranja po vremenskom periodu i prikaza sažetka ključnih informacija.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima pravo pristupa izvještajima
- Relevantni podaci postoje u sistemu

**Glavni tok:**
1. Korisnik otvara modul za izvještaje
2. Korisnik bira opciju generisanja izvještaja
3. Korisnik može odabrati vremenski period za filtriranje
4. Sistem prikuplja potrebne podatke
5. Sistem obrađuje i agregira podatke
6. Sistem prikazuje generisani izvještaj sa sažetkom ključnih informacija

**Alternativni tokovi:**
- Ako nema podataka za izvještaj, sistem prikazuje poruku da izvještaj nije moguće generisati
- Ako korisnik nema pristup, sistem zabranjuje otvaranje modula
- Ako dođe do greške pri generisanju, sistem prikazuje poruku o grešci
- Ako korisnik odabere vremenski period koji ne sadrži podatke, sistem prikazuje prazni izvještaj s odgovarajućom porukom

**Ishod:**
Izvještaj je generisan i prikazan korisniku, s podacima filtriranim prema odabranom periodu.

---

## 13. Export izvještaja

**Akter:** Finansijski direktor <br>
**Naziv use casea:** Export izvještaja

**Kratak opis:**
Korisnik izvozi prethodno generisani izvještaj u odabrani format radi dijeljenja ili arhiviranja.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Izvještaj je prethodno generisan
- Sistem podržava odabrani format izvoza

**Glavni tok:**
1. Korisnik otvara generisani izvještaj
2. Korisnik bira opciju izvoza
3. Korisnik odabire željeni format (PDF, Excel)
4. Sistem generiše fajl u odabranom formatu
5. Sistem omogućava korisniku preuzimanje fajla

**Alternativni tokovi:**
- Ako odabrani format nije podržan, sistem prikazuje poruku o grešci
- Ako dođe do greške pri izvozu, sistem prikazuje poruku o grešci
- Ako korisnik prekine proces, sistem ne generiše fajl

**Ishod:**
Izvještaj je uspješno izvezen i spreman za preuzimanje.

---

## 14. Dodjela uloga korisnicima

**Akter:** Administrator <br>
**Naziv use casea:** Dodjela i upravljanje ulogama korisnicima

**Kratak opis:**
Administrator dodjeljuje, mijenja i pregledava uloge korisnicima kako bi kontrolisao pristup sistemskim funkcionalnostima.

**Preduslovi:**
- Administrator je prijavljen u sistem
- Korisnički nalozi postoje u sistemu
- Uloge su definisane u sistemu

**Glavni tok:**
1. Administrator otvara modul za upravljanje korisnicima
2. Sistem prikazuje listu svih korisnika s njihovim trenutnim ulogama
3. Administrator bira korisnika
4. Administrator bira ulogu koju želi dodijeliti ili promijeniti
5. Sistem sprema izmjenu
6. Sistem potvrđuje uspješnu dodjelu uloge i izmjena odmah stupa na snagu

**Alternativni tokovi:**
- Ako korisnik ne postoji, sistem prikazuje poruku o grešci
- Ako odabrana uloga nije validna, sistem ne dozvoljava spremanje
- Ako dođe do greške pri spremanju, sistem prikazuje poruku o grešci

**Ishod:**
Korisniku je uspješno dodijeljena nova uloga ili je administrator pregledao listu korisnika i njihovih uloga.

---

## 15. Ograničenje pristupa funkcijama

**Akter:** Sistem <br>
**Naziv use casea:** Kontrola pristupa funkcijama

**Kratak opis:**
Sistem provjerava korisničku ulogu i dozvoljava ili zabranjuje pristup određenim funkcionalnostima, uključujući CRUD operacije nad troškovima.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima definisanu ulogu
- Pravila pristupa su postavljena u sistemu

**Glavni tok:**
1. Korisnik pokušava pristupiti određenoj funkcionalnosti
2. Sistem provjerava korisničku ulogu i ovlaštenja
3. Sistem odlučuje da li je pristup dozvoljen
4. Ako jeste, sistem otvara traženu funkcionalnost
5. Ako nije, sistem prikazuje poruku o zabrani pristupa

**Alternativni tokovi:**
- Ako korisnik nije prijavljen, sistem ga preusmjerava na prijavu
- Ako korisnik nema definisanu ulogu, sistem zabranjuje pristup
- Ako korisnik bez ovlasti pokuša izvršiti CRUD operaciju (kreiranje, izmjena, brisanje), sistem blokira akciju i prikazuje poruku o zabrani
- Ako dođe do greške u provjeri ovlaštenja, sistem prikazuje poruku o grešci

**Ishod:**
Pristup funkcionalnosti je odobren samo ovlaštenim korisnicima.

---

## 16. AI detekcija anomalija

**Akter:** Sistem <br>
**Naziv use casea:** AI detekcija anomalija

**Kratak opis:**
Sistem automatski analizira unesene ili postojeće troškove i otkriva odstupanja, sumnjive obrasce, moguće anomalije i periodične troškove koji su izostali. Analiza se pokreće automatski pri unosu i na zahtjev korisnika.

**Preduslovi:**
- U sistemu postoje podaci za analizu
- AI analiza je omogućena i dostupna
- Korisnik ima pravo pristupa rezultatima analize ili je analiza pokrenuta automatski

**Glavni tok:**
1. Sistem prima nove podatke ili korisnik ručno pokreće analizu
2. Sistem pokreće AI analizu nad podacima
3. Sistem poredi podatke sa historijskim obrascima, prosjekom kategorije i definisanim pravilima
4. Sistem identifikuje moguće anomalije, duplikate, sumnjive obrasce i neuobičajene termine unosa
5. Sistem označava sumnjive stavke ili priprema upozorenja
6. Ako je analiza pokrenuta na zahtjev, sistem prikazuje vizuelni prikaz trendova i projekciju troškova za naredni period

**Alternativni tokovi:**
- Ako nema dovoljno podataka za kvalitetnu analizu, sistem prikazuje odgovarajuću poruku ili preskače analizu
- Ako anomalije nisu pronađene, sistem ne generiše upozorenje
- Ako sistem detektuje periodični trošak koji nije unesen u očekivanom roku, sistem generiše podsjetnik
- Ako dođe do greške pri AI obradi, sistem evidentira grešku i obavještava korisnika ili administratora

**Ishod:**
Sistem je identifikovao anomalije, trendove ili periodične troškove koji nedostaju, ili je potvrdio da odstupanja nisu pronađena.

---

## 17. AI sugestija kategorije pri unosu

**Akter:** Sistem / Administrativni zaposlenik <br>
**Naziv use casea:** AI sugestija kategorije troška

**Kratak opis:**
Sistem analizira naziv troška koji korisnik unosi i automatski predlaže najvjerovatniju kategoriju, čime ubrzava i olakšava proces unosa.

**Preduslovi:**
- Korisnik je prijavljen u sistem i otvorio formu za unos troška
- AI modul je dostupan
- U sistemu postoje definisane kategorije troškova

**Glavni tok:**
1. Korisnik unosi naziv troška u formu
2. Sistem u pozadini analizira unesene ključne riječi
3. Sistem predlaže najvjerovatniju kategoriju
4. Korisnik prihvata prijedlog ili ga ručno mijenja
5. Korisnik nastavlja sa unosom i sprema trošak

**Alternativni tokovi:**
- Ako sistem ne može odrediti kategoriju, polje ostaje prazno i korisnik bira ručno
- Ako korisnik odbaci prijedlog, sistem ne nameće kategoriju

**Ishod:**
Korisniku je predložena kategorija troška, čime je ubrzao unos.

---

## 18. Generisanje notifikacija

**Akter:** Sistem <br>
**Naziv use casea:** Generisanje notifikacija

**Kratak opis:**
Sistem generiše i prikazuje upozorenja korisnicima kada otkrije anomalije ili druge važne događaje, uključujući tekstualni opis i nivo ozbiljnosti.

**Preduslovi:**
- U sistemu postoji događaj koji zahtijeva obavještenje
- Pravila za generisanje notifikacija su definisana
- Korisnik ima pravo pristupa notifikacijama

**Glavni tok:**
1. Sistem detektuje anomaliju ili drugi značajan događaj
2. Sistem kreira notifikaciju sa naslovom i detaljnim opisom problema
3. Sistem određuje nivo ozbiljnosti (visok/srednji/nizak) i vizualno ga označava odgovarajućom bojom
4. Sistem povezuje notifikaciju s odgovarajućim korisnikom ili grupom korisnika
5. Sistem prikazuje notifikaciju u aplikaciji

**Alternativni tokovi:**
- Ako događaj nije dovoljno značajan prema pravilima sistema, notifikacija se ne generiše
- Ako nije moguće dostaviti notifikaciju, sistem evidentira grešku
- Ako korisnik nema pristup toj vrsti upozorenja, sistem mu je ne prikazuje

**Ishod:**
Korisnik je obaviješten o važnom događaju putem notifikacije s opisom i nivoom ozbiljnosti.

---

## 19. Prijava u sistem

**Akter:** Korisnik <br>
**Naziv use casea:** Prijava u sistem

**Kratak opis:**
Korisnik unosi svoje pristupne podatke kako bi pristupio funkcionalnostima sistema u skladu sa svojom ulogom.

**Preduslovi:**
- Korisnik ima kreiran korisnički nalog (kreiran od strane administratora)
- Stranica za prijavu je dostupna
- Korisnički nalog nije deaktiviran
- Korisnik ima dodijeljenu ulogu

**Glavni tok:**
1. Korisnik otvara stranicu za prijavu
2. Korisnik unosi email i lozinku
3. Korisnik klikne na dugme za prijavu
4. Sistem provjerava unesene podatke
5. Sistem autentificira korisnika
6. Sistem preusmjerava korisnika na dashboard u skladu sa njegovom ulogom

**Alternativni tokovi:**
- Ako korisnik unese pogrešne podatke, sistem prikazuje generičku poruku o grešci (bez otkrivanja koji je podatak neispravan)
- Ako su polja prazna, sistem vizualno označava obavezna polja
- Ako nalog nije aktivan, sistem odbija prijavu
- Ako korisnik pokuša direktno pristupiti stranici putem URL-a bez prijave, sistem ga preusmjerava na stranicu za prijavu
- Ako dođe do tehničke greške, sistem prikazuje poruku o grešci

**Ishod:**
Korisnik je uspješno prijavljen i preusmjeren na dashboard, ili je obaviješten o razlogu neuspješne prijave.

---

## 20. Odjava iz sistema

**Akter:** Korisnik <br>
**Naziv use casea:** Odjava iz sistema

**Kratak opis:**
Korisnik prekida aktivnu sesiju kako bi zaštitio svoje podatke i onemogućio neovlašten pristup.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnička sesija je aktivna

**Glavni tok:**
1. Korisnik bira opciju "Odjava" u navigaciji
2. Sistem prekida korisničku sesiju
3. Sistem briše ili deaktivira sesijske podatke
4. Sistem preusmjerava korisnika na stranicu za prijavu

**Alternativni tokovi:**
- Ako korisnička sesija više nije aktivna, sistem korisnika direktno vraća na prijavu
- Ako korisnik pokuša pristupiti prethodnoj stranici nakon odjave (npr. pritiskom dugmeta za povratak u browseru), sistem mu ne dozvoljava pristup bez nove prijave
- Ako dođe do greške pri odjavi, sistem prikazuje poruku o grešci

**Ishod:**
Korisnik je uspješno odjavljen iz sistema.

---

## 21. Dashboard pregled

**Akter:** Glavni računovođa / Finansijski direktor <br>
**Naziv use casea:** Pregled dashboarda

**Kratak opis:**
Korisnik otvara centralni dashboard i pregledava ključne metrike, pokazatelje i upozorenja na jednom mjestu, uključujući odnos ukupne potrošnje i budžeta, troškove po odjelima i AI upozorenja.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima pravo pristupa dashboardu
- Relevantni podaci za prikaz postoje u sistemu ili je omogućeno prazno početno stanje

**Glavni tok:**
1. Korisnik otvara dashboard
2. Sistem dohvaća ključne metrike i pokazatelje
3. Sistem prikazuje odnos ukupne potrošnje i budžeta, troškove po odjelima i listu posljednjih AI upozorenja
4. Sistem koristi "semafor boje" za prikaz stanja (zelena/narandžasta/crvena)
5. Korisnik pregledava informacije na ekranu
6. Korisnik može kliknuti na grafikon ili metriku kako bi dobio detaljniji prikaz

**Alternativni tokovi:**
- Ako nema dovoljno podataka za prikaz svih metrika, sistem prikazuje dostupne informacije i odgovarajuće poruke
- Ako korisnik klikne na grafikon, sistem prikazuje tabelarni prikaz svih troškova koji čine tu sumu, uz mogućnost povratka na dashboard
- Ako dođe do greške pri učitavanju dashboarda, sistem prikazuje poruku o grešci
- Ako korisnik nema ovlaštenje, sistem zabranjuje pristup dashboardu

**Ishod:**
Korisnik dobija brz i centralizovan pregled stanja sistema s mogućnošću detaljnijeg uvida po segmentima.

---

## 22. Kreiranje budžeta

**Akter:** Glavni računovođa <br>
**Naziv use casea:** Kreiranje novog budžeta

**Kratak opis:**
Korisnik kreira novi budžet definisan po kategorijama, odjelima i vremenskom periodu.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima pravo kreiranja budžeta
- Modul za planiranje budžeta je dostupan

**Glavni tok:**
1. Korisnik otvara modul za planiranje budžeta
2. Korisnik bira opciju za kreiranje novog budžeta
3. Sistem prikazuje formu za unos budžeta
4. Korisnik unosi naziv, period (datum početka i završetka), kategoriju, odjel i iznos
5. Korisnik potvrđuje unos klikom na "Sačuvaj"
6. Sistem validira podatke
7. Sistem sprema budžet
8. Sistem prikazuje potvrdu o uspješnom kreiranju

**Alternativni tokovi:**
- Ako obavezna polja nisu popunjena, sistem vizualno označava prazna polja i ne dozvoljava spremanje
- Ako je iznos manji ili jednak nuli, sistem ne dozvoljava spremanje
- Ako datum završetka prethodi datumu početka, sistem prikazuje upozorenje
- Ako korisnik nema pravo pristupa, sistem zabranjuje kreiranje

**Ishod:**
Novi budžet je uspješno kreiran i sačuvan u sistemu.

---

## 23. Pregled budžeta

**Akter:** Glavni računovođa / Finansijski direktor <br>
**Naziv use casea:** Pregled postojećeg budžeta

**Kratak opis:**
Korisnik pregledava listu svih kreiranih budžeta i detalje pojedinih budžeta raspoređenih po kategorijama i odjelima.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima pravo pregleda budžeta
- Barem jedan budžet postoji u sistemu

**Glavni tok:**
1. Korisnik otvara modul za planiranje budžeta
2. Sistem prikazuje listu svih kreiranih budžeta
3. Korisnik bira konkretan budžet
4. Sistem prikazuje detaljan pregled budžeta sa svim stavkama raspoređenim po kategorijama i odjelima

**Alternativni tokovi:**
- Ako ne postoji nijedan budžet, sistem prikazuje poruku "Trenutno nema kreiranih budžeta"
- Ako korisnik nema pravo pregleda, sistem zabranjuje pristup
- Ako dođe do greške pri učitavanju, sistem prikazuje poruku o grešci

**Ishod:**
Korisnik ima uvid u planirane iznose po kategorijama, odjelima i vremenskim periodima.

---

## 24. Uređivanje budžeta

**Akter:** Glavni računovođa <br>
**Naziv use casea:** Uređivanje postojećeg budžeta

**Kratak opis:**
Korisnik uređuje postojeći budžet kako bi ispravio greške ili prilagodio finansijski plan novim potrebama.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Korisnik ima pravo uređivanja budžeta
- Budžet koji se uređuje postoji u sistemu
- Korisnik može otvoriti detaljan pregled budžeta

**Glavni tok:**
1. Korisnik otvara listu budžeta
2. Korisnik bira konkretan budžet
3. Sistem prikazuje detalje budžeta
4. Korisnik bira opciju "Uredi"
5. Sistem omogućava izmjenu podataka
6. Korisnik unosi izmjene
7. Korisnik klikne na "Sačuvaj"
8. Sistem validira nove podatke
9. Sistem ažurira budžet u bazi
10. Sistem prikazuje potvrdu o uspješnom ažuriranju

**Alternativni tokovi:**
- Ako budžet ne postoji, sistem prikazuje poruku o grešci
- Ako uneseni podaci nisu validni, sistem ne dozvoljava spremanje
- Ako bi izmjena izazvala dupliranje budžeta za isti period i odjel, sistem prikazuje upozorenje "Budžet za ovaj period i odjel već postoji"
- Ako korisnik pokuša napustiti stranicu bez spremanja, sistem prikazuje upozorenje "Želite li sačuvati izmjene?"
- Ako korisnik nema pravo uređivanja, sistem zabranjuje pristup toj opciji

**Ishod:**
Postojeći budžet je uspješno ažuriran ili je korisnik obaviješten o problemu.

---

## 25. Dodavanje i pregled komentara

**Akter:** Glavni računovođa / Finansijski direktor <br>
**Naziv use casea:** Evidencija komentara

**Kratak opis:**
Korisnik dodaje komentar na trošak radi dodatnog pojašnjenja, te pregledava postojeće komentare uz trošak.

**Preduslovi:**
- Korisnik je prijavljen u sistem
- Trošak na koji se dodaje komentar postoji u sistemu
- Korisnik ima pravo dodavanja komentara

**Glavni tok:**
1. Korisnik otvara detaljan prikaz troška
2. Korisnik klikne na "Dodaj komentar"
3. Sistem prikazuje polje za unos teksta
4. Korisnik unosi komentar i klikne "Pošalji"
5. Sistem validira da komentar nije prazan
6. Sistem sprema komentar i povezuje ga s troškom
7. Sistem prikazuje komentar u listi ispod troška, uz ime autora i datum/vrijeme kreiranja
8. Komentari su sortirani od najstarijeg prema najnovijem

**Alternativni tokovi:**
- Ako korisnik pokuša poslati prazan komentar, sistem ne dozvoljava slanje
- Ako dođe do greške pri spremanju, sistem prikazuje poruku o grešci
- Ako trošak nema komentara, sistem prikazuje praznu listu komentara

**Ishod:**
Komentar je uspješno dodan i vidljiv uz trošak, ili korisnik pregledava postojeće komentare s informacijama o autoru i vremenu unosa.

---
