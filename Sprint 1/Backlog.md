# Tim 12: Sistem za AI asistirano analiziranje troškova firme i otkrivanje odstupanja

## Kratak opis projekta
Sistem treba omogućiti unos, uvoz i organizaciju podataka o troškovima firme iz različitih izvora, njihovu klasifikaciju po kategorijama, odjelima, projektima i vremenskim periodima te analizu trendova, budžetskih odstupanja i neuobičajenih obrazaca potrošnje.

Sistem treba podržati pregled i poređenje planiranih i stvarnih troškova, identifikaciju značajnih odstupanja, generisanje upozorenja i sažetaka za menadžment, evidenciju komentara odgovornih osoba te osnovno izvještavanje za finansije i rukovodstvo.

| ID | Naziv stavke | Tip | Prioritet | Status | Procjena složenosti | Opis |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | Isplanirati izgled baze podataka | Technical Task | **High** | In process | 5 | Isplanirati organizaciju baze podataka koja će biti srce sistema i koja će čuvati informacije o planiranim budžetima, stvarnim računima i troškovima, korisnicima, kategorijama, odjelima, projektima, vremenskim periodima. |
| 2 | Istraživanje o AI dijelu | Research | **High** | In process | 8 | Provesti istraživanje i pobliže vidjeti kako koncept AI sistema osmisliti, implementirati, optimizovati, prilagoditi našoj potrebi, kao i da li je isti moguće upotrijebiti u drugim segmentima, mimo same analize. |
| 3 | Planiranje budžeta | Feature | Medium | To do | 3 | Osmisliti i kreirati sistem koji će omogućiti menadžeru/računovođi/vlasniku da napravi odnosno unese plan troškova i budžeta koji će biti osnova, koji će se pratiti i s kojim ćemo porediti stvarne, pristigle troškove. |
| 4 | Unos troškova | Feature | Medium | To do | 3 | Osmisliti i kreirati sistem koji će služiti za unos stvarnih, pristiglih troškova od strane uposlenih. |
| 5 | Uvoz podataka | Feature | Medium | To do | 13 | Osmisliti i kreirati sistem za čitanje CSV ili Excel tabela/dokumenata kako bi se izbjegao ručni unos stavki. Optical character recognition funkcionalnost. |
| 6 | AI analiza | Feature | Medium | To do | 13 | Osmisliti, kreirati i optimizovati AI sistem koji će vršiti analizu troškova, trendova, budžetskih odstupanja i neuobičajenih obrazaca potrošnje u odnosu na isplanirani budžet. |
| 7 | Pregled podataka | Feature | Medium | To do | 5 | Osmisliti i kreirati sistem koji će odgovornim licima omogućiti pregled kako planiranih tako i stvarnih troškova. Grafikoni, tabelarni prikazi. |
| 8 | Poređenje podataka | Feature | Medium | To do | 5 | Osmisliti i kreirati sistem koji će odgovornim licima omogućiti ručno poređenje podataka. Poređenje podataka po kategorijama (ova - prethodna sedmica, sektor1 - sektor2) i poređenje pristiglih u odnosu na planirane troškove. |
| 9 | Generisanje upozorenja | Feature | Medium | To do | 3 | Kreirati sistem koji će na osnovu analize koju provodi AI izvršiti generisanje upozorenja sa sažetkom za zaposlene o zaključcima koje je AI donio. Gdje je uočena anomalija, šta je u pitanju, koliko je odstupanje. |
| 10 | Izvještaj | Feature | Medium | To do | 3 | Sistem za izvoz podataka (export) po uzoru na uvoz. |
| 11 | Evidencija komentara | Feature | Low | To do | 2 | Pisanje i pregled komentara odgovornih osoba. |
| 12 | Sign in | Technical Task | Low | To do | 2 | Sistem za autentifikaciju korisnika. |
| 13 | Sign out | Technical Task | Low | To do | 1 | Funkcionalnost odjave iz sistema. |
| 14 | Upravljanje korisnicima (RBAC) | Feature | Medium | To do | 5 | Sistem koji će regulisati različite nivoe pristupa (admin, menadžer, korisnik). |
| 15 | GDPR & Security | Technical Task | Medium | To do | 5 | Osigurati zaštitu osjetljivih finansijskih podataka, plata zaposlenika i slično. |
