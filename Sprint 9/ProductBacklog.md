## Sprint 9

> Izmjene u odnosu na Sprint 8:
> - Stavke 17 (AI analiza) i 19 (Generisanje upozorenja) su uspješno završene kroz razvoj AI sugestije kategorije, real-time pred-validacije forme za unos troška s instantnim ispisom upozorenja o anomalijama/odstupanjima, te cjelokupnog workflow-a rješavanja duplikata.
> - Nove stavke 26 (Odabir podataka za poređenje), 27 (Poređenje po kategorijama i odjelima), 28 (Poređenje planiranih i stvarnih troškova) i 29 (Predviđanje potrošnje do kraja perioda) su u potpunosti implementirane i označene kao "Done".
> - Sve funkcionalnosti poređenja i pametnih finansijskih projekcija su integrisane sa ulogama Keycloak autentifikacije i RBAC middleware-om.

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
| 14 | Planiranje budžeta | Feature | High | Done | 3 | Kreiranje, pregled, uređivanje, odobravanje i odbijanje budžeta. Implementirano ranije u Sprintu 7. |
| 15 | Pregled podataka | Feature | High | Done | 5 | Pregled liste troškova i osnovnih detalja zapisa za odgovorne korisnike. Završeno u Sprintu 7. |
| 16 | Uvoz podataka | Feature | Medium | Done | 13 | Uvoz troškova iz CSV, XLS i XLSX fajlova, preview, obrada, validacija, potvrda upisa i historija uvoza. Završeno u Sprintu 7. |
| 17 | AI analiza | Feature | Medium | Done | 13 | AI prijedlog optimalne kategorije pri unosu troška i klijentska real-time pred-validacija forme unosa s detekcijom anomalija (Z-score, IQR, duplikati, prekoračenja) prije spašavanja. |
| 18 | Poređenje podataka | Feature | Medium | Done | 5 | Ručno poređenje podataka po kategorijama i poređenje stvarnih troškova u odnosu na planirane budžete kroz modul izvještaja s prikazom iskoristivosti budžeta. Prošireno u Sprintu 9. |
| 19 | Generisanje upozorenja | Feature | Medium | Done | 3 | Generisanje real-time upozorenja o odstupanjima na formi, slanje notifikacija o duplikatima i interaktivno rješavanje/odlučivanje o potencijalno duplim troškovima. |
| 20 | Izvještaj | Feature | Medium | Done | 3 | Generisanje i export sažetih i detaljnih izvještaja o troškovima u XLSX, CSV i PDF formatima. |
| 21 | Evidencija komentara | Feature | Low | To do | 2 | Dodavanje i pregled komentara odgovornih osoba uz troškove. |
| 22 | Integracija OCR biblioteke | Technical Task | Medium | To do | 8 | Povezivanje OCR alata sa backend kodom. |
| 23 | Redis queue integracija | Technical Task | Medium | To do | 5 | Dodavanje Redis queue mehanizma između backend API servisa i AI mikroservisa. |
| 24 | Pretraga i filtriranje troškova | Feature | Medium | Done | 3 | Pretraga po nazivu, opisu i dobavljaču, te filtriranje po kategoriji, odjelu, projektu, statusu, valuti, dobavljaču i rasponu iznosa. |
| 25 | Sortiranje podataka | Feature | Low | Done | 2 | Sortiranje liste troškova i budžeta po svim kolonama (naziv, datum, iznos, status, odjel). |
| 26 | Odabir podataka za poređenje | Feature | High | Done | 3 | US-29: Checkbox selekcija pojedinačnih troškova iz tabele Data Overview radi dinamičkog poređenja. |
| 27 | Poređenje po kategorijama i odjelima | Feature | High | Done | 5 | US-30: Side-by-side uporedna matrica odabranih troškova po kategoriji, odjelu i periodu. |
| 28 | Poređenje planiranih i stvarnih troškova | Feature | High | Done | 5 | US-31: Variance Analysis modul sa progress barovima i iskoristivošću budžeta. |
| 29 | Predviđanje potrošnje do kraja perioda | Feature | High | Done | 8 | US-36: Backend i frontend projekcija budžeta na osnovu brzine trošenja u tekućem mjesecu. |
