# Sprint Goal

## Sprint broj
Sprint 7

---

## Sprint cilj

Implementirati funkcionalnosti planirane za Sprint 7 kroz pregled podataka o troškovima, uvoz troškova iz CSV/Excel fajlova, automatsku obradu i validaciju uvezenih redova, te testiranje implementiranih tokova. Zbog ranije završenog planiranog obima, tim je u Sprintu 7 dodatno preuzeo dio funkcionalnosti planiranja budžeta koje su prvobitno bile planirane za Sprint 8.

---

## Ključne stavke koje tim želi završiti
- Pregled liste troškova i osnovnih detalja zapisa
- Uvoz podataka iz CSV, XLS i XLSX fajlova
- Preview uvezenih podataka prije spremanja
- Automatsko mapiranje kategorija, odjela, valuta, projekata i dobavljača
- Validacija uvezenih podataka i označavanje nevalidnih redova
- Potvrda uvoza samo odabranih validnih redova
- Evidencija historije uvoza
- Testiranje ingestion servisa i endpointa
- Dodatno: kreiranje, pregled, uređivanje, odobravanje i odbijanje budžeta, iako su ovi storyji bili planirani za Sprint 8
- Ažuriranje Sprint Backloga, Product Backloga, Decision Loga, AI Usage Loga i Testing Proof dokumenta

---

## Rizici i zavisnosti
Glavni rizik u Sprintu 7 je kvalitet podataka koji dolaze iz vanjskih CSV/Excel fajlova. Potrebno je osigurati da sistem ne upiše nevalidne redove, da jasno prikaže greške korisniku i da se podaci pravilno mapiraju na postojeće referentne podatke u bazi. Sprint zavisi od već implementiranog unosa troškova, referentnih podataka, RBAC pravila i stabilne baze podataka. Dodatni rizik je preuzimanje budget funkcionalnosti iz Sprinta 8, jer taj dio širi obim Sprinta 7 i zahtijeva posebnu napomenu u dokumentaciji.
