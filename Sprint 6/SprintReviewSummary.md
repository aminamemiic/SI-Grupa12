## Sprint 6

# 1. Planirani sprint goal
Implementirati funkcionalnosti planirane za Sprint 6 kroz unapređenje korisničkog interfejsa, ažuriranje i brisanje troškova, pregled korisničkih rola kroz Keycloak, testiranje i deployment aplikacije.


# 2. Šta je završeno
Tim je uspješno realizirao sve planirane aktivnosti za ovaj sprint:
- Unapređenje frontenda - poboljšan je izgled UI-a i korisničko iskustvo pri radu s aplikacijom.

- Ažuriranje troškova - omogućena je izmjena postojećih troškova uz odgovarajuću validaciju i kontrolu pristupa.

- Brisanje troškova - implementirano je uklanjanje troškova, uz zaštitu zaključanih troškova i poštovanje pravila definisanih u Decision Logu.

- RBAC pregled rola - administratoru je omogućen pregled korisničkih rola kroz Keycloak integraciju.

- Testiranje i deployment - izvršeno je testiranje implementiranih funkcionalnosti i aplikacija je deployana.

- Decision Log i Sprint Backlog - dokumenti su ažurirani i korišteni za praćenje odluka i statusa zadataka.


# 3. Šta nije završeno
Sve planirane stavke za Sprint 6 su uspješno završene.


# 4. Demonstrirane funkcionalnosti ili artefakti
- Poboljšan UI aplikacije
- Ažuriranje troška
- Brisanje troška
- Validacija podataka pri ažuriranju troška
- Zaštita zaključanih troškova od izmjene i brisanja
- RBAC kontrola pristupa CRUD operacijama
- Administratorski pregled korisničkih rola kroz Keycloak
- Testiranje implementiranih funkcionalnosti
- Deployment aplikacije
- Sprint Backlog
- Decision Log


# 5. Glavni problemi i blokeri
- Najviše pažnje posvećeno je usklađivanju pravila za ažuriranje i brisanje troškova sa postojećim statusima validacije i RBAC kontrolom pristupa.

- Bilo je potrebno jasno definisati ponašanje sistema kod zaključanih troškova, kako bi se spriječile izmjene podataka koji su već dio generisanih izvještaja.

- Kod pregleda rola bilo je potrebno uskladiti nazive i način čitanja rola iz Keycloaka sa postojećom backend autorizacijom.


# 6. Ključne odluke donesene u sprintu
- Za ažuriranje troška koristi se PUT metoda s potpunom zamjenom svih obaveznih polja troška.
- Zaključani troškovi se štite provjerom statusa `ZAKLJUCAN` u servisnom sloju.
- Validacija podataka troška provodi se na backend servisnom sloju, uz dodatnu zaštitu kroz postojeća ograničenja baze podataka.
- CRUD endpointi za troškove zaštićeni su kroz `requireAuthentication` i `requireRole` middleware.
- Lista troškova i referentni podaci koriste kratkotrajni cache uz invalidaciju nakon kreiranja, ažuriranja i brisanja.
- Brisanje troška implementirano je kao trajno brisanje retka iz tabele `troskovi`, uz poštovanje pravila za povezane podatke i zaključane troškove.


# 7. Povratna informacija Product Ownera
Product Owner je imao primjedbu na malu količinu urađenih User story-ja u ovome sprintu, ali s obzirom da su dobro urađeni, sprint je ocijenjen maksimalnim brojem bodova. Za sljedeći sprint nastojati bolje rasporediti poslove, tako da tim ima značajan broj novih funkcionalnosti za demonstraciju. 

# 8. Zaključak za naredni sprint
Za Sprint 7 planiran je nastavak implementacije funkcionalnosti:
- Pregled podataka
- Uvoz podataka iz fajla
- Obrada i validacija uvezenih podataka
