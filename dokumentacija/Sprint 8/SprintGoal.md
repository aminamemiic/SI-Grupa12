# Sprint Goal

## Sprint broj
Sprint 8

---

## Sprint cilj

Implementirati modul za pregled podataka s naprednim pretraživanjem, filtriranjem i sortiranjem troškova, budžeta i referentnih podataka te integrisati historiju uvoza s detaljnim uvidom u parsirane redove i greške. Razviti sveobuhvatan modul za finansijsko izvještavanje koji omogućava generisanje sažetih i detaljnih izvještaja te njihov izvoz u XLSX, CSV i PDF formate. Dodatno, unificirati prikaz datuma u `dd.mm.yyyy` formatu kroz cijeli sistem, rješavajući povratne informacije Product Ownera iz prethodnog sprinta.

---

## Ključne stavke koje tim želi završiti
- Implementacija Data Overview modula (`/podaci/pregled`) s tabelarnim prikazom troškova, budžeta, kategorija, odjela, valuta, projekata i dobavljača.
- Razvoj detaljnih modalnih prozora za sve entitete radi uvida u pojedinačne zapise.
- Napredna pretraga i filtriranje troškova (po kategoriji, odjelu, statusu, valuti, dobavljaču i rasponu iznosa) te budžeta (po odjelu, statusu, kategoriji, datumskom i iznosovnom opsegu).
- Sortiranje svih kolona tabele troškova i budžeta (rastuće i opadajuće).
- Integracija historije uvoza sa detaljnim pregledom uvezenih fajlova, broja redova (ukupno, validni, nevalidni, upisani) i historijskim logom grešaka za svaki uvoz.
- Implementacija Report modula (`/izvjestaji`) s vizuelnim sažecima (ukupni troškovi, prosječan trošak, iskoristivost budžeta, top kategorija/odjel, najveći/najmanji trošak).
- Razvoj izvoza izvještaja (sazeti i detaljni) u XLSX format (s više tabova za agregacije), CSV format i PDF format.
- Unifikacija formata prikaza datuma u cijeloj aplikaciji (frontend i backend izvještaji) u evropski `dd.mm.yyyy` format.
- Ažuriranje prateće projektne dokumentacije za Sprint 8 (Product Backlog, Sprint Backlog, Decision Log, AI Usage Log, Testing Proof, Sprint Review i Sprint Retrospective).

---

## Rizici i zavisnosti
Glavni rizik u Sprintu 8 bio je složenost generisanja XLSX dokumenata s više listova (agregacija) na backendu pomoću `xlsx` biblioteke, kao i generisanje ispravnog binarnog PDF toka bez ovisnosti o teškim eksternim PDF generatorima. Također, unifikacija formata datuma kroz sve postojeće front-end komponente (troskovi, import, budzeti) zahtijeva pažljivo testiranje kako se ne bi narušile baze podataka koje očekuju ISO standard. Sistem ovisi o stabilnosti baze podataka, Keycloak RBAC konfiguracijama i prethodno implementiranim uslugama troškova i budžeta.
