## Sprint 7

> Izmjene u odnosu na Sprint 6:
> - Stavke 15 i 16 su završene kroz pregled podataka i uvoz podataka.
> - Stavka 14 je prebačena iz "In process" u "Done" jer je planiranje budžeta implementirano ranije.
> - Storyji za planiranje budžeta koji su u Sprintu 2 bili planirani za Sprint 8 realizovani su već u Sprintu 7 i posebno su označeni kao ranije preuzeti obim.
> - Stavke pretrage, filtriranja, sortiranja i izvještaja ostaju za naredne sprinteve.

| ID | Naziv stavke | Tip | Prioritet | Status | Procjena složenosti | Opis |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | Isplanirati izgled baze podataka | Technical Task | - | Done | - | Isplanirati organizaciju baze podataka koja čuva informacije o budžetima, stvarnim računima i troškovima, korisnicima, kategorijama, odjelima, projektima i vremenskim periodima. |
| 2 | Istraživanje o AI dijelu | Research | - | Done | - | Provesti istraživanje koncepta AI sistema za analizu troškova, trendova, budžetskih odstupanja i anomalija. |
| 3 | GDPR & Security | Technical Task | - | Done | - | Osigurati zaštitu osjetljivih finansijskih podataka. |
| 4 | Unos troškova | Feature | - | Done | - | Sistem za ručni unos stvarnih pristiglih troškova. |
| 5 | Sign in | Technical Task | - | Done | - | Sistem za autentifikaciju korisnika. |
| 6 | Sign out | Technical Task | - | Done | - | Funkcionalnost odjave iz sistema. |
| 7 | Upravljanje korisnicima (RBAC) | Feature | - | Done | - | Sistem koji reguliše različite nivoe pristupa kroz role korisnika. |
| 8 | Postavljanje razvojnog okruženja | Technical Task | - | Done | - | Konfiguracija Docker-a, baze podataka i backend frameworka. |
| 9 | Definisanje API ugovora | Technical Task | - | Done | - | Dokumentacija ruta između frontenda i backenda. |
| 10 | Razvoj osnovnog UI Dashboarda | Feature | - | Done | - | Kreiranje osnovnog korisničkog interfejsa za pregled sistema. |
| 11 | Implementacija CRUD za troškove | Feature | - | Done | - | Osnovne operacije nad tabelom troškova u bazi. |
| 12 | Keycloak integracija | Technical Task | High | Done | - | Integracija Keycloak identity providera za autentifikaciju i upravljanje korisničkim identitetima. |
| 13 | Docker Compose - produkcijska konfiguracija | Technical Task | - | Done | - | Konfiguracija produkcijskog okruženja. |
| 14 | Planiranje budžeta | Feature | High | Done | 3 | Kreiranje, pregled, uređivanje, odobravanje i odbijanje budžeta. Napomena: storyji ID 26, 27, 28 i odobravanje budžeta bili su planirani za Sprint 8, ali su implementirani ranije u Sprintu 7. |
| 15 | Pregled podataka | Feature | High | Done | 5 | Pregled liste troškova i osnovnih detalja zapisa za odgovorne korisnike. Pokriva Sprint 2 user storyje ID 14 i ID 15. |
| 16 | Uvoz podataka | Feature | Medium | Done | 13 | Uvoz troškova iz CSV, XLS i XLSX fajlova, preview, obrada, validacija, potvrda upisa i historija uvoza. Pokriva Sprint 2 user storyje ID 16, ID 17 i ID 18. |
| 17 | AI analiza | Feature | Medium | To do | 13 | AI analiza troškova, trendova, budžetskih odstupanja i neuobičajenih obrazaca potrošnje. |
| 18 | Poređenje podataka | Feature | Medium | To do | 5 | Ručno poređenje podataka po kategorijama i poređenje stvarnih troškova u odnosu na planirane budžete. |
| 19 | Generisanje upozorenja | Feature | Medium | To do | 3 | Generisanje upozorenja i sažetaka na osnovu analize i uočenih anomalija. |
| 20 | Izvještaj | Feature | Medium | To do | 3 | Generisanje i export izvještaja o troškovima. |
| 21 | Evidencija komentara | Feature | Low | To do | 2 | Dodavanje i pregled komentara odgovornih osoba uz troškove. |
| 22 | Integracija OCR biblioteke | Technical Task | Medium | To do | 8 | Povezivanje OCR alata sa backend kodom. |
| 23 | Redis queue integracija | Technical Task | Medium | To do | 5 | Dodavanje Redis queue mehanizma između backend API servisa i AI mikroservisa. |
| 24 | Pretraga i filtriranje troškova | Feature | Medium | To do | 3 | Pretraga po nazivu, opisu i dobavljaču, te filtriranje po kategoriji, odjelu, projektu i periodu. |
| 25 | Sortiranje podataka | Feature | Low | To do | 2 | Sortiranje liste troškova po datumu, nazivu, iznosu i statusu.  |
