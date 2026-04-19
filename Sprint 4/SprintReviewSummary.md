## Sprint 4

# 1. Planirani sprint goal
Definisanje kriterija završetka (DoD), plana isporuke, tehničke konfiguracije i postavljanje inicijalne strukture koda na repozitorij.

# 2. Šta je završeno
Tim je uspješno izradio sve planirane deliverable-e za ovaj sprint:
- Definition of Done – Uspostavljen standard kvaliteta koji uključuje kod, testove, dokumentaciju i sigurnosne provjere.

- Initial Release Plan – Kreirana mapa puta sa 6 inkremenata, od autentifikacije do finalnog dashboarda.

- Technical Setup & Branching – Dokumentovan stack (Angular, Node.js, Python/FastAPI, PostgreSQL) i GitHub Flow pravila.

- Scaffolding projekta – Na GitHub su push-ani inicijalni projekti; postavljen je frontend i backend kostur koji omogućava paralelan rad članova tima.


# 3. Šta nije završeno
Sve planirane stavke za Sprint 4 su uspješno završene.


# 4. Demonstrirane funkcionalnosti ili artefakti
- GitHub Repozitorij: Demonstracija strukture koda i potvrda da je scaffolding uspješno postavljen.

- Release Plan: Prezentacija hronološkog slijeda razvoja funkcionalnosti.

- DoD kontrolna lista: Prikaz kriterija koji će se koristiti za validaciju svakog budućeg zadatka.

# 5. Glavni problemi i blokeri
- Izbor branching strategije: Razmatrane su kompleksnije strategije poput GitFlow-a, ali je odlučeno za GitHub Flow zbog agilnosti i brzine isporuke.

# 6. Ključne odluke donesene u sprintu
U skladu sa tehničkom specifikacijom, donesene su sljedeće odluke o tehnološkom stacku:
- Frontend: Odabran Angular 21 uz TypeScript i Angular Material za UI komponente.
- Backend: Primarni API server će biti Node.js 20 koristeći Express framework.
- AI Servis: Za potrebe vještačke inteligencije koristiće se Python 3.12 sa FastAPI frameworkom.
- Baza podataka: Odabran PostgreSQL zbog podrške za kompleksne upite i JSON kolone, uz Sequelize ORM.
- Infrastruktura: Uvodi se Docker i Docker Compose za kontejnerizaciju svih servisa (Nginx, API, AI, DB, Redis).
- CI/CD: Odabran GitHub Actions za automatizaciju testova i deploymenta na Ubuntu VPS server.


# 7. Povratna informacija Product Ownera

# 8. Zaključak za naredni sprint
Završetkom četvrtog sprinta tim prelazi u fazu implementacije. Za Sprint 5 (Inkrement 1) planirano je:
- Implementacija autentifikacije i autorizacije.
- Postavljanje baze podataka i povezivanje sa backendom.
- Kreiranje prvih CRUD operacija za troškove.
