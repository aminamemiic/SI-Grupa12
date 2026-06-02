## Sprint 10

> Izmjene u odnosu na Sprint 9:
> - Nove stavke su dodane za Sprint 10, uključujući AI funkcionalnosti te upravljanje budžetom kroz povrat, ispravku i historiju komentara.

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
| 21 | Evidencija komentara | Feature | Low | Done | 2 | Dodavanje i pregled komentara odgovornih osoba uz troškove. |
| 22 | Integracija OCR biblioteke | Technical Task | Medium | To do | 8 | Povezivanje OCR alata sa backend kodom. |
| 23 | Redis queue integracija | Technical Task | Medium | To do | 5 | Dodavanje Redis queue mehanizma između backend API servisa i AI mikroservisa. |
| 24 | Pretraga i filtriranje troškova | Feature | Medium | Done | 3 | Pretraga po nazivu, opisu i dobavljaču, te filtriranje po kategoriji, odjelu, projektu, statusu, valuti, dobavljaču i rasponu iznosa. |
| 25 | Sortiranje podataka | Feature | Low | Done | 2 | Sortiranje liste troškova i budžeta po svim kolonama (naziv, datum, iznos, status, odjel). |
| 26 | Odabir podataka za poređenje | Feature | High | Done | 3 | US-29: Checkbox selekcija pojedinačnih troškova iz tabele Data Overview radi dinamičkog poređenja. |
| 27 | Poređenje po kategorijama i odjelima | Feature | High | Done | 5 | Side-by-side uporedna matrica odabranih troškova po kategoriji, odjelu i periodu. |
| 28 | Poređenje planiranih i stvarnih troškova | Feature | High | Done | 5 | Variance Analysis modul sa progress barovima i iskoristivošću budžeta. |
| 29 | Predviđanje potrošnje do kraja perioda | Feature | High | Done | 8 | Backend i frontend projekcija budžeta na osnovu brzine trošenja u tekućem mjesecu. |
| 30 | Vizuelno poređenje podataka (tabela) | Feature | High | Done | 3 | Paralelni prikaz odabranih troškova jedan pored drugog radi lakšeg uočavanja razlika. |
| 31 | Grafički prikaz poređenja podataka | Feature | Medium | Done | 3 |  Grafički prikaz odabranih podataka s mogućnošću izbora tipa grafikona (bar, line, pie). |
| 32 | Identifikacija sumnjivih obrazaca potrošnje | Feature | Medium | Done | 8 | Detekcija neuobičajenih termina unosa i anomalija u ponašanju korisnika s generisanjem upozorenja. |
| 33 | Detekcija periodičnih troškova | Feature | Medium | Done | 5 |  Automatsko prepoznavanje periodičnih troškova i upozorenje kada očekivani trošak izostane. |
| 34 | Centralni interaktivni Dashboard | Feature | High | Done | 8 |  Vizuelni prikaz ključnih finansijskih metrika na jednom mjestu s grafikonima i karticama. |
| 35 | Bliži prikaz stanja  | Feature | Medium | Done | 3 |  Klik na grafikon na Dashboardu otvara listu pojedinačnih troškova koji čine prikazanu sumu. |
| 36 | Dodavanje komentara | Feature | Low | Done | 2 |  Mogućnost dodavanja tekstualnog komentara na pojedinačni trošak s bilježenjem autora i vremena. |
| 37 | Pregled komentara | Feature | Low | Done | 2 |  Hronološki prikaz komentara uz trošak s vizuelnim indikatorom u tabeli. |
| 38 | Inteligentni AI asistent za finansijska pitanja | Feature | High | Done | 13 | Chatbot  za postavljanje pitanja o troškovima, budžetima i anomalijama na prirodnom jeziku. |
| 39 | AI Executive Summary | Feature | High | Done | 5 |  Automatski generisan sažetak ključnih finansijskih informacija prikazan na Dashboardu. |
| 40 | Identifikacija dobavljača sa najvećim rastom | Feature | High | Done | 5 | Prikaz dobavljača s najvećim rastom troškova s postotkom promjene i razlikovanjem novih od postojećih. |
| 41 | AI preporuke za optimizaciju troškova | Feature | High | Done | 5 | AI preporuke s obrazloženjem za smanjenje troškova na osnovu historijskih podataka. |
| 42 | Procjena rizika zavisnosti od dobavljača | Feature | Medium | Done | 5 | Upozorenje kada jedan dobavljač učestvuje značajnim procentom ukupne potrošnje, s prikazom nivoa rizika. |
| 43 | Pregled periodičnih troškova za provjeru | Feature | High | Done | 3 |  Prikaz periodičnih troškova koji nisu evidentirani u očekivanom periodu na Dashboardu. |
| 44 | Povrat budžeta na doradu | Feature | High | Done | 3 |  Finansijski direktor vraća budžet na doradu uz obavezan komentar i notifikaciju računovođi. |
| 45 | Ispravka i ponovna dostava budžeta | Feature | High | Done | 3 |  Računovođa pregledava komentar, ispravlja budžet i ponovo ga šalje na odobravanje. |
| 46 | Pregled historije komentara budžeta | Feature | Medium | Done | 2 |  Hronološki prikaz svih komentara tokom procesa odobravanja budžeta s autorom, vremenom i tipom akcije. |
