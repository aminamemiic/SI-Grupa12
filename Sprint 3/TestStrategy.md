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

