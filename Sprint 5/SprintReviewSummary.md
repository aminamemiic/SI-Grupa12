## Sprint 4

# 1. Planirani sprint goal
Izvršiti "pripremne" radnje (Docker, baza podataka), implementirati funkcionalnosti planirane za Sprint 5, testiranje, deployment, uspostavti Decision i AI Usage Log.


# 2. Šta je završeno
Tim je uspješno realizirao sve planirane aktivnosti za ovaj sprint:
- "Pripremne" radnje - postavljeni Docker i baza podataka

- Implementacija funkcionalnosti - odrađeni user storyji definisani ranije kreiranim planovima

- Testiranje i deployment

- Decision i AI Log - uspješno uspostavljeni i redovno ažurirani


# 3. Šta nije završeno
Sve planirane stavke za Sprint 5 su uspješno završene.


# 4. Demonstrirane funkcionalnosti ili artefakti
- RBAC dodjela uloga korisnicima
- RBAC ograničenje pristupa funkcijama
- Ručni unos troška
- Unos atributa troška
- Validacija unosa troška
- Sign in
- Sign out
- AI Usage Log
- Decision Log


# 5. Glavni problemi i blokeri
- Najviše dilema bilo je oko stavki i pitanja koja su obrađena i navedena u Decision Logu. Razmatrano je nekoliko drugih opcija i pristupa, ali nakon diskusuje jasno su definisani pravci i konačni izbori.


# 6. Ključne odluke donesene u sprintu
- Korištenje Keycloak autentifikacije
- Korištenje JWT tokena
- Validacija JWT tokena preko JWKS-a
- Korištenje Authorization Code + PKCE flow-a
- Način dodavanja i provjere rola korisnika: Role iz JWT tokena + RBAC provjera na backendu
- Zaštita API ruta: /api rute su zaštićene
- Automatsko izvršavanje migracija baze
- Korištenje raw SQL migracija umjesto ORM-a
- Ograničavanje CORS pristupa: Dozvoljen samo definisani FRONTEND_ORIGIN

# 7. Povratna informacija Product Ownera

# 8. Zaključak za naredni sprint
Za Sprint 6 planiran je nastavak implementacije funkcionalnosti:
- RBAC pregled korisničkih uloga
- RBAC izmjena uloga
- Kreiranje troška
- Ažuriranje troška
- Brisanje troška
- Kontrola pristupa CRUD operacijama
