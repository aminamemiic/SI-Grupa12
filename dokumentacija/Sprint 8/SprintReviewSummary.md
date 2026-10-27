# Sprint Review Summary

## Sprint 8

# 1. Planirani sprint goal
Implementirati funkcionalnosti pregleda, pretrage, filtriranja i sortiranja podataka, te generisanje, filtriranje i export izvještaja, uz primjenu jedinstvenog formata datuma `dd.mm.yyyy` kroz cijelu aplikaciju.

# 2. Šta je završeno
Tim je uspješno realizirao sve planirane aktivnosti za ovaj sprint:

- Pregled liste podataka - implementiran je tabelarni prikaz troškova i budžeta s prikazom ključnih informacija, uz odgovarajuću poruku kada nema podataka.

- Detaljan prikaz podataka - korisnik može kliknuti na pojedinačni zapis i pregledati sve relevantne detalje vezane za njega.

- Filtriranje podataka - implementirano je filtriranje po kategoriji, odjelu i vremenskom periodu, uz mogućnost resetovanja filtera i prikaz poruke kada nema rezultata.

- Pretraga podataka - implementirana je pretraga putem ključnih riječi s prikazom odgovarajuće poruke kada nema rezultata.

- Sortiranje podataka - implementirano je sortiranje po datumu, nazivu i vrijednosti u uzlaznom i silaznom redoslijedu.

- Generisanje izvještaja - finansijski direktor može generisati izvještaj o troškovima s prikazom ključnih finansijskih informacija.

- Izvještaj po periodu - implementirano je filtriranje izvještaja po vremenskom periodu uz prikaz isključivo relevantnih podataka.

- Export izvještaja - korisnik može preuzeti izvještaj u podržanim formatima.

- Sažeti izvještaj - implementiran je sažeti prikaz ključnih agregiranih informacija za brzu procjenu stanja.

- Unifikacija formata datuma - format `dd.mm.yyyy` primijenjen je kroz sve tabele, modalne detalje i filtere korištenjem jedinstvenih Helper metoda na frontendu.

- Decision Log i Sprint Backlog - dokumenti su ažurirani i korišteni za praćenje odluka i statusa zadataka.

# 3. Šta nije završeno
Sve planirane stavke za Sprint 8 su uspješno završene.

# 4. Demonstrirane funkcionalnosti ili artefakti
- Pregled liste troškova i budžeta
- Detaljan prikaz pojedinačnog zapisa
- Filtriranje podataka po kategoriji, odjelu i periodu
- Pretraga podataka putem ključnih riječi
- Sortiranje po datumu, nazivu i vrijednosti
- Generisanje izvještaja o troškovima
- Filtriranje izvještaja po vremenskom periodu
- Export izvještaja u podržanim formatima
- Sažeti prikaz ključnih informacija
- Unificiran format datuma `dd.mm.yyyy` kroz cijelu aplikaciju
- Sprint Backlog
- Decision Log

# 5. Glavni problemi i blokeri
- Sprint je uspješno proveden bez značajnih problema i blokera.

# 6. Ključne odluke donesene u sprintu
- Format datuma `dd.mm.yyyy` implementiran je kroz zajedničke Helper metode na frontendu kako bi se osigurala konzistentnost prikaza kroz cijelu aplikaciju bez dupliciranja logike.
- Export izvještaja implementiran je na backend strani s generisanjem fajla i slanjem prema klijentu, bez pohrane na serveru.
- Sažeti izvještaj prikazuje agregirane podatke koji se računaju na backend strani pri svakom zahtjevu.

# 7. Povratna informacija Product Ownera
Product Owner je napomenuo da je obim posla bio manji nego što se očekuje za jedan sprint, uz preporuku da se u narednim sprintovima planira veći broj funkcionalnosti. Predstavljene funkcionalnosti su ocijenjene kao kvalitetno implementirane te je sprint ocijenjen maksimalnim brojem bodova.

# 8. Zaključak za naredni sprint
Za Sprint 9 planiran je nastavak implementacije funkcionalnosti:
- Poređenje podataka po kategorijama i vremenskim periodima
- Poređenje planiranih i stvarnih troškova
- Automatske notifikacije pri detekciji anomalija s tekstualnim opisom
- Automatska validacija i detekcija anomalija pri unosu troška
- Dubinska AI analiza trendova na zahtjev
- Predviđanje potrošnje do kraja perioda
- AI prijedlog kategorije pri ručnom unosu troška
