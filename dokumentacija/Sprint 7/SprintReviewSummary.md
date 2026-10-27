# Sprint Review Summary

## Sprint 7

# 1. Planirani sprint goal
Implementirati funkcionalnosti uvoza podataka iz CSV i Excel fajlova te kreiranje i upravljanje budžetima s poslovnom logikom odobravanja, uključujući ograničenje izmjena nakon odobravanja i zabranu brisanja budžeta.

# 2. Šta je završeno
Tim je uspješno realizirao sve planirane aktivnosti za ovaj sprint:

- Uvoz podataka iz CSV fajlova - implementiran je parser za CSV format s detekcijom separatora, mapiranjem kolona i validacijom podataka prije upisa u bazu.

- Uvoz podataka iz Excel fajlova - implementiran je parser za Excel format s podrškom za čitanje prvog sheet-a i konverzijom formula u vrijednosti.

- Pregled i validacija uvezenih podataka - korisnik može pregledati parsed podatke i provjeriti ispravnost prije konačnog upisa, uz jasno označavanje neispravnih redova s opisom greške.

- Kreiranje budžeta - omogućeno je kreiranje budžeta s definisanjem planiranih iznosa po kategorijama, odjelima i vremenskom periodu.

- Uređivanje budžeta - implementirana je mogućnost izmjene budžeta uz poslovnu logiku koja onemogućava izmjene nakon što finansijski direktor odobri budžet.

- Zabrana brisanja budžeta - implementirana je zaštita koja onemogućava brisanje budžeta u bilo kojoj fazi, u skladu s poslovnim pravilima sistema.

- Decision Log i Sprint Backlog - dokumenti su ažurirani i korišteni za praćenje odluka i statusa zadataka.

# 3. Šta nije završeno
Sve planirane stavke za Sprint 7 su uspješno završene.

# 4. Demonstrirane funkcionalnosti ili artefakti
- Uvoz troškova iz CSV fajla
- Uvoz troškova iz Excel fajla
- Mapiranje kolona pri uvozu
- Pregled i validacija uvezenih podataka prije upisa
- Prikaz neispravnih redova s opisom greške
- Historija uvoza s brojem uvezenih i odbijenih redova
- Kreiranje novog budžeta
- Uređivanje budžeta u statusu nacrta
- Zaštita odobrenog budžeta od izmjena
- Zabrana brisanja budžeta

# 5. Glavni problemi i blokeri
- Najveći bloker u sprintu bio je redeploy aplikacije na Railway platformi, koji je uzrokovao komplikacije zbog kojih je kolega zadužen za deployment morao forkati projekat kako bi nastavio s radom. 

- Bilo je potrebno jasno definisati ponašanje sistema pri prelasku budžeta iz statusa nacrta u status odobrenog, posebno u pogledu blokiranja svih PUT endpointa vezanih za budžet nakon odobravanja.

# 6. Ključne odluke donesene u sprintu
- Uvoz podataka implementiran je kroz dvije faze — preview (parsiranje bez upisa) i potvrda (upis validiranih redova), kako bi korisnik mogao provjeriti ispravnost podataka prije konačnog upisa.
- Neispravni redovi pri uvozu se preskače i bilježe u izvještaj o uvozu — ne blokiraju uvoz ispravnih redova.
- Budžet nakon odobravanja od strane finansijskog direktora postaje zaključan za sve izmjene na servisnom sloju, bez mogućnosti otključavanja.
- Brisanje budžeta nije dozvoljeno ni u jednoj fazi životnog ciklusa budžeta.
- Za upload fajlova koristi se `multer` s pohranom u memoriji (ne na disku) uz ograničenje veličine fajla na 10MB.

# 7. Povratna informacija Product Ownera
Product Owner je bio zadovoljan demonstriranim funkcionalnostima te je sprint ocijenjen maksimalnim brojem bodova. Sugerirane su dvije stavke za razmatranje:
- Izmjena formata datuma u `dd.mm.yyyy` format kroz cijelu aplikaciju — planirana za Sprint 8.
- Razmatranje opcije da finansijski direktor može budžet vratiti glavnom računovođi na doradu s komentarom, umjesto samo odobravanja ili odbijanja — planirana za Sprint 10.

# 8. Zaključak za naredni sprint
Za Sprint 8 planiran je nastavak implementacije funkcionalnosti:
- Pregled troškova s agregacijama 
- Pregled budžeta s prikazom iskorištenosti po kategorijama
- Detalji pojedinačnog troška i budžeta
- Pregled historije uvoza
- Generisanje i export izvještaja 
- Izmjena formata datuma u `dd.mm.yyyy` format
