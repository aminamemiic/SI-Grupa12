## Cilj Testiranja

Cilj testiranja sistema za AI asistirano analiziranje troškova firme i otkrivanje odstupanja je osigurati da sve funkcionalnosti sistema rade ispravno, pouzdano i sigurno u skladu sa definisanim zahtjevima i acceptance kriterijima.

**Konkretni ciljevi su:**

- Verificirati da svi moduli sistema (unos troškova, uvoz podataka, AI analiza, generisanje upozorenja, upravljanje korisnicima, planiranje budžeta, izvještavanje i dashboard) rade ispravno i u skladu sa definisanim acceptance kriterijima.
- Potvrditi da RBAC mehanizam ispravno ograničava pristup osjetljivim podacima i funkcionalnostima prema ulozi korisnika.
- Provjeriti da AI komponenta tačno detektuje anomalije, prepoznaje obrasce potrošnje i generiše smislena upozorenja i sažetke.
- Osigurati da uvoz podataka iz CSV/Excel fajlova radi bez gubitka ili kvarenja podataka.
- Validirati usklađenost sistema sa GDPR regulativama, uključujući sigurno čuvanje, pristup i brisanje ličnih podataka.
- Provjeriti performanse sistema, posebno da AI analiza ne traje duže od 10 sekundi za standardne količine podataka, te da sistem podržava min. 50 istovremenih korisnika.
- Osigurati da korisnički interfejs pruža jasno, intuitivno i responzivno iskustvo na svim podržanim uređajima.

---

## Nivoi Testiranja

### 1. Unit Testiranje

Obuhvata testiranje:

- **Validacione logike za unos troškova** – zabrana nule ili negativnih vrijednosti, obaveznost polja, ispravnost datuma.
- **Logike za planiranje budžeta** – provjere kreiranja i ažuriranja budžeta, uključujući zabrane duplih budžeta za isti period i odjel, te zabranu datuma završetka koji prethodi datumu početka.
- **AI analize** – logika detekcije anomalija i duplikata, validacija kategorije, detekcija periodičnih troškova, označavanje sumnjivih obrazaca.
- **Logike izračunavanja odstupanja** – funkcije koje računaju razliku između planiranog i stvarnog troška po kategoriji, odjelu ili vremenskom periodu, uključujući rubne slučajeve (nula, prazna lista, negativno odstupanje).
- **Obrade i validacije uvezenih podataka** – parsiranje CSV/Excel podataka, mapiranje kolona, označavanje neispravnih zapisa, detekcija duplikata.
- **Kontrole pristupa po rolama** – RBAC provjere za svaku korisničku ulogu.
- **Generisanja upozorenja** – testiranje logike koja odlučuje kada i sa kojim nivoom ozbiljnosti (crvena, narandžasta, žuta) treba generisati upozorenje.
- **Logike za komentare** – provjera čuvanja, sortiranja (od najstarijeg) i zabrane praznog komentara.
- **Logike filtriranja podataka** po kriterijima (kategorija, odjel, projekat, vremenski period).
- **Logike pretrage** po ključnoj riječi.
- **Logike sortiranja** po datumu, nazivu i vrijednosti.

---

### 2. Integraciono Testiranje

Obuhvata testiranje:

- **Frontend – Backend API** – provjeru da ključni API pozivi sa frontenda vraćaju ispravne HTTP statusne kodove, strukturu odgovora i podatke u skladu sa API ugovorom.
- **Frontend/Backend – Baza podataka** – verifikaciju da CRUD operacije nad troškovima i budžetima ispravno mijenjaju stanje baze.
- **Backend – AI modul** – testiranje da pozivi ka AI modulu vraćaju strukturirane rezultate u predviđenom formatu i roku.
- **AI modul – Notifikacioni servis – Korisnik** – verifikacija da generisano upozorenje iz AI analize dostiže odgovarajuće korisnike putem internog notifikacionog mehanizma.
- **Frontend – OCR – Backend – Baza** – integracija OCR biblioteke s backendom, provjera ispravnog parsiranja i uvoza podataka.
- **Backend – Baza – Izvještajni modul** – provjera da generisani izvještaj (mjesečni, po odjelu, po projektu) koristi tačne i ažurne podatke direktno iz baze.
- **Izvještajni modul – Export servis** – provjera da exportovani fajl sadrži identične podatke kao prikaz u aplikaciji u trenutku pokretanja exporta, uključujući primijenjene filtere i vremenski period.

---

### 3. Regresiono Testiranje

Obuhvata testiranje:

- Prijava i odjava korisnika za sve uloge.
- Ručni unos troška s atributima i validacijom polja.
- Uvoz CSV fajla s validnim podacima.
- Kreiranje, pregled i uređivanje budžeta, uključujući validaciju duplikata, kao i poređenje.
- Pokretanje AI analize i dobijanje upozorenja.
- Provjera RBAC – da svaka rola vidi samo sebi namijenjene funkcionalnosti i rute.
- Generisanje izvještaja i provjera da sadržaj odgovara podacima u aplikaciji.
- Export izvještaja u PDF/Excel i provjera da fajl sadrži iste podatke kao prikaz – pokreće se nakon svake veće izmjene na modulima za troškove, budžet ili agregaciju podataka.
- Prikaz dashboarda nakon AI analize – provjera da su svi elementi (potrošnja vs. budžet, troškovi po odjelima, lista upozorenja, boje) ispravno prikazani nakon svake izmjene na modulima za troškove, budžet ili AI servis.
- Odjava i zabrana pristupa nakon logout-a – provjera da korisnik ne može pristupiti zaštićenom sadržaju ni putem back dugmeta ni direktnim URL-om nakon što se odjavio.

---

### 4. UI Testiranje

Obuhvata:

- Provjeru da svi elementi forme (polja, dugmad, padajući meniji) rade ispravno i prikazuju ispravne validacione poruke.
- Verifikaciju da filteri, pretraga i sortiranje ažuriraju prikaz liste u realnom vremenu.
- Testiranje da klik na grafikon na dashboardu otvara detaljan tabelarni prikaz troškova.
- Provjeru da dashboard prikazuje: odnos ukupna potrošnja vs. budžet, troškove po odjelima i listu AI upozorenja.
- Verifikaciju ispravnosti boja (zelena/narandžasta/crvena) u skladu s postotkom iskorištenosti budžeta.
- Testiranje responzivnosti na desktop, tablet i mobilnom uređaju.
- Provjeru da nijedan element ne prelazi granice ekrana i da su interaktivni elementi dovoljno veliki.
- Verifikaciju da unos novog troška zahtijeva manje od 3 klika/koraka.
- Provjeru jasnih vizuelnih indikatora za obavezna polja, greške i uspješne akcije.
- Provjeru da notifikacije od AI analize sadrže naslov, opis i nivo ozbiljnosti.

---

### 5. Sistemsko Testiranje

Obuhvata:

- **End-to-end scenariji** – provjera cjelokupnog toka rada sistema od unosa troškova i budžetiranja do AI analize, generisanja upozorenja, pregleda dashboarda i izvještaja.
- **Performansno testiranje** – provjera da sistem podržava rad sa 50 istovremenih korisnika i da AI analiza za standardne količine podataka traje ispod 10 sekundi.
- **Testiranje sigurnosti** – provjera da neautorizovani korisnici ne mogu pristupiti zaštićenim resursima.
- **GDPR usklađenost** – provjera funkcionalnosti pristupa, izmjene i brisanja ličnih podataka u skladu sa GDPR zahtjevima.
- **Backup i oporavak** – provjera da sistem pravilno kreira sigurnosne kopije i omogućava uspješan oporavak podataka.
- **Dostupnost sistema** – provjera da je sistem dostupan i stabilan tokom predviđenog radnog vremena.

---

## Prihvatno Testiranje (UAT)

Prihvatno testiranje se izvodi sa stvarnim krajnjim korisnicima ili njihovim predstavnicima, s ciljem potvrde da sistem zadovoljava poslovne potrebe i da je spreman za produkciju.

### Učesnici

| Uloga | Fokus |
|---|---|
| Finansijski direktor | Verifikacija izvještaja, dashboarda i upozorenja |
| Glavni računovođa | Unos troškova, planiranje budžeta, pregled i poređenje podataka |
| Administrativni zaposlenici | Ručni unos troška |
| Službenik za usklađenost | GDPR funkcionalnosti |
| Administrator | Upravljanje korisnicima i RBAC |

### Fokus UAT-a

- Provjera da prikaz dashboarda odmah komunicira stanje budžeta (boje, grafici, upozorenja).
- Verifikacija da AI sažeci upozorenja su razumljivi korisnicima bez tehničkog znanja.
- Provjera da uvoz iz CSV/Excel radi sa stvarnim fajlovima koje korisnici koriste.
- Validacija da su komentari uz troškove vidljivi i korisni u svakodnevnom radu.

| Funkcionalnost | Unit testiranje | Integraciono testiranje | Sistemsko testiranje | UI testiranje | Regresiono testiranje |
|---|---|---|---|---|---|
| **Prijava i odjava** (US-42, US-43) | Provjera prijave (korisničkog imena i lozinke), poruka o grešci, poništavanje prijave (odjava iz sistema) – invalidacija sesija | Login API, baza korisnika, zaštita ruta, invalidacija sesije pri odjavi | Login → preusmjerenje na dashboard po roli; logout → blokada zaštićenih resursa | Forma za prijavu prikazana ispravno; polja vizualno označena pri grešci; lozinka zaštićena; dugme 'Prijavi se' aktivno/neaktivno | Prijava i odjava za sve uloge; zabrana pristupa nakon logout-a |
| **Upravljanje korisnicima / RBAC** (US-11, US-12, US-13, US-14) | Provjera svake role (korisnik, menadžer, admin); zabrana pristupa van uloge; validacija dodjele uloga | Dodjela/izmjena uloge → DB → promjena odmah vidljiva i aktivna | Neovlašteni korisnik ne može pristupiti zabranjenim resursima | Admin vidi listu korisnika s rolama; UI elementi za nedozvoljene akcije su skriveni ili onemogućeni po roli | Nakon izmjena RBAC logike: provjera da svaka rola vidi samo sebi namijenjene UI elemente i rute |
| **Planiranje budžeta** (US-39, US-40, US-41) | Validacija obaveznih polja, zabrana iznosa < 0, zabrana datuma završetka < datuma početka, duplikat budžeta | CRUD endpointi za budžet, upis u bazu, provjera duplikata na DB nivou | Forma → budžet vidljiv u listi; duplikat → greška s porukom; neovlašteni korisnik ne vidi opcije uređivanja | Forma za kreiranje/uređivanje budžeta prikazuje ispravna polja; greške se prikazuju uz odgovarajuće polje; lista budžeta prikazana pregledno | Nakon izmjena modula budžeta: kreiranje, pregled i uređivanje budžeta; validacija duplikata |
| **Unos troškova** (US-15, US-16, US-17) | Validacija obaveznih polja, provjera atributa (kategorija, odjel, projekat), neispravni podaci blokirani | API poziv → čuvanje u DB; provjera da se trošak pojavljuje u listi; veza sa kategorijom/odjelom/projektom | Unos → trošak vidljiv u listi; nevalidni podaci → greška; korisniku bez pristupa blokiran unos | Forma: vizualno označavanje praznih polja, poruke greške, unos u < 3 koraka | Nakon izmjena forme ili validacije: ručni unos troška s atributima; poruke o greškama |
| **CRUD troškova** (US-18, US-19, US-20, US-21) | Kreiranje, validacija izmjena, potvrda brisanja; zabrana CRUD operacija bez ovlaštenja | DB integritet pri create/update/delete; rollback pri grešci | Kreiranje → vidljivo; brisanje → nestaje iz liste; neovlašteni korisnik → greška | Dugmad create/edit/delete vidljiva samo ovlaštenim ulogama; potvrda pri brisanju | Nakon svake izmjene CRUD logike ili UI komponenti: sve četiri operacije nad troškovima |
| **Uvoz podataka / OCR** (US-22, US-23) | Parsiranje CSV/Excel formata; provjera ispravnosti ekstraktovanih podataka | Integracija OCR biblioteke sa backendom; mapiranje kolona na entitete baze | Upload fajla → podaci uvezeni u sistem; greška pri neispravnom fajlu; OCR čita scan tačno | Poruka uspjeha/greške; pregled uvezenih zapisa s mogućnošću korekcije prikazan korisniku | Nakon izmjena OCR ili uvoznog modula: uspješan uvoz CSV i Excel fajlova; greška na neispravnom formatu |
| **Pregled i pretraga podataka** (US-1, US-2, US-3, US-4, US-5) | Logika filtriranja, pretrage i sortiranja; prikaz prazne liste; detalji zapisa | API filtriranja/pretrage/sortiranja → ispravni podaci iz DB; prazna lista → odgovarajuća poruka | Korisnik vidi listu, pretražuje i filtrira; prazna lista s porukom; klik otvara detalje | Tabela/lista prikazana s ispravnim kolonama; filter panel vidljiv i funkcionalan; sortiranje mijenja redoslijed u realnom vremenu; poruka 'Nema rezultata' prikazana kad nema podataka | Nakon izmjena liste ili filtera: pretraga, filtriranje, sortiranje i prikaz detalja zapisa |
| **Poređenje podataka** (US-6, US-7, US-8, US-9, US-10) | Logika poređenja po kategorijama; zabrana poređenja samo jednog zapisa; izračun odstupanja | API za dobavljanje više zapisa za poređenje; grupisanje po kategorijama/periodima | Odabir zapisa → paralelni prikaz; grafički prikaz; poređenje planiranog i stvarnog | Paralelni prikaz odabranih zapisa; jasno označena odstupanja; grafički prikaz s izborom tipa grafikona | Nakon izmjena komponente poređenja: odabir zapisa, vizualni prikaz i grafička reprezentacija |
| **AI analiza** (US-31, US-32, US-33, US-34, US-35, US-36) | Logika detekcije anomalija i duplikata; validacija kategorije; detekcija periodičnih troškova; označavanje sumnjivih obrazaca | Integracija AI modula sa modulom troškova i budžeta | Unos troška → AI detekcija u pozadini; pokretanje analize → vizualni prikaz trendova i predviđanja | Dugme 'Pokreni analizu' vidljivo i funkcionalno; loading indikator prikazan tokom obrade; rezultati analize i grafikon trendova prikazani čitljivo; AI sugestija kategorije pri unosu troška | Nakon izmjena AI modula ili integracije: detekcija anomalija pri unosu; pokretanje analize; prikaz predviđanja |
| **Generisanje upozorenja** (US-29, US-30) | Logika slanja/prikaza upozorenja; dodjela nivoa ozbiljnosti (crvena/narandžasta/žuta) na osnovu praga odstupanja | Integracija notifikacionog servisa sa AI modulom i modulom troškova | Anomalija → notifikacija s opisom i bojom ozbiljnosti vidljiva u UI; pregled historije upozorenja | Boje ozbiljnosti (crvena/narandžasta/žuta) ispravno prikazane; sadržaj upozorenja čitljiv i jasan | Nakon izmjena notifikacionog sistema: generisanje upozorenja na anomaliju; prikaz s ispravnom bojom ozbiljnosti |
| **Izvještaji** (US-24, US-25, US-26, US-27, US-28) | – | Generisani izvještaj koristi tačne podatke iz DB; exportovani PDF/Excel sadrži iste podatke kao prikaz u aplikaciji | Odabir perioda → izvještaj s tačnim podacima; export → preuzimanje fajla | Filter za period i tip izvještaja prikazan ispravno; tabela izvještaja čitljiva; dugme 'Preuzmi' funkcionalno i pokreće download | Nakon izmjena izvještajnog modula: generisanje izvještaja po periodu i export u podržanim formatima |
| **UI Dashboard** (US-37, US-38) | – | Agregacija podataka za Dashboard; integracija s AI, budžetom i troškovima | Prikaz metrika s bojama; klik na grafikon otvara detaljni prikaz; povratak na Dashboard | Dashboard se prikazuje bez layout grešaka; boje ispravno postavljene (zelena/narandžasta/crvena); grafikoni su responsivni; klik na grafikon otvara tabelarni detalj; dugme za povratak vidljivo | Nakon izmjena Dashboard komponente ili podataka: prikaz metrika, boje statusa |
| **Evidencija komentara** (US-44, US-45) | Zabrana praznog komentara; provjera veze komentara i troška; sortiranje po datumu | Komentar → DB vezan za trošak; dohvatanje s metapodacima (autor, datum) | Dodavanje → komentar vidljiv u listi s autorom i datumom; prazno → blokada | Polje za komentar i dugme 'Pošalji' vidljivi na detaljima troška; lista komentara prikazana s imenom autora i timestampom; prazno polje vizualno označeno | – |

## Veza sa acceptance kriterijima

## 1. Unit testiranje

### Stavka testiranja: Validaciona logika za unos troškova
*(zabrana nule/negativnih vrijednosti, obaveznost polja, ispravnost datuma)*

**Acceptance kriteriji koji se pokrivaju:**

**US-17:**
- Kada korisnik unese neispravne podatke, tada sistem mora prikazati odgovarajuću grešku.
- Sistem ne smije dozvoliti spremanje nevalidnih podataka.

**US-16:**
- Kada korisnik popuni sva obavezna polja, tada sistem mora povezati trošak sa odabranim atributima.
- Kada neki atribut nije odabran, tada sistem mora upozoriti korisnika.

### Stavka testiranja: Logika za planiranje budžeta
*(kreiranje, ažuriranje, zabrana duplikata, zabrana pogrešnog datuma)*

**Acceptance kriteriji koji se pokrivaju:**

**US-39:**
- Sistem ne smije dozvoliti kreiranje budžeta sa iznosom manjim ili jednakim nuli.
- Sistem ne smije dozvoliti kreiranje budžeta ako datum završetka prethodi datumu početka.
- Kada korisnik pokuša kreirati budžet sa praznim poljima, sistem mora vizualno označiti prazna obavezna polja.

**US-41:**
- Sistem ne smije dozvoliti da uređivanjem nastanu dva budžeta sa istim odjelom, kategorijom i vremenskim periodom.
- Sistem ne smije dozvoliti uređivanje budžeta sa iznosom manjim ili jednakim nuli.

### Stavka testiranja: AI analiza
*(detekcija anomalija i duplikata, predlaganje kategorije, detekcija periodičnih troškova, sumnjivi obrasci)*

**Acceptance kriteriji koji se pokrivaju:**

**US-31:**
- Kada se unese novi trošak, tada sistem mora u pozadini izvršiti poređenje s podacima te kategorije.
- Ako sistem detektuje odstupanje, tada isto mora označiti.
- Sistem mora prepoznati dupli unos ako uoči podudaranje.

**US-35:**
- Kada korisnik unese naziv troška, tada sistem mora analizirati ključne riječi i predložiti najvjerovatniju kategoriju.
- Sistem mora omogućiti korisniku da ručno promijeni predloženu kategoriju.

**US-36:**
- Kada sistem detektuje da se određeni trošak ponavlja u intervalima, tada ga mora označiti kao periodični trošak.
- Ako periodični trošak ne bude unesen do par dana nakon uobičajenog datuma, tada sistem mora poslati podsjetnik.

**US-33:**
- Kada korisnik unese trošak u vrijeme koje odstupa od uobičajenog radnog vremena, tada sistem mora označiti taj unos zastavicom.
- Kada se detektuje učestalo brisanje ili modifikovanje zapisa, tada sistem mora generisati upozorenje.

### Stavka testiranja: Logika izračunavanja odstupanja
*(razlika planirano vs. stvarno po kategoriji, odjelu, periodu; rubni slučajevi)*

**Acceptance kriteriji koji se pokrivaju:**

**US-9:**
- Kada korisnik odabere podatke za poređenje, tada sistem mora prikazati planirane i stvarne troškove.
- Sistem mora jasno označiti razlike tj. odstupanja.

**US-34:**
- Kada korisnik otvori analitiku, tada sistem mora izračunati i prikazati procjenu ukupnog troška na kraju mjeseca.
- Kada projekcija pokazuje da će budžet biti premašen, tada sistem mora prikazati procenat prekoračenja.

### Stavka testiranja: Obrada i validacija uvezenih podataka
*(parsiranje CSV/Excel, mapiranje kolona, označavanje neispravnih zapisa, detekcija duplikata)*

**Acceptance kriteriji koji se pokrivaju:**

**US-22:**
- Kada korisnik učita fajl, tada sistem mora prikazati podatke za obradu.
- Sistem ne smije prikazati grešku za validan fajl.

**US-23:**
- Kada sistem obradi podatke, tada ih mora transformisati u odgovarajući format.
- Sistem ne smije izgubiti podatke tokom obrade.

**US-24:**
- Kada postoje neispravni zapisi, tada sistem mora označiti greške.
- Sistem ne smije spremiti nevalidne podatke.

### Stavka testiranja: Kontrole pristupa po rolama
*(RBAC provjere za svaku korisničku ulogu)*

**Acceptance kriteriji koji se pokrivaju:**

**US-11:**
- Kada administrator dodijeli ulogu korisniku, tada sistem mora sačuvati promjene.
- Korisnik mora imati pristup samo dozvoljenim funkcijama.
- Sistem ne smije dozvoliti nevažeće uloge.

**US-12:**
- Kada korisnik pokuša pristupiti zabranjenoj funkciji, tada sistem mora odbiti pristup.
- Sistem mora prikazati poruku o zabrani pristupa.
- Pravila moraju važiti za sve korisnike.

**US-21:**
- Kada korisnik bez ovlasti pokuša izvršiti akciju, tada sistem mora blokirati pristup.
- Sistem mora prikazati poruku o zabrani pristupa.

### Stavka testiranja: Generisanje upozorenja
*(logika okidanja, nivo ozbiljnosti: crvena/narandžasta/žuta)*

**Acceptance kriteriji koji se pokrivaju:**

**US-29:**
- Kada AI identifikuje anomaliju, tada sistem mora generisati notifikaciju unutar aplikacije.
- Notifikacija mora sadržavati naslov i kratki opis problema.

**US-30:**
- Kada korisnik otvori notifikaciju, tada sistem mora prikazati tekstualno obrazloženje.
- Sistem mora naznačiti nivo ozbiljnosti (crveno, narandžasto, žuto).

### Stavka testiranja: Logika za komentare
*(čuvanje, sortiranje od najstarijeg, zabrana praznog komentara)*

**Acceptance kriteriji koji se pokrivaju:**

**US-44:**
- Kada korisnik unese validan tekst i klikne “Pošalji”, tada sistem mora sačuvati komentar.
- Sistem mora povezati komentar sa odgovarajućim troškom.
- Sistem ne smije dozvoliti unos praznog komentara.

**US-45:**
- Sistem mora prikazati listu komentara za odabrani trošak.
- Sistem mora prikazati komentare sortirane od najstarijeg prema najnovijem.

### Stavka testiranja: Logika filtriranja podataka po kriterijima
*(kategorija, odjel, projekat, vremenski period)*

**Acceptance kriteriji koji se pokrivaju:**

**US-2:**
- Kada korisnik odabere filter kriterij, tada sistem mora prikazati filtrirane podatke.
- Kada nema podataka, tada sistem mora prikazati poruku “Nema rezultata”.
- Kada korisnik resetuje filtere, tada sistem mora prikazati sve podatke.

### Stavka testiranja: Logika pretrage po ključnoj riječi

**Acceptance kriteriji koji se pokrivaju:**

**US-3:**
- Kada korisnik unese ključnu riječ, tada sistem mora prikazati odgovarajuće podatke.
- Kada nema podataka, tada sistem mora prikazati poruku “Nema rezultata”.
- Sistem ne smije napraviti grešku prilikom pretrage.

### Stavka testiranja: Logika sortiranja po datumu, nazivu i vrijednosti

**Acceptance kriteriji koji se pokrivaju:**

**US-5:**
- Kada korisnik odabere kriterij sortiranja, podaci se moraju sortirati ispravno.
- Kada korisnik promijeni način sortiranja, tada sistem mora ažurirati prikaz.

## 2. Integraciono testiranje

### Stavka testiranja: Frontend – Backend API
*(ključni API pozivi vraćaju ispravne HTTP kodove, strukturu odgovora i podatke prema API ugovoru)*

**Acceptance kriteriji koji se pokrivaju:**

**US-15:**
- Kada korisnik unese sve potrebne podatke i klikne “Sačuvaj”, tada sistem mora spremiti trošak u bazu.
- Sistem ne smije prikazati grešku prilikom spremanja validnih podataka.

**US-42:**
- Kada korisnik unese ispravne podatke, sistem mora prepoznati korisnika.
- Kada korisnik unese neispravne podatke, tada sistem mora prikazati generičku poruku greške.

**US-12:**
- Kada korisnik pokuša pristupiti zabranjenoj funkciji, tada sistem mora odbiti pristup.
- Sistem mora prikazati poruku o zabrani pristupa.

### Stavka testiranja: Frontend/Backend – Baza podataka
*(CRUD operacije nad troškovima i budžetima ispravno mijenjaju stanje baze)*

**Acceptance kriteriji koji se pokrivaju:**

**US-18:**
- Kada korisnik kreira trošak, tada sistem mora spremiti podatke u bazu.
- Sistem ne smije prikazati grešku prilikom kreiranja.

**US-19:**
- Kada korisnik izmijeni trošak i sačuva promjene, tada sistem mora ažurirati podatke.
- Sistem ne smije prikazati grešku prilikom ažuriranja.

**US-20:**
- Kada korisnik potvrdi brisanje, tada sistem mora ukloniti trošak iz baze.
- Sistem ne smije prikazati grešku prilikom brisanja.

**US-39:**
- Kada ovlašteni korisnik ispravno popuni sva obavezna polja i klikne “Sačuvaj”, tada sistem mora sačuvati budžet.
- Sistem mora prikazati poruku “Budžet je uspješno kreiran”.

### Stavka testiranja: Backend – AI modul
*(pozivi ka AI modulu vraćaju strukturirane rezultate u predviđenom formatu i roku)*

**Acceptance kriteriji koji se pokrivaju:**

**US-31:**
- Kada se unese novi trošak, tada sistem mora u pozadini izvršiti poređenje s podacima te kategorije.
- Ako sistem detektuje odstupanje, tada isto mora označiti.

**US-32:**
- Kada korisnik pokrene AI analizu, tada sistem mora obraditi sve podatke i generisati vizuelni prikaz trendova.
- Rezultat analize mora uključivati procjenu troškova za naredni mjesec.

### Stavka testiranja: AI modul – Notifikacioni servis – Korisnik
*(upozorenje iz AI analize dostiže korisnike putem internog notifikacionog mehanizma)*

**Acceptance kriteriji koji se pokrivaju:**

**US-29:**
- Kada AI identifikuje anomaliju, tada sistem mora generisati notifikaciju unutar aplikacije.
- Notifikacija mora sadržavati naslov i kratki opis problema.

**US-30:**
- Kada korisnik otvori notifikaciju, tada sistem mora prikazati tekstualno obrazloženje.
- Sistem mora naznačiti nivo ozbiljnosti (crveno, narandžasto, žuto).

### Stavka testiranja: Frontend – OCR – Backend – Baza
*(integracija OCR biblioteke s backendom, provjera ispravnog parsiranja i uvoza podataka)*

**Acceptance kriteriji koji se pokrivaju:**

**US-22:**
- Kada korisnik učita fajl, tada sistem mora prikazati podatke za obradu.
- Sistem ne smije prikazati grešku za validan fajl.

**US-23:**
- Kada sistem obradi podatke, tada ih mora transformisati u odgovarajući format.
- Sistem ne smije izgubiti podatke tokom obrade.

**US-24:**
- Kada postoje neispravni zapisi, tada sistem mora označiti greške.
- Sistem ne smije spremiti nevalidne podatke.

### Stavka testiranja: Backend – Baza – Izvještajni modul
*(generisani izvještaj koristi tačne i ažurne podatke direktno iz baze)*

**Acceptance kriteriji koji se pokrivaju:**

**US-25:**
- Kada korisnik generiše izvještaj, tada sistem mora prikazati podatke.
- Sistem ne smije prikazati grešku prilikom generisanja.

**US-26:**
- Kada korisnik odabere period, tada sistem mora prikazati relevantne podatke.
- Sistem ne smije prikazati podatke van odabranog perioda.

**US-28:**
- Kada korisnik otvori izvještaj, tada sistem mora prikazati ključne informacije.
- Sistem ne smije prikazati grešku prilikom učitavanja.

### Stavka testiranja: Izvještajni modul – Export servis
*(exportovani fajl sadrži identične podatke kao prikaz u aplikaciji, uključujući filtere i period)*

**Acceptance kriteriji koji se pokrivaju:**

**US-27:**
- Kada korisnik izvrši export, tada sistem mora generisati i omogućiti preuzimanje fajla.
- Sistem ne smije prikazati grešku tokom izvoza.

## 3. Regresiono testiranje

### Stavka testiranja: Prijava i odjava korisnika za sve uloge

**Acceptance kriteriji koji se pokrivaju:**

**US-42:**
- Kada korisnik unese ispravne podatke, sistem mora prepoznati korisnika i preusmjeriti na dashboard u skladu sa ulogom.
- Kada korisnik unese neispravne podatke, tada sistem mora prikazati generičku poruku greške.
- Sistem ne smije dozvoliti pristup korisniku koji nije prijavljen; direktan URL mora preusmjeriti na login.

**US-43:**
- Kada korisnik klikne “Odjavi se”, tada sistem treba preusmjeriti na stranicu za prijavu.
- Kada se korisnik uspješno odjavio, ako pritisne back dugme, sistem ne smije prikazati sadržaj.

### Stavka testiranja: Ručni unos troška s atributima i validacijom polja

**Acceptance kriteriji koji se pokrivaju:**

**US-15:**
- Kada korisnik unese sve potrebne podatke i klikne “Sačuvaj”, tada sistem mora spremiti trošak u bazu.
- Kada je trošak uspješno spremljen, tada sistem mora prikazati trošak u listi.

**US-16:**
- Kada korisnik popuni sva obavezna polja, tada sistem mora povezati trošak sa odabranim atributima.
- Kada neki atribut nije odabran, tada sistem mora upozoriti korisnika.

**US-17:**
- Kada korisnik unese neispravne podatke, tada sistem mora prikazati odgovarajuću grešku.
- Sistem ne smije dozvoliti spremanje nevalidnih podataka.

### Stavka testiranja: Uvoz CSV fajla s validnim podacima

**Acceptance kriteriji koji se pokrivaju:**

**US-22:**
- Kada korisnik učita fajl, tada sistem mora prikazati podatke za obradu.
- Sistem ne smije prikazati grešku za validan fajl.

**US-23:**
- Kada sistem obradi podatke, tada ih mora transformisati u odgovarajući format.
- Sistem ne smije izgubiti podatke tokom obrade.

### Stavka testiranja: Kreiranje, pregled i uređivanje budžeta
*(validacija duplikata, poređenje)*

**Acceptance kriteriji koji se pokrivaju:**

**US-39:**
- Kada ovlašteni korisnik ispravno popuni sva obavezna polja i klikne “Sačuvaj”, sistem mora sačuvati budžet i prikazati poruku “Budžet je uspješno kreiran”.
- Sistem ne smije dozvoliti kreiranje budžeta sa iznosom manjim ili jednakim nuli ili pogrešnim datumom.

**US-40:**
- Kada korisnik pristupi modulu, tada sistem mora prikazati listu svih kreiranih budžeta.
- Kada korisnik odabere budžet, tada sistem mora prikazati detaljan pregled.

**US-41:**
- Sistem ne smije dozvoliti da nastanu dva budžeta sa istim odjelom, kategorijom i periodom.
- Korisnik treba dobiti upozorenje “Budžet za ovaj period i odjel već postoji”.

**US-9:**
- Kada korisnik odabere podatke za poređenje, tada sistem mora prikazati planirane i stvarne troškove.
- Sistem mora jasno označiti razlike tj. odstupanja.

### Stavka testiranja: Pokretanje AI analize i dobijanje upozorenja

**Acceptance kriteriji koji se pokrivaju:**

**US-32:**
- Kada korisnik pokrene AI analizu, tada sistem mora obraditi sve podatke i generisati vizuelni prikaz trendova.
- Rezultat analize mora uključivati procjenu troškova za naredni period.

**US-29:**
- Kada AI identifikuje anomaliju, tada sistem mora generisati notifikaciju unutar aplikacije.
- Notifikacija mora sadržavati naslov i kratki opis problema.

### Stavka testiranja: Provjera RBAC – svaka rola vidi samo sebi namijenjene funkcionalnosti i rute

**Acceptance kriteriji koji se pokrivaju:**

**US-11:**
- Korisnik mora imati pristup samo dozvoljenim funkcijama.
- Sistem ne smije dozvoliti nevažeće uloge.

**US-12:**
- Kada korisnik pokuša pristupiti zabranjenoj funkciji, tada sistem mora odbiti pristup.
- Sistem mora prikazati poruku o zabrani pristupa.
- Pravila moraju važiti za sve korisnike.

**US-14:**
- Kada administrator promijeni ulogu korisniku, tada sistem mora sačuvati promjenu.
- Promjena mora odmah stupiti na snagu.

### Stavka testiranja: Generisanje izvještaja i provjera da sadržaj odgovara podacima u aplikaciji

**Acceptance kriteriji koji se pokrivaju:**

**US-25:**
- Kada korisnik generiše izvještaj, tada sistem mora prikazati podatke.
- Sistem ne smije prikazati grešku prilikom generisanja.

**US-28:**
- Kada korisnik otvori izvještaj, tada sistem mora prikazati ključne informacije.
- Sistem ne smije prikazati grešku prilikom učitavanja.

### Stavka testiranja: Export izvještaja u PDF/Excel – provjera identičnih podataka kao u prikazu
*(pokreće se nakon svake veće izmjene na modulima za troškove, budžet ili agregaciju)*

**Acceptance kriteriji koji se pokrivaju:**

**US-27:**
- Kada korisnik izvrši export, tada sistem mora generisati i omogućiti preuzimanje fajla.
- Sistem ne smije prikazati grešku tokom izvoza.

### Stavka testiranja: Prikaz dashboarda nakon AI analize
*(svi elementi ispravni nakon izmjena na modulima za troškove, budžet ili AI servis)*

**Acceptance kriteriji koji se pokrivaju:**

**US-37:**
- Kada korisnik otvori Dashboard, tada sistem mora prikazati odnos ukupna potrošnja–budžet, troškove po odjelima i listu posljednjih AI upozorenja.
- Sistem mora koristiti “semafor boje” kako bi dočarao stanje.

### Stavka testiranja: Odjava i zabrana pristupa nakon logout-a
*(back dugme i direktni URL ne prikazuju sadržaj)*

**Acceptance kriteriji koji se pokrivaju:**

**US-43:**
- Kada se korisnik uspješno odjavio, ako pritisne dugme za povratak u browseru, sistem ne smije prikazati sadržaj.
- Korisnik mora ostati na stranici za prijavu.

**US-42:**
- Sistem ne smije dozvoliti pristup korisniku koji nije prijavljen.
- Direktan pristup putem URL-a mora preusmjeriti korisnika na stranicu za prijavu.

## 4. UI testiranje

### Stavka testiranja: Provjera elemenata forme
*(polja, dugmad, padajući meniji – ispravne validacione poruke)*

**Acceptance kriteriji koji se pokrivaju:**

**US-17:**
- Kada korisnik unese neispravne podatke, tada sistem mora prikazati odgovarajuću grešku.
- Sistem ne smije dozvoliti spremanje nevalidnih podataka.

**US-39:**
- Kada korisnik pokuša kreirati budžet sa praznim poljima, tada sistem mora vizualno označiti prazna obavezna polja.

**US-42:**
- Kada korisnik pokuša prijaviti se sa praznim poljima, tada sistem mora vizualno označiti prazna obavezna polja.
- Sistem ne smije prikazati unesenu lozinku u čitljivom obliku.

### Stavka testiranja: Filteri, pretraga i sortiranje ažuriraju prikaz liste u realnom vremenu

**Acceptance kriteriji koji se pokrivaju:**

**US-2:**
- Kada korisnik odabere filter kriterij, tada sistem mora prikazati filtrirane podatke.
- Kada nema podataka, tada sistem mora prikazati poruku “Nema rezultata”.
- Kada korisnik resetuje filtere, tada sistem mora prikazati sve podatke.

**US-3:**
- Kada korisnik unese ključnu riječ, tada sistem mora prikazati odgovarajuće podatke.
- Kada nema podataka, tada sistem mora prikazati poruku “Nema rezultata”.

**US-5:**
- Kada korisnik odabere kriterij sortiranja, podaci se moraju sortirati ispravno.
- Kada korisnik promijeni način sortiranja, tada sistem mora ažurirati prikaz.

### Stavka testiranja: Klik na grafikon na dashboardu otvara detaljan tabelarni prikaz troškova

**Acceptance kriteriji koji se pokrivaju:**

**US-38:**
- Kada korisnik klikne na grafikon, tada sistem mora otvoriti tabelarni prikaz svih troškova koji pripadaju tom segmentu.
- Mora se omogućiti povratak na početni ekran.

### Stavka testiranja: Dashboard prikazuje potrošnju vs. budžet, troškove po odjelima i listu AI upozorenja

**Acceptance kriteriji koji se pokrivaju:**

**US-37:**
- Kada korisnik otvori Dashboard, tada sistem mora prikazati odnos ukupna potrošnja–budžet, troškove po odjelima i listu posljednjih AI upozorenja.
- Sistem mora koristiti “semafor boje” kako bi dočarao stanje.

### Stavka testiranja: Ispravnost boja semafora
*(zelena/narandžasta/crvena prema postotku iskorištenosti budžeta)*

**Acceptance kriteriji koji se pokrivaju:**

**US-37:**
- Sistem mora koristiti “semafor boje” kako bi dočarao stanje.

### Stavka testiranja: Responzivnost na desktop, tablet i mobilnom uređaju

**Acceptance kriteriji koji se pokrivaju:**

**NFR-11:**
- Sistem mora biti u potpunosti responzivan i funkcionalan na mobilnim uređajima i tabletima, pored desktop pretraživača.
- Testiranje ključnih funkcionalnosti na najmanje 3 različita uređaja: desktop, tablet i mobitel.

### Stavka testiranja: Nijedan element ne prelazi granice ekrana; interaktivni elementi dovoljno veliki

**Acceptance kriteriji koji se pokrivaju:**

**NFR-11:**
- Sistem mora biti u potpunosti responzivan i funkcionalan na mobilnim uređajima i tabletima.
- Svi interaktivni elementi moraju biti dostupni i upotrebljivi na touch uređajima.

### Stavka testiranja: Unos novog troška zahtijeva manje od 3 klika/koraka

**Acceptance kriteriji koji se pokrivaju:**

**NFR-3:**
- Administrativni zaposlenici moraju moći unijeti novi trošak u manje od 3 koraka (klika).
- Verificira se kroz user testing sa administrativnim zaposlenicima.

### Stavka testiranja: Vizuelni indikatori za obavezna polja, greške i uspješne akcije

**Acceptance kriteriji koji se pokrivaju:**

**US-17:**
- Kada korisnik unese neispravne podatke, tada sistem mora prikazati odgovarajuću grešku.

**US-39:**
- Kada korisnik pokuša kreirati budžet sa praznim poljima, tada sistem mora vizualno označiti prazna obavezna polja.

**US-15:**
- Kada je trošak uspješno spremljen, tada sistem mora prikazati trošak u listi.
- Sistem ne smije prikazati grešku prilikom spremanja validnih podataka.

### Stavka testiranja: Notifikacije od AI analize sadrže naslov, opis i nivo ozbiljnosti

**Acceptance kriteriji koji se pokrivaju:**

**US-29:**
- Kada AI identifikuje anomaliju, tada sistem mora generisati notifikaciju unutar aplikacije.
- Notifikacija mora sadržavati naslov i kratki opis problema.

**US-30:**
- Kada korisnik otvori notifikaciju, tada sistem mora prikazati tekstualno obrazloženje.
- Sistem mora naznačiti nivo ozbiljnosti (crveno, narandžasto, žuto).

## 5. Sistemsko testiranje

### Stavka testiranja: End-to-end scenariji
*(unos troškova → budžet → poređenje planiranih i stvarnih troškova → AI analiza → upozorenja → dashboard → izvještaj)*

**Acceptance kriteriji koji se pokrivaju:**

**US-9:**
- Kada korisnik odabere podatke za poređenje, tada sistem mora prikazati planirane i stvarne troškove.

**US-15:**
- Kada korisnik unese sve potrebne podatke i klikne na “Sačuvaj”, tada sistem mora spremiti trošak u bazu

**US-39:**
- Kada ovlašteni korisnik ispravno popuni sva obavezna polja, ako klikne "Sačuvaj", tada sistem mora sačuvati budžet i prikazati poruku "Budžet je uspješno kreiran".

**US-31:**
- Kada se unese novi trošak, tada sistem mora u pozadini izvršiti poređenje s podacima te kategorije
- Ako sistem detektuje odstupanje, tada isto mora označava


**US-29:**
- Kada AI identifikuje anomaliju, tada sistem mora generisati notifikaciju unutar aplikacije

**US-37:**
- Kada korisnik otvori Dashboard, tada sistem mora prikazati: odnos ukupna potrošnja-budžet, troškove po odjelima i listu posljednjih AI upozorenja

**US-27:**
- Kada korisnik izvrši export, tada sistem mora generisati i omogućiti preuzimanje fajla.

### Stavka testiranja: Performansno testiranje
*(50 istovremenih korisnika; AI analiza kraća od 10 sekundi)*

**Acceptance kriteriji koji se pokrivaju:**

**NFR-9:**
- Sistem mora podržati istovremeni rad najmanje 50 korisnika bez degradacije performansi.
- Verificira se load testingom sa simuliranim brojem od 50 istovremenih korisnika.

**NFR-4:**
- AI generisanje izvještaja i analiza odstupanja ne smije trajati duže od 10 sekundi za standardne mjesečne količine podataka.
- Verificira se mjerenjem vremena pod normalnim i povećanim opterećenjem.

### Stavka testiranja: Sigurnosno testiranje
*(RBAC mehanizam, HTTPS/TLS zaštita, zabrana pristupa bez aktivne sesije)*

**Acceptance kriteriji koji se pokrivaju:**

**NFR-1:**
- Implementacija RBAC mora osigurati da samo određeni stakeholderi imaju pristup povjerljivim podacima.
- Verificira se testiranjem pokušaja pristupa za sve nivoe korisnika.

**NFR-13:**
- Sve komunikacije između klijenta i servera moraju biti šifrirane putem HTTPS/TLS protokola.
- Verificira se provjerom SSL/TLS certifikata i testiranjem svih endpointa.

**NFR-14:**
- Svaki korisnik mora biti autentificiran prije pristupa sistemu.
- Sistem mora podržavati sigurnu prijavu, odjavu i upravljanje sesijama.

**US-42:**
- Sistem ne smije dozvoliti pristup korisniku koji nije prijavljen.
- Direktan pristup putem URL-a mora preusmjeriti korisnika na stranicu za prijavu.

### Stavka testiranja: GDPR usklađenost
*(pregled, izmjena i brisanje ličnih podataka)*

**Acceptance kriteriji koji se pokrivaju:**

**NFR-12:**
- Korisnici moraju imati mogućnost pregleda, izmjene i brisanja svojih ličnih podataka u skladu sa GDPR pravom.
- Verificira se testiranjem toka zahtjeva za pristup i brisanje, kao i provjerom da se podaci stvarno uklanjaju iz baze.

**NFR-5:**
- Sistem mora biti u potpunosti usklađen sa GDPR regulativama jer obrađuje osjetljive finansijske podatke i plate zaposlenika.
- Verificira se provjerom usklađenosti od strane službenika za usklađenost.

### Stavka testiranja: Backup i oporavak
*(sistem pravilno kreira sigurnosne kopije i omogućava uspješan oporavak)*

**Acceptance kriteriji koji se pokrivaju:**

**NFR-10:**
- Sistem mora imati automatizovane backup mehanizme koji osiguravaju dnevno pravljenje sigurnosnih kopija finansijskih podataka.
- Verificira se provjerom da li se backup kreira svakodnevno i testiranjem uspješnosti oporavka podataka.

### Stavka testiranja: Dostupnost sistema
*(stabilan rad tokom predviđenog radnog vremena)*

**Acceptance kriteriji koji se pokrivaju:**

**NFR-7:**
- Sistem mora biti dostupan tokom cijelog radnog vremena, s obzirom da administrativni zaposlenici redovno unose podatke.
- Verificira se praćenjem dostupnosti sistema tokom radnog vremena u periodu od 30 dana.

## Način evidentiranja rezultata testiranja

Za svaki test case evidentiramo sljedeće informacije:
- ID testa
- opis testa
- Ulazni podaci
- očekivani rezultat
- stvarni rezultat
- status testa (PASS / FAIL)
- ID bug-a
- Opis greške
- Prioritet greške
- datum izvršenja
- odgovorna osoba
- napomena

## Glavni rizici kvaliteta
| ID | Rizik | Vjerovatnoća | Utjecaj | Strategija ublažavanja |
|---|---|---|---|---|
| R-01 | Netačni rezultati AI analize (lažno pozitivna ili lažno negativna upozorenja) | Srednja | Visok | Testiranje AI modela na reprezentativnim skupovima podataka; usporedba s ručnim izračunima; uključivanje domenskog eksperta (računovođe) u validaciju.
| R-02 | Gubitak ili kvarenje podataka pri uvozu iz CSV/Excel (pogrešno mapiranje, encoding problemi) | Visoka | Visok | Opsežni unit i integracioni testovi za parser; testiranje s različitim formatima datoteka, encoding-ima i graničnim slučajevima (prazne ćelije, specijalni znakovi).
| R-03 | Kršenje RBAC-a – neovlašteni korisnik pristupa podacima | Niska | Kritičan | Penetracijsko testiranje svih API ruta; unit testovi permission helpera; automatizovani sigurnosni testovi u CI/CD.
| R-04 | Performansno usko grlo AI analize (>10s za standardne podatke) | Srednja | Srednji | Load testiranje u ranoj fazi; profilisanje AI servisa; optimizacija upita ka bazi podataka.
| R-05 | Neusklađenost sa GDPR – podaci se ne brišu potpuno ili se neovlašteno dijele | Niska | Kritičan | Sistemsko testiranje GDPR toka; pregled od strane službenika za usklađenost; provjera baze podataka nakon brisanja.
| R-06 | OCR greške u prepoznavanju teksta sa slika/skeniranih računa | Visoka | Srednji | Testiranje s velikim skupom stvarnih dokumenata; prikaz confidence score-a korisniku; omogućiti manuelnu korekciju OCR rezultata.
| R-07 | Regresija u CRUD operacijama pri dodavanju novih funkcionalnosti | Srednja | Visok | Automatizovana regresiona test suite pokriva sve CRUD operacije; obavezno izvršavanje pri svakom buildu.
| R-08 | UI nekonzistentnost između browsera i uređaja (responzivnost) | Srednja | Srednji | Cross-browser testiranje (Chrome, Firefox, Safari, Edge); testiranje na fizičkim uređajima za tablet i mobitel.
| R-09 | Kvar sistema pri istovremenom pristupu 50+ korisnika | Niska | Visok | Load testiranje s alatima kao što je k6 ili JMeter; praćenje metrika tokom testa; optimizacija baze i caching.
| R-10 | Nedostupnost sistema van radnog vremena uzrokovana greškama u deployu | Niska | Srednji | Automatizovani health check monitoring; rollback procedura dokumentovana i testirana; praćenje dostupnosti 30 dana (NFR-7).
