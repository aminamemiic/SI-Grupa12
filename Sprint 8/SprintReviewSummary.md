# Sprint Review Summary

## Sprint 8

# 1. Planirani sprint goal
Implementirati modul za pregled podataka s naprednim pretraživanjem, filtriranjem i sortiranjem troškova, budžeta i referentnih podataka, te integrisati historiju uvoza s detaljnim uvidom u parsirane redove i greške. Razviti sveobuhvatan modul za finansijsko izvještavanje koji omogućava generisanje sažetih i detaljnih izvještaja, te njihov izvoz u XLSX, CSV i PDF formate uz napredne agregacije i vizuelne indikatore. Dodatno, unificirati prikaz datuma u `dd.mm.yyyy` formatu kroz cijeli sistem, rješavajući povratne informacije Product Ownera iz prethodnog sprinta.

# 2. Šta je završeno
Tim je uspješno realizirao sve planirane aktivnosti za ovaj sprint:

- **Data Overview modul (`/podaci/pregled`)** - Kreiran je jedinstven pregled koji prikazuje sve tabele u sistemu: troškove, budžete, kategorije, odjele, valute, projekte i dobavljače na jednom mjestu za ovlaštene korisnike.
- **Klijentsko pretraživanje, filtriranje i sortiranje** - Omogućena je pretraga u realnom vremenu i filtriranje troškova (kategorija, odjel, status, valuta, dobavljač i raspon iznosa) i budžeta (odjel, status, kategorija, raspon iznosa i datumski period) te sortiranje po svim kolonama.
- **Modalni detalji entiteta** - Implementiran je modalni prozor koji se aktivira klikom na bilo koji red u bilo kojoj tabeli, prikazujući sve atribute odabranog zapisa.
- **Historija uvoza troškova** - Razvijen je kompletan pregled historije uvoza s uvidom u tačno vrijeme uvoza, email kreatora, status i broj redova. Klikom na uvoz otvara se detaljan modal s preview-om uvezenih redova i tačnim greškama po broju reda iz fajla.
- **Finansijsko izvještavanje (`/izvjestaji`)** - Razvijen je modul za analizu troškova s brzim sažecima (ukupno, prosjek, top kategorija/odjel, najveći/najmanji trošak) i poređenjem sa planiranim budžetom (procenat iskoristivosti).
- **Izvoz izvještaja u XLSX, CSV i PDF** - Implementiran je izvoz u tri formata. XLSX izvoz generiše fajl s više listova (agregacije po kategoriji, odjelu, mjesecu, valuti, statusu, te sve troškove i top troškove), CSV izvoz daje strukturirane tekstualne podatke, dok PDF izvoz nudi laganu, čistu i čitljivu prezentaciju.
- **Unifikacija prikaza datuma** - Svi datumi na korisničkom interfejsu i unutar eksportovanih izvještaja su unificirani u evropski format `dd.mm.yyyy`, a vremena u `dd.mm.yyyy hh:mm`.
- **Integracioni testovi za izvještaje** - Napisani su i integrisani testovi u `ReportEndpoints.test.ts` za provjeru API endpoints i provjeru uloga (`glavni_racunovodja`, `finansijski_direktor`, `admin`).

# 3. Šta nije završeno
Sve planirane stavke za Sprint 8 su uspješno završene.

# 4. Demonstrirane funkcionalnosti ili artefakti
- Pregled svih podataka na Dashboardu pregleda
- Pretraga, filtriranje i sortiranje u realnom vremenu s instantnim odzivom
- Prikaz modalnih detalja za troškove, budžete, projekte, dobavljače, odjele, valute i kategorije
- Pregled historije uvoza s brojem redova i logovima nevalidnih uvoza s greškama
- Generisanje finansijskog izvještaja s brzim karticama i poređenjem iskoristivosti budžeta
- Preuzimanje višelisnog Excel (.xlsx) dokumenta koji sadrži automatski izračunate agregacije
- Preuzimanje CSV i PDF verzije finansijskih izvještaja
- Evropski formati datuma u cijeloj aplikaciji

# 5. Glavni problemi i blokeri
- **Strogi byte offset proračuni u PDF toku** - Backend PDF generator ručno kreira PDF strukturu, što je zahtijevalo precizne proračune dužine binarnih bafera kako bi se spriječilo kvarenje fajla (corruption) pri otvaranju u PDF čitačima. Problem je riješen uvođenjem tačne helper metode za brojanje bajtova u binarnom toku.
- **Problem s našim dijakritičkim znakovima u PDF-u** - Standardni Helvetica font unutar osnovnog PDF-a ne podržava slova poput č, ć, ž, š, đ, što je uzrokovalo pucanje prikaza ili greške pri otvaranju. Problem je riješen implementacijom NFD normalizacije koja uklanja kvačice (npr. č -> c, ž -> z) prije upisivanja u PDF tok, čime je očuvana kompatibilnost bez otežavanja aplikacije eksternim font datotekama.

# 6. Ključne odluke donesene u sprintu
- Generisanje XLSX izvještaja s više sheetova povjereno je backendu pomoću `xlsx` kako bi se izbjeglo blokiranje klijentskog browsera tokom kalkulacija velikog broja redova.
- Svi filteri, pretrage i sortiranja u pregledima podataka obavljaju se na frontendu nad keširanim podacima u memoriji, što daje instantni odziv korisniku bez slanja novih API poziva za svako slovo.
- Prikaz datuma je pretvoren u evropski standard `dd.mm.yyyy` samo u prezentacijskom sloju, dok se u bazi i API razmjeni i dalje koriste stabilni ISO standardi (`YYYY-MM-DD`).

# 7. Povratna informacija Product Ownera
Product Owner je ocijenio isporuku izuzetno uspješnom. Posebno su pohvaljeni:
- Dosljedna primjena evropskog formata datuma `dd.mm.yyyy` u cijelom interfejsu i eksportima, što je u potpunosti riješilo povratne informacije iz prethodnog sprinta.
- Izuzetno brz i fluidan rad pretrage i filtriranja na Data Overview stranici.
- Preglednost i profesionalan dizajn višelisnog Excel dokumenta i PDF-a koji služe kao gotovi izvještaji za upravu.
Sprint je ocijenjen maksimalnim brojem bodova.

# 8. Zaključak za naredni sprint
Za Sprint 9 planiran je početak implementacije AI modula:
- Integracija AI servisa za dubinsku analizu troškova, trendova i budžetskih odstupanja.
- Generisanje automatskih tekstualnih upozorenja na anomalije u potrošnji.
- Integracija Redis queue mehanizma za asinhronu komunikaciju s AI mikroservisom.
