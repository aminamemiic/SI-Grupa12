# Sprint Goal

## Sprint broj
Sprint 9

---

## Sprint cilj

Implementirati cjelokupan napredni modul za poređenje finansijskih podataka, predviđanje/projekciju potrošnje budžeta te pametne AI mehanizme za kontrolu i validaciju troškova. Korisnicima omogućiti checkbox selekciju troškova iz Data Overview tabele za tabelarni side-by-side prikaz razlika po kategorijama i odjelima. Na backendu razviti formulu linearne projekcije budžeta na osnovu brzine trošenja tekućeg mjeseca. Dodatno, integrisati AI modul za automatsko predlaganje kategorija na osnovu naziva troška, uvesti klijentsku real-time pred-validaciju forme za unos (koja u pozadini prepoznaje anomalije, duplikate i prekoracenja budžeta prije spašavanja), te zatvoriti kompletan radni tok odlučivanja i rješavanja potencijalnih duplih troškova direktno kroz interfejs notifikacija.

---

## Ključne stavke koje tim želi završiti
- Razvoj checkbox funkcionalnosti u Data Overview tabeli za selekciju pojedinačnih troškova
- Implementacija Angular komponente `selected-expense-comparison` za uporedni side-by-side tabelarni prikaz selektovanih troškova s isticanjem razlika
- Implementacija Angular komponente `planned-actual-comparison` za vizuelno poređenje planiranih i stvarnih troškova (Variance Analysis) sa dinamičkim progress bar-ovima i crvenim indikatorima prekoračenja
- Razvoj backend servisa u `BudgetService.getBudgetProjection` i endpointa `/api/budzeti/:id/projekcija` koji računa dnevnu brzinu trošenja, projektovanu mjesečnu potrošnju i projektovano krajnje stanje budžeta
- Integracija AI sugestije kategorije na frontendu i backendu (`/api/troskovi/category-suggestion`) na osnovu unesenog naziva i opisa troška
- Implementacija klijentske real-time pred-validacije na formi troškova (`/api/troskovi/validate`) koja na osnovu unosa (sa 500ms debounce) poziva AI analizu i prikazuje upozorenja o anomalijama (Z-score, IQR, duplikati, prekoračenja) prije spašavanja
- Razvoj radnog toka za rješavanje potencijalno duplih troškova na frontendu i backendu (endpoints za odobravanje/spašavanje i brisanje iz modula notifikacija)
- Izrada prateće dokumentacije za Sprint 9 (Sprint Goal, Product Backlog, Sprint Backlog, Decision Log, AI Usage Log, Testing Proof i Sprint Retrospective).

---

## Rizici i zavisnosti
- **Rizik opterećenja servera**: Real-time validacija forme troškova pri svakoj izmjeni može uzrokovati prevelik broj API zahtjeva ako se debounce mehanizam (postavljen na 500ms) ne ponaša ispravno.
- **Upravljanje stanjem**: Selekcija checkbox-ova se mora održati stabilnom tokom filtriranja, pretrage i navigacije na Data Overview tabelama bez gubljenja označenih stavki.

