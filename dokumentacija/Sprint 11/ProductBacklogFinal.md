# Finalni Product Backlog Status

Ovaj dokument prikazuje stvarno stanje projekta na osnovu implementiranog koda i dostupnih funkcionalnosti. Statusi nisu željeno stanje, nego završno stanje nakon Sprinta 11.

> Legenda statusa:
> - `Done` - stavka je potpuno implementirana i funkcionalna
> - `Partially Done` - stavka je djelimično implementirana
> - `Not Done` - stavka nije implementirana
> - `Deferred / ostavljeno za budući rad` - stavka je svjesno odložena za kasniji razvoj

| ID | Naziv stavke | Tip | Prioritet | Status | Razlog za nezavršeno / djelimično | Procjena složenosti | Opis |
|:---|:---|:---|:---|:---|:---|:---|:---|
| 1 | Isplanirati izgled baze podataka | Technical Task | - | Done | - | - | Isplanirati organizaciju baze podataka koja čuva informacije o budžetima, stvarnim računima i troškovima, korisnicima, kategorijama, odjelima, projektima i vremenskim periodima. |
| 2 | Istraživanje o AI dijelu | Research | - | Done | - | - | Provesti istraživanje koncepta AI sistema za analizu troškova, trendova, budžetskih odstupanja i anomalija. |
| 3 | GDPR & Security | Technical Task | - | Done | - | - | Osigurati zaštitu osjetljivih finansijskih podataka. |
| 4 | Unos troškova | Feature | - | Done | - | - | Sistem za ručni unos stvarnih pristiglih troškova. |
| 5 | Sign in | Technical Task | - | Done | - | - | Sistem za autentifikaciju korisnika. |
| 6 | Sign out | Technical Task | - | Done | - | - | Funkcionalnost odjave iz sistema. |
| 7 | Upravljanje korisnicima (RBAC) | Feature | - | Done | - | - | Sistem koji reguliše različite nivoe pristupa kroz role korisnika. |
| 8 | Postavljanje razvojnog okruženja | Technical Task | - | Done | - | - | Konfiguracija Docker-a, baze podataka i backend frameworka. |
| 9 | Definisanje API ugovora | Technical Task | - | Done | - | - | Dokumentacija ruta između frontenda i backenda. |
| 10 | Razvoj osnovnog UI Dashboarda | Feature | - | Done | - | - | Kreiranje osnovnog korisničkog interfejsa za pregled sistema. |
| 11 | Implementacija CRUD za troškove | Feature | - | Done | - | - | Osnovne operacije nad tabelom troškova u bazi. |
| 12 | Keycloak integracija | Technical Task | - | Done | - | - | Integracija Keycloak identity providera za autentifikaciju i upravljanje korisničkim identitetima. |
| 13 | Docker Compose - produkcijska konfiguracija | Technical Task | - | Done | - | - | Konfiguracija produkcijskog okruženja. |
| 14 | Planiranje budžeta | Feature | - | Done | - | - | Kreiranje, pregled, uređivanje, odobravanje i odbijanje budžeta. Implementirano ranije u Sprintu 7. |
| 15 | Pregled podataka | Feature | - | Done | - | - | Pregled liste troškova i osnovnih detalja zapisa za odgovorne korisnike. Završeno u Sprintu 7. |
| 16 | Uvoz podataka | Feature | - | Done | - | - | Uvoz troškova iz CSV, XLS i XLSX fajlova, preview, obrada, validacija, potvrda upisa i historija uvoza. Završeno u Sprintu 7. |
| 17 | AI analiza | Feature | - | Done | - | - | AI prijedlog optimalne kategorije pri unosu troška i klijentska real-time pred-validacija forme unosa s detekcijom anomalija (Z-score, IQR, duplikati, prekoračenja) prije spašavanja. |
| 18 | Poređenje podataka | Feature | - | Done | - | - | Ručno poređenje podataka po kategorijama i poređenje stvarnih troškova u odnosu na planirane budžete kroz modul izvještaja s prikazom iskoristivosti budžeta. Prošireno u Sprintu 9. |
| 19 | Generisanje upozorenja | Feature | - | Done | - | - | Generisanje real-time upozorenja o odstupanjima na formi, slanje notifikacija o duplikatima i interaktivno rješavanje/odlučivanje o potencijalno duplim troškovima. |
| 20 | Izvještaj | Feature | - | Done | - | - | Generisanje i export sažetih i detaljnih izvještaja o troškovima u XLSX, CSV i PDF formatima. |
| 21 | Evidencija komentara | Feature | - | Done | - | - | Dodavanje i pregled komentara odgovornih osoba uz troškove. |
| 22 | Integracija OCR biblioteke | Technical Task | Medium | Deferred / ostavljeno za budući rad | Nema implementacije OCR biblioteke u kodu ni povezivanja sa postojećim tokovima. Stavka je odložena za naredni razvojni ciklus. | 8 | Povezivanje OCR alata sa backend kodom. |
| 23 | Redis queue integracija | Technical Task | Medium | Deferred / ostavljeno za budući rad | Nema implementacije Redis queue mehanizma između backend servisa i AI mikroservisa. Stavka je planirana, ali nije završena u ovom izdanju. | 5 | Dodavanje Redis queue mehanizma između backend API servisa i AI mikroservisa. |
| 24 | Pretraga i filtriranje troškova | Feature | - | Done | - | - | Pretraga po nazivu, opisu i dobavljaču, te filtriranje po kategoriji, odjelu, projektu, statusu, valuti, dobavljaču i rasponu iznosa. |
| 25 | Sortiranje podataka | Feature | - | Done | - | - | Sortiranje liste troškova i budžeta po svim kolonama (naziv, datum, iznos, status, odjel). |
| 26 | Odabir podataka za poređenje | Feature | - | Done | - | - | US-29: Checkbox selekcija pojedinačnih troškova iz tabele Data Overview radi dinamičkog poređenja. |
| 27 | Poređenje po kategorijama i odjelima | Feature | - | Done | - | - | Side-by-side uporedna matrica odabranih troškova po kategoriji, odjelu i periodu. |
| 28 | Poređenje planiranih i stvarnih troškova | Feature | - | Done | - | - | Variance Analysis modul sa progress barovima i iskoristivošću budžeta. |
| 29 | Predviđanje potrošnje do kraja perioda | Feature | - | Done | - | - | Backend i frontend projekcija budžeta na osnovu brzine trošenja u tekućem mjesecu. |
| 30 | Vizuelno poređenje podataka (tabela) | Feature | - | Done | - | - | Paralelni prikaz odabranih troškova jedan pored drugog radi lakšeg uočavanja razlika. |
| 31 | Grafički prikaz poređenja podataka | Feature | - | Done | - | - | Grafički prikaz odabranih podataka s mogućnošću izbora tipa grafikona (bar, line, pie). |
| 32 | Identifikacija sumnjivih obrazaca potrošnje | Feature | - | Done | - | - | Detekcija neuobičajenih termina unosa i anomalija u ponašanju korisnika s generisanjem upozorenja. |
| 33 | Detekcija periodičnih troškova | Feature | - | Done | - | - | Automatsko prepoznavanje periodičnih troškova i upozorenje kada očekivani trošak izostane. |
| 34 | Centralni interaktivni Dashboard | Feature | - | Done | - | - | Vizuelni prikaz ključnih finansijskih metrika na jednom mjestu s grafikonima i karticama. |
| 35 | Bliži prikaz stanja | Feature | - | Done | - | - | Klik na grafikon na Dashboardu otvara listu pojedinačnih troškova koji čine prikazanu sumu. |
| 36 | Dodavanje komentara | Feature | - | Done | - | - | Mogućnost dodavanja tekstualnog komentara na pojedinačni trošak s bilježenjem autora i vremena. |
| 37 | Pregled komentara | Feature | - | Done | - | - | Hronološki prikaz komentara uz trošak s vizuelnim indikatorom u tabeli. |
| 38 | Inteligentni AI asistent za finansijska pitanja | Feature | - | Done | - | - | Chatbot za postavljanje pitanja o troškovima, budžetima i anomalijama na prirodnom jeziku. |
| 39 | AI Executive Summary | Feature | - | Done | - | - | Automatski generisan sažetak ključnih finansijskih informacija prikazan na Dashboardu. |
| 40 | Identifikacija dobavljača sa najvećim rastom | Feature | - | Done | - | - | Prikaz dobavljača s najvećim rastom troškova s postotkom promjene i razlikovanjem novih od postojećih. |
| 41 | AI preporuke za optimizaciju troškova | Feature | - | Done | - | - | AI preporuke s obrazloženjem za smanjenje troškova na osnovu historijskih podataka. |
| 42 | Procjena rizika zavisnosti od dobavljača | Feature | - | Done | - | - | Upozorenje kada jedan dobavljač učestvuje značajnim procentom ukupne potrošnje, s prikazom nivoa rizika. |
| 43 | Pregled periodičnih troškova za provjeru | Feature | - | Done | - | - | Prikaz periodičnih troškova koji nisu evidentirani u očekivanom periodu na Dashboardu. |
| 44 | Povrat budžeta na doradu | Feature | - | Done | - | - | Finansijski direktor vraća budžet na doradu uz obavezan komentar i notifikaciju računovođi. |
| 45 | Ispravka i ponovna dostava budžeta | Feature | - | Done | - | - | Računovođa pregledava komentar, ispravlja budžet i ponovo ga šalje na odobravanje. |
| 46 | Pregled historije komentara budžeta | Feature | - | Done | - | - | Hronološki prikaz svih komentara tokom procesa odobravanja budžeta s autorom, vremenom i tipom akcije. |

## Sažetak završnog stanja

- Ukupan broj stavki: `46`
- Završeno: `44`
- Odloženo za budući rad: `2`
- Djelimično završeno: `0`
- Nezavršeno bez plana: `0`

**Zaključak:** funkcionalni dio projekta je u potpunosti završen za sve stavke koje su implementirane u ovom izdanju, dok su OCR i Redis queue integracija ostavljeni kao budući rad.
- **Integracija OCR biblioteke** - OCR funkcionalnost nije implementirana jer se u toku razvoja pokazalo da korisnici uvoz podataka pretežno vrše kroz strukturirane CSV i Excel fajlove, što u potpunosti pokriva potrebe sistema. Uvoz skeniranih dokumenata i računa nije bio eksplicitno zahtijevan ni od strane Product Ownera tokom sprint reviewova, te je stavka odgođena u korist prioritetnijih funkcionalnosti kao što su AI analiza, poređenje podataka i notifikacijski sistem.
- **Redis queue integracija** - Redis queue nije implementiran jer se tokom razvoja AI mikroservisa pokazalo da FastAPI-jev ugrađeni mehanizam BackgroundTasks u potpunosti zadovoljava potrebe sistema za asinhronu obradu AI zadataka pri trenutnom obimu podataka. Uvođenje Redisa i zasebnog workera dodalo bi značajnu infrastrukturnu kompleksnost bez mjerljive koristi za sistem interne aplikacije s ograničenim brojem korisnika. Ova odluka je evidentirana u Decision Logu u Sprintu 9.
