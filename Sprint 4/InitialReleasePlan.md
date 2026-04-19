# Pregled release plana

Ovaj dokument definira inicijalni plan isporuke sistema za upravljanje finansijama i troškovima. Plan je organiziran u 6 inkremenata koji pokrivaju sprintove od 5 do 10. 

## Pregled inkremenata

| Inkrement | Naziv | Sprintovi | Ključni cilj |
|-----------|-------|-----------|--------------|
| **I1** | Autentifikacija, osnova sistema i RBAC | Sprint 5 | Sigurna prijava, osnova sistema i RBAC |
| **I2** | Osnovno upravljanje troškovima | Sprint 5–6 | CRUD operacije nad troškovima |
| **I3** | Pregled i uvoz podataka | Sprint 6–7 | Pregled liste, detalji i uvoz fajlova |
| **I4** | Analiza i izvještavanje | Sprint 8 | Filtriranje, izvještaji i planiranje budžeta |
| **I5** | Poređenje i AI analiza | Sprint 9 | Poređenje podataka i AI uvidi |
| **I6** | Vizualizacija i dashboard | Sprint 10 | Dashboard, grafički prikazi i upozorenja |

---

# Detalji po inkrementima

## Inkrement 1: Autentifikacija, osnova sistema i RBAC

| | |
|---|---|
| **Naziv inkrementa** | Inkrement 1 – Autentifikacija, osnova sistema i RBAC |
| **Cilj inkrementa** | Uspostaviti sigurnu osnovu sistema kroz mehanizme prijave i odjave korisnika te implementirati sistem upravljanja korisnicima baziran na ulogama (RBAC), kao preduvjet za sve ostale funkcionalnosti. |
| **Okvirni sprintovi** | Sprint 5 |

### Glavne funkcionalnosti

- Prijava korisnika (Sign In) – unos korisničkog imena i lozinke (US #6)
- Odjava korisnika (Sign Out) – sigurno zatvaranje sesije (US #7)
- Osnovna infrastruktura za upravljanje sesijama
- Zaštita svih ruta/ekrana koji zahtijevaju autentifikaciju
- Dodjela uloga korisnicima (US #1)
- Ograničenje pristupa funkcijama prema ulozi (US #2)
- Pregled korisničkih uloga (US #8)
- Izmjena uloga korisnika (US #9)

### Zavisnosti

- Nema eksternih zavisnosti – ovo je polazišna tačka cijelog sistema
- Potrebna je definirana baza korisnika (makar testni korisnici) za validaciju prijave
- Definisane korisničke uloge moraju biti dogovorene prije implementacije RBAC matrice

### Glavni rizici

- Rizik sigurnosnih propusta u autentifikaciji – mitigacija kroz standardne biblioteke i hashing lozinki
- Nejasne sesijske politike (trajanje sesije, timeout) mogu uzrokovati UX probleme
- Kasno definiranje korisničkih podataka može blokirati razvoj
- Složenost RBAC matrice može uzrokovati kašnjenje – preporučuje se rano definiranje svih uloga
- Nekonzistentnost između uloga i dostupnih funkcija može stvoriti sigurnosne rupe

---

## Inkrement 2: Osnovno upravljanje troškovima

| | |
|---|---|
| **Naziv inkrementa** | Inkrement 2 – Osnovno upravljanje troškovima |
| **Cilj inkrementa** | Omogućiti osnovne operacije unosa i upravljanja troškovima, uključujući ručni unos, validaciju i CRUD operacije nad troškovima. |
| **Okvirni sprintovi** | Sprint 5–6 |

### Glavne funkcionalnosti

- Ručni unos troška putem forme (US #3)
- Unos atributa troška – kategorija, projekat, odjel (US #4)
- Validacija unosa troška (US #5)
- Kreiranje, ažuriranje i brisanje troška – CRUD (US #10, #11, #12)

### Zavisnosti

- Zavisi od Inkrementa 1 (funkcionalna prijava, sesija korisnika i implementiran RBAC)
- Kategorije, projekti i odjeli moraju biti prethodno definisani u sistemu
- Validaciona pravila moraju biti dogovorena s poslovnim analitičarima

### Glavni rizici

- Loša UX forme za unos troška može usporiti adopciju sistema
- Nedefinisane kategorije/odjeli blokiraju unos atributa troška

---

## Inkrement 3: Pregled podataka i uvoz

| | |
|---|---|
| **Naziv inkrementa** | Inkrement 3 – Pregled podataka i uvoz |
| **Cilj inkrementa** | Omogućiti korisnicima pregled liste troškova, detaljni uvid u pojedinačne zapise te uvoz podataka iz eksternih fajlova. |
| **Okvirni sprintovi** | Sprint 6–7 |

### Glavne funkcionalnosti

- Pregled liste podataka / troškova (US #14)
- Detaljan prikaz pojedinačnog zapisa (US #15)
- Uvoz podataka iz CSV ili Excel fajla (US #16)
- Automatska obrada uvezenih podataka (US #17)
- Validacija uvezenih podataka prije spremanja (US #18)

### Zavisnosti

- Zavisi od Inkrementa 2 (postoje troškovi u sistemu koje je moguće prikazati)
- Potrebna je definisana struktura CSV/Excel šablona za uvoz
- RBAC mora biti implementiran da se pregled ograniči prema ulozi

### Glavni rizici

- Različiti formati ulaznih fajlova mogu uzrokovati greške pri parsiranju – potrebno testirati više varijanti
- Veliki fajlovi pri uvozu mogu ugroziti performanse sistema
- Loša validacija uvezenih podataka može kontaminirati bazu netačnim podacima
- Korisnici možda nisu upoznati s formatom fajla – potrebna je jasna dokumentacija/šablon

---
