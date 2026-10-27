## Sprint 8

> Izmjene u odnosu na Sprint 7:
> - Stavke 18 (Poređenje podataka), 20 (Izvještaj), 24 (Pretraga i filtriranje troškova) i 25 (Sortiranje podataka) su prebačene iz "To do" u "Done" jer su uspješno implementirane kroz Data Overview i Reports module.
> - Integrisana je historija uvoza troškova sa detaljnim uvidom u parsirane redove i greške kao sastavni dio pregleda podataka.
> - Sve datumske vrijednosti u sistemu su unificirane na evropski format `dd.mm.yyyy` prema zahtjevu Product Ownera.
> - Preostale tehničke i AI stavke (AI analiza, OCR integracija, Redis queue, komentari) ostaju za naredne sprinteve.

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
| 17 | AI analiza | Feature | Medium | To do | 13 | AI analiza troškova, trendova, budžetskih odstupanja i neuobičajenih obrazaca potrošnje. |
| 18 | Poređenje podataka | Feature | Medium | Done | 5 | Ručno poređenje podataka po kategorijama i poređenje stvarnih troškova u odnosu na planirane budžete kroz modul izvještaja s prikazom iskoristivosti budžeta. |
| 19 | Generisanje upozorenja | Feature | Medium | To do | 3 | Generisanje upozorenja i sažetaka na osnovu analize i uočenih anomalija. |
| 20 | Izvještaj | Feature | Medium | Done | 3 | Generisanje i export sažetih i detaljnih izvještaja o troškovima u XLSX, CSV i PDF formatima. |
| 21 | Evidencija komentara | Feature | Low | To do | 2 | Dodavanje i pregled komentara odgovornih osoba uz troškove. |
| 22 | Integracija OCR biblioteke | Technical Task | Medium | To do | 8 | Povezivanje OCR alata sa backend kodom. |
| 23 | Redis queue integracija | Technical Task | Medium | To do | 5 | Dodavanje Redis queue mehanizma između backend API servisa i AI mikroservisa. |
| 24 | Pretraga i filtriranje troškova | Feature | Medium | Done | 3 | Pretraga po nazivu, opisu i dobavljaču, te filtriranje po kategoriji, odjelu, projektu, statusu, valuti, dobavljaču i rasponu iznosa. |
| 25 | Sortiranje podataka | Feature | Low | Done | 2 | Sortiranje liste troškova i budžeta po svim kolonama (naziv, datum, iznos, status, odjel). |
