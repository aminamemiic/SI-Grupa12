# Sprint Goal

## Sprint broj
Sprint 10

---

## Sprint cilj

Implementirati centralni interaktivni Dashboard, proširiti modul poređenja podataka grafičkim prikazima, uvesti napredne AI funkcionalnosti za finansijsku analizu te zaokružiti upravljanje budžetom kroz iterativni proces povrata i ispravke. Korisnicima omogućiti vizuelni pregled ključnih finansijskih metrika na jednom mjestu, s mogućnošću klika na grafikon radi bližeg uvida u pojedinačne troškove. Nadograditi modul poređenja grafičkim prikazom (bar, pie) pored postojećeg tabelarnog  prikaza. Na backendu i frontendu razviti inteligentnog AI asistenta koji odgovara na pitanja o troškovima, budžetima i anomalijama na prirodnom jeziku, te generisati automatski Executive Summary za finansijskog direktora. Dodatno, implementirati AI mehanizme za identifikaciju dobavljača s najvećim rastom, preporuke za optimizaciju troškova i procjenu rizika zavisnosti od dobavljača. Uvesti detekciju periodičnih troškova koji nisu evidentirani u očekivanom periodu. Implementirati modul za identifikaciju sumnvijih obrazaca potrošnje na osnovu unosa izvan radnog vremena (noćni sati, vikendi) i sumnjivih obrazaca ponašanja. Omogućiti korisnicima dodavanje tekstualnih komentara na pojedinačne troškove radi lakše interpretacije te hronološki pregled istih. Zaokružiti workflow odobravanja budžeta kroz mogućnost povrata budžeta na doradu uz komentar, ispravke od strane računovođe i hronološki prikaz historije komentara tokom cijelog procesa.

---

## Ključne stavke koje tim želi završiti
- Implementacija Angular komponente centralnog Dashboarda s grafikonima, karticama ključnih metrika i real-time prikazom finansijskog stanja
- Implementacija drill-down funkcionalnosti na Dashboardu – klik na grafikon otvara listu pojedinačnih troškova koji čine prikazanu sumu
- Nadogradnja modula poređenja podataka grafičkim prikazom odabranih troškova s podrškom za bar, line i pie tip grafikona
- Razvoj backend servisa i Angular komponente za inteligentnog AI asistenta (`/api/ai/assistant`) koji odgovara na pitanja o troškovima, budžetima, kategorijama, dobavljačima i anomalijama na prirodnom jeziku
- Implementacija AI Executive Summary modula na Dashboardu koji automatski generiše sažetak ključnih finansijskih informacija za finansijskog direktora
- Razvoj AI mehanizama za identifikaciju dobavljača s najvećim rastom troškova s prikazom postotka promjene i nivoa rizika zavisnosti (LOW, MEDIUM, HIGH)
- Implementacija AI preporuka za optimizaciju troškova s obrazloženjem na osnovu historijskih podataka
- Razvoj algoritma za detekciju periodičnih troškova i backend/frontend modula za prikaz onih koji nisu evidentirani u očekivanom periodu
- Razvoj algoritma za identifikaciju sumnjivih obrazaca potrošnje: detekcija unosa van radnog vremena i detekcija sumnjivih obrazaca potrošnje
- Implementacija backend i frontend funkcionalnosti za evidentiranje i pregled komentara na troškove: dodavanje tekstualnog komentara uz automatsko bilježenje autora i vremena te hronološki prikaz komentara
- Implementacija workflow-a povrata budžeta na doradu: modal za komentar finansijskog direktora, promjena statusa u "Na doradi", notifikacija računovođi, ispravka i ponovna dostava na odobravanje s notifikacijom direktoru
- Implementacija hronološkog prikaza historije komentara budžeta s autorom, datumom, vremenom i tipom akcije
- Izrada prateće dokumentacije za Sprint 10 (Sprint Goal, Product Backlog, Sprint Backlog, Decision Log, AI Usage Log, Testing Proof i Sprint Retrospective)

---

## Rizici i zavisnosti
- **Kompleksnost AI asistenta**: Tačnost odgovora AI asistenta direktno ovisi o kvaliteti i potpunosti podataka u sistemu; odgovori bez odgovarajućih podataka moraju biti jasno označeni kako bi se spriječilo prikazivanje pogrešnih informacija.
- **Performanse Dashboarda**: Istovremeno učitavanje više grafičkih komponenti, metrika i AI sažetka može uzrokovati sporije inicijalno učitavanje stranice ako se zahtjevi ne šalju paralelno ili se ne uvede lazy loading.
- **Detekcija periodičnih troškova**: Algoritam za prepoznavanje periodičnosti zahtijeva historijske podatke iz minimalno 3 prethodna mjeseca; za nove korisnike ili kategorije sistem neće moći generisati pouzdane detekcije.
- **Konzistentnost statusa budžeta**: Workflow povrata na doradu mora biti striktno vezan za RBAC uloge kako bi se spriječilo da neovlašteni korisnici mijenjaju status ili submittuju doradu tuđih budžeta.
- **Lažno pozitivne detekcije sumnjivih obrazaca**: Detekcija unosa izvan radnog vremena može uzrokovati lažne zastavice za opravdane nabavke obavljene kasno navečer ili vikendom.
