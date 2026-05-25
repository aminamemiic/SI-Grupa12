# Sprint Goal

## Sprint broj
Sprint 9

---

## Sprint cilj

Implementirati napredni modul za poređenje finansijskih podataka i predviđanje/projekciju potrošnje budžeta. Korisnicima (glavnim računovođama i finansijskim direktorima) omogućiti jednostavan checkbox odabir više zapisa troškova direktno iz Data Overview tabele radi side-by-side poređenja. Razviti vizuelne komponente za poređenje po kategorijama, odjelima i vremenskim periodima, kao i naprednu analizu odstupanja budžeta i stvarnih troškova (Variance Analysis) sa grafičkim progress bar-ovima i detekcijom prekomjerne potrošnje. Na backend sloju razviti matematički algoritam linearne ekstrapolacije za predviđanje potrošnje do kraja tekućeg mjeseca na osnovu dnevne brzine trošenja.

---

## Ključne stavke koje tim želi završiti
- Razvoj checkbox funkcionalnosti u Data Overview tabeli za selekciju pojedinačnih troškova (`US-29`).
- Implementacija Angular komponente `selected-expense-comparison` za uporedni tabelarni prikaz selektovanih troškova sa vizuelnim isticanjem razlika (`US-30`).
- Implementacija Angular komponente `planned-actual-comparison` za vizuelno poređenje planiranih i stvarnih troškova (Variance Analysis) sa dinamičkim progress bar-ovima i crvenim indikatorima prekoračenja (`US-31`).
- Razvoj backend servisa u `BudgetService.getBudgetProjection` koji računa dnevnu brzinu trošenja u tekućem mjesecu, projektovanu mjesečnu potrošnju i projektovano krajnje stanje budžeta (`US-36`).
- Izrada prateće dokumentacije za Sprint 9 (Sprint Goal, Product Backlog, Sprint Backlog, Decision Log, AI Usage Log, Testing Proof, Sprint Review i Sprint Retrospective).

---

## Rizici i zavisnosti
Glavni rizik u Sprintu 9 bio je ispravno rukovanje datumskim zonama i pretečenim danima u tekućem mjesecu prilikom kalkulacije dnevne brzine trošenja, posebno prvih dana u mjesecu (izbjegavanje dijeljenja sa nulom). Također, održavanje selekcije checkbox-ova tokom navigacije, filtriranja ili paginacije u Angularu zahtijevalo je pažljivo upravljanje lokalnim stanjem komponente kako se selektovani podaci ne bi gubili. Integracija i testiranje ovih dinamičkih kalkulacija na backendu zavise od stabilnosti baze podataka i ispravnosti unesenih datuma.
