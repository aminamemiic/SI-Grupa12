## Sprint 6

> Izmjene u odnosu na Sprint 5:
> - Stavke 3-13 su završene
> - Stavka 15 je prebačena u "In process" sa povišenim prioritetom (Medium -> High)
> - Dodane stavke 23-25

| ID | Naziv stavke | Tip | Prioritet | Status | Procjena složenosti | Opis |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | Isplanirati izgled baze podataka | Technical Task | - | Done | - | Isplanirati organizaciju baze podataka koja će biti srce sistema i koja će čuvati informacije o planiranim budžetima, stvarnim računima i troškovima, korisnicima, kategorijama, odjelima, projektima, vremenskim periodima. |
| 2 | Istraživanje o AI dijelu | Research | - | Done | - | Provesti istraživanje i pobliže vidjeti kako koncept AI sistema osmisliti, implementirati, optimizovati, prilagoditi našoj potrebi, kao i da li je isti moguće upotrijebiti u drugim segmentima, mimo same analize. |
| 3 | GDPR & Security | Technical Task | - | Done | - | Osigurati zaštitu osjetljivih finansijskih podataka, plata zaposlenika i slično. |
| 4 | Unos troškova | Feature | - | Done | - | Osmisliti i kreirati sistem koji će služiti za unos stvarnih, pristiglih troškova od strane uposlenih. |
| 5 | Sign in | Technical Task | - | Done | - | Sistem za autentifikaciju korisnika. |
| 6 | Sign out | Technical Task | - | Done | - | Funkcionalnost odjave iz sistema. |
| 7 | Upravljanje korisnicima (RBAC) | Feature | - | Done | - | Sistem koji će regulisati različite nivoe pristupa (admin, menadžer, korisnik). |
| 8 | Postavljanje razvojnog okruženja | Technical Task | - | Done | - | Konfiguracija Docker-a, baze podataka i backend frameworka. |
| 9 | Definisanje API ugovora | Technical Task | - | Done | - | Dokumentacija ruta između Frontenda i Backenda kako bi timovi radili paralelno. | 
| 10 | Razvoj osnovnog UI Dashboarda | Feature | - | Done | - | Kreiranje vizuelnog kostura (mockup) za pregled sistema. |
| 11 | Implementacija CRUD za Troškove | Feature | - | Done | - | Osnovne operacije (Create, Read, Update, Delete) nad tabelom troškova u bazi. | 
| 12 | Keycloak integracija | Technical TaskHigh | - | Done | - | Konfiguracija i integracija Keycloak identity providera kao centralnog sistema za autentifikaciju i upravljanje korisničkim identitetima. | 
| 13 | Docker Compose — produkcijska konfiguracija | Technical Task | - | Done | - | Kreiranje zasebnog docker-compose.prod.yml prilagođenog produkcijskom okruženju. |
| 14 | Planiranje budžeta | Feature | **High** | In process | 3 | Osmisliti i kreirati sistem koji će omogućiti menadžeru/računovođi/vlasniku da napravi odnosno unese plan troškova i budžeta koji će biti osnova, koji će se pratiti i s kojim ćemo porediti stvarne, pristigle troškove. |
| 15 | Pregled podataka | Feature | **High** | In process | 5 | Osmisliti i kreirati sistem koji će odgovornim licima omogućiti pregled kako planiranih tako i stvarnih troškova. Grafikoni, tabelarni prikazi. |
| 16 | Uvoz podataka | Feature | Medium | To do | 13 | Osmisliti i kreirati sistem za čitanje CSV ili Excel tabela/dokumenata kako bi se izbjegao ručni unos stavki. Optical character recognition funkcionalnost. |
| 17 | AI analiza | Feature | Medium | To do | 13 | Osmisliti, kreirati i optimizovati AI sistem koji će vršiti analizu troškova, trendova, budžetskih odstupanja i neuobičajenih obrazaca potrošnje u odnosu na isplanirani budžet. |
| 18 | Poređenje podataka | Feature | Medium | To do | 5 | Osmisliti i kreirati sistem koji će odgovornim licima omogućiti ručno poređenje podataka. Poređenje podataka po kategorijama (ova - prethodna sedmica, sektor1 - sektor2) i poređenje pristiglih u odnosu na planirane troškove. |
| 19 | Generisanje upozorenja | Feature | Medium | To do | 3 | Kreirati sistem koji će na osnovu analize koju provodi AI izvršiti generisanje upozorenja sa sažetkom za zaposlene o zaključcima koje je AI donio. Gdje je uočena anomalija, šta je u pitanju, koliko je odstupanje. |
| 20 | Izvještaj | Feature | Medium | To do | 3 | Sistem za izvoz podataka (export) po uzoru na uvoz. |
| 21 | Evidencija komentara | Feature | Low | To do | 2 | Pisanje i pregled komentara odgovornih osoba. |
| 22 | Integracija OCR biblioteke | Technical Task | Medium | To do | 8 | Povezivanje odabranog OCR alata sa backend kodom. |
| 23 | Redis queue integracija | Technical Task | Medium | To do | 5 | Dodavanje Redis kontejnera u Docker Compose i integracija queue mehanizma između backend API servisa i Python AI mikroservisa. |
| 24 | Pretraga i filtriranje troškova | Feature | Medium | To do | 3 | Implementacija funkcionalnosti pretrage i filtriranja nad listom troškova. Pretraga po ključnoj riječi obuhvata naziv troška, opis i dobavljača. Filtriranje obuhvata kombinovano filtriranje po kategoriji, odjelu, projektu i vremenskom periodu. |
| 25 | Sortiranje podataka | Feature | Low | To do | 2 | Implementacija sortiranja liste troškova po ključnim atributima: datumu (uzlazno/silazno), nazivu (abecedno), iznosu (uzlazno/silazno) i statusu. |
