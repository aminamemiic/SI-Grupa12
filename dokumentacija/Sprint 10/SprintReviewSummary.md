# Sprint Review Summary

## Sprint 10

# 1. Planirani sprint goal
Implementirati centralni interaktivni Dashboard, proširiti modul poređenja podataka grafičkim prikazima, uvesti napredne AI funkcionalnosti za finansijsku analizu te zaokružiti upravljanje budžetom kroz iterativni proces povrata i ispravke. Korisnicima omogućiti vizuelni pregled ključnih finansijskih metrika na jednom mjestu, s mogućnošću klika na grafikon radi bližeg uvida u pojedinačne troškove. Nadograditi modul poređenja grafičkim prikazom (bar, pie) pored postojećeg tabelarnog prikaza. Na backendu i frontendu razviti inteligentnog AI asistenta koji odgovara na pitanja o troškovima, budžetima i anomalijama na prirodnom jeziku, te generisati automatski Executive Summary za finansijskog direktora. Dodatno, implementirati AI mehanizme za identifikaciju dobavljača s najvećim rastom, preporuke za optimizaciju troškova i procjenu rizika zavisnosti od dobavljača. Uvesti detekciju periodičnih troškova koji nisu evidentirani u očekivanom periodu. Implementirati modul za identifikaciju sumnjivih obrazaca potrošnje na osnovu unosa izvan radnog vremena (noćni sati, vikendi) i sumnjivih obrazaca ponašanja. Omogućiti korisnicima dodavanje tekstualnih komentara na pojedinačne troškove radi lakše interpretacije te hronološki pregled istih. Zaokružiti workflow odobravanja budžeta kroz mogućnost povrata budžeta na doradu uz komentar, ispravke od strane računovođe i hronološki prikaz historije komentara tokom cijelog procesa.

# 2. Šta je završeno
Tim je uspješno realizovao sve planirane aktivnosti i dodatno proširenje obima za ovaj sprint, zatvorivši ukupno 17 korisničkih priča:

- **Vizuelno poređenje podataka (US-38)**: Omogućena je checkbox selekcija više zapisa troškova u Data Overview tabeli radi lakšeg poređenja, te paralelni prikaz troškova.
- **Grafički prikaz poređenja podataka (US-39)**: Nadograđen je modul poređenja grafičkim prikazom odabranih troškova s podrškom za bar, line i pie tip grafikona pomoću Chart.js.
- **Identifikacija sumnjivih obrazaca potrošnje (US-40)**: Implementiran algoritam za detekciju unosa van radnog vremena (22:00-06:00 h i vikend) te detekciju cijepanja računa (zbir iznad 1000 BAM unutar istog dana, dobavljača i kategorije) s dodjelom risk score-a i odgovarajuće zastavice.
- **Detekcija periodičnih troškova (US-41)**: Razvijen statistički algoritam za prepoznavanje periodičnosti troškova (na osnovu minimalno 3 prethodna perioda) i generisanje upozorenja ako očekivani trošak izostane nakon praga tolerancije od 3 dana.
- **Centralni interaktivni Dashboard (US-42)**: Kreiran centralizovani interaktivni Dashboard sa ključnim finansijskim indikatorima, karticama metrika i grafičkim komponentama prilagođenim za desktop rezolucije.
- **Bliži prikaz stanja (US-43)**: Razvijena drill-down funkcionalnost – klik na segment grafikona ili karticu Dashboarda otvara modalni dijalog sa listom pojedinačnih troškova koji čine tu sumu.
- **Dodavanje komentara (US-44)**: Omogućeno dodavanje tekstualnih komentara na pojedinačne troškove uz automatsko bilježenje autora i vremena te validaciju dužine (1-500 karaktera) u zasebnoj tablici `troskovi_komentari`.
- **Pregled komentara (US-45)**: Omogućen hronološki pregled komentara uz pojedinačni trošak sa vizuelnim indikatorom (ikonom komentara) u tabeli troškova.
- **Inteligentni AI asistent za finansijska pitanja (US-46)**: Razvijen chatbot na Dashboardu (`/api/ai/assistant`) koji odgovara na pitanja o troškovima, budžetima, kategorijama, dobavljačima i anomalijama na prirodnom jeziku, koristeći LLM sa dinamički injektiranim kontekstom iz baze i anti-hallucination zaštitom.
- **AI Executive Summary (US-47)**: Implementirano automatsko generisanje finansijskog sažetka za finansijskog direktora na Dashboardu, uz backend keširanje rezultata (TTL od 15 minuta).
- **Identifikacija dobavljača sa najvećim rastom (US-48)**: Omogućen prikaz dobavljača s najvećim rastom troškova, prikaz procenta promjene i razlikovanje novih dobavljača od postojećih.
- **AI preporuke za optimizaciju troškova (US-49)**: Integrisan modul za generisanje konkretnih preporuka za optimizaciju troškova s detaljnim obrazloženjem na osnovu historijskih trendova.
- **Procjena rizika zavisnosti od dobavljača (US-50)**: Razvijen mehanizam za generisanje upozorenja (nivoi rizika LOW/MEDIUM/HIGH) kada jedan dobavljač čini značajan udio ukupne potrošnje.
- **Pregled periodičnih troškova za provjeru (US-51)**: Implementiran widget na Dashboardu koji prikazuje periodične troškove koji nisu evidentirani u očekivanom periodu, s datumom posljednje evidencije i prosječnim iznosom.
- **Povrat budžeta na doradu (US-52)**: Omogućen povrat budžeta na doradu uz obavezan komentar finansijskog direktora, promjenu statusa u "Na doradi" i slanje notifikacije kreatoru budžeta.
- **Ispravka i ponovna dostava budžeta (US-53)**: Omogućeno kreatoru budžeta (računovođi) da pregleda komentar, ispravi budžet i pošalje ga ponovo na odobrenje (status prelazi u "Na čekanju", a direktor prima notifikaciju).
- **Pregled historije komentara budžeta (US-54)**: Implementirana tabela `budzet_komentari` i hronološki prikaz komentara budžeta sa autorom, datumom, vremenom i tipom akcije.
- **Prateća dokumentacija**: Ažurirani su Product Backlog, Sprint Backlog, Decision Log, AI Usage Log, Testing Proof i Sprint Retrospective za Sprint 10.

# 3. Šta nije završeno
Sve planirane stavke za Sprint 10 (uključujući proširenje obima za 9 novih korisničkih priča) su uspješno završene.

# 4. Demonstrirane funkcionalnosti ili artefakti
- Centralni interaktivni Dashboard s karticama metrika i grafikonima.
- Drill-down modalni pregled pojedinačnih troškova klikom na segmente grafikona Dashboarda.
- Vizuelno i grafičko poređenje troškova (paralelna tabela i bar, line, pie grafikoni pomoću Chart.js).
- Detekcija sumnjivih obrazaca (unos van radnog vremena i cijepanje računa) s prikazom u notifikacionom sistemu.
- Detekcija i widget za pregled izostalih periodičnih troškova na Dashboardu.
- Komentari na troškove (dodavanje, hronološki prikaz, vizuelni indikator ikone u tabeli).
- Inteligentni AI asistent na Dashboardu (chatbot s podrškom za upite na prirodnom jeziku).
- AI Executive Summary na Dashboardu (sažetak s keširanjem od 15 min).
- Identifikacija dobavljača s najvećim rastom i procjena rizika zavisnosti od dobavljača (LOW/MEDIUM/HIGH).
- AI preporuke za optimizaciju troškova s obrazloženjem.
- Workflow povrata budžeta na doradu (modal za komentar direktora, status "Na doradi", in-app notifikacija).
- Ispravka i ponovna dostava budžeta od strane kreatora (status "Na čekanju", in-app notifikacija direktoru).
- Hronološki prikaz historije komentara budžeta sa autorom, vremenom i tipom akcije.
- Paket od 446 automatizovanih testova sa 97.85% Statements pokrivenosti.

# 5. Glavni problemi i blokeri
Nije bilo kritičnih problema ni blokera koji su uticali na rokove isporuke. Sve planirane aktivnosti su uspješno završene na vrijeme i bez konflikata pri integraciji koda.

# 6. Ključne odluke donesene u sprintu
- **Grafičko poređenje**: Dodana tab navigacija između tabelarnog i grafičkog prikaza s izborom bar, line, pie grafikona pomoću Chart.js.
- **Arhitektura Dashboarda**: Widget-based arhitektura sa paralelnim HTTP zahtjevima pomoću `forkJoin` operatora radi poboljšanja performansi učitavanja.
- **Drill-down na Dashboardu**: Otvaranje modalnog dijaloga s listom filtriranih troškova umjesto preusmjeravanja na novu stranicu, radi očuvanja konteksta.
- **Arhitektura AI asistenta**: Hibridni pristup gdje backend generiše kontekst iz baze i prosljeđuje ga LLM-u, umjesto RAG-a koji bi bio prezahtjevan.
- **Zaštita od halucinacija**: Eksplicitna instrukcija u system promptu da AI asistent vrati "Nema dovoljno podataka" kada kontekst nije dostatan.
- **Keširanje AI sažetka**: Automatsko generisanje Executive Summary-ja pri otvaranju Dashboarda sa keširanjem od 15 minuta na backendu radi smanjenja opterećenja LLM-a.
- **Detekcija periodičnih troškova**: Statistički algoritam na osnovu minimalno 3 prethodna perioda s fiksnim pragom tolerancije od 3 dana kašnjenja.
- **Procjena rizika dobavljača**: Trostepena skala rizika (LOW/MEDIUM/HIGH) na osnovu udjela u ukupnoj potrošnji.
- **Workflow budžeta**: Status "Na doradi" sa obaveznim komentarom direktora, pri čemu samo kreator budžeta (računovođa) može submitovati doradu.
- **Pohrana komentara**: Zasebne relacijske tablice `troskovi_komentari` i `budzet_komentari` radi očuvanja integriteta, lakšeg sortiranja i audit traila.
- **Sumnjivi obrasci**: Detekcija unosa van radnog vremena (22:00-06:00 h i vikendi) i cijepanja računa (zbir > 1000 BAM za isti dan, dobavljača i kategoriju).

# 7. Povratna informacija Product Ownera
Product Owner je izrazio izuzetno zadovoljstvo povećanjem obima posla i uspješnom implementacijom svih 17 korisničkih priča (posebno integracijom naprednih AI mogućnosti i centralnog Dashboarda). Potvrđeno je da sistem u potpunosti ispunjava očekivanja i spreman je za finalnu fazu dokumentovanja i pripreme za isporuku.

# 8. Zaključak za naredni sprint
Naredni sprint (Sprint 11) fokusiran je na finalnu isporuku projekta i izradu prateće dokumentacije:
- Izrada finalne tehničke dokumentacije i arhitektonskog pregleda sistema (`ArchitectureTechnicalOverview.md`)
- Izrada korisničkog uputstva za rad sa sistemom (`UserManual.md`)
- Finalizacija i dokumentovanje cjelokupnog rada tima (`DokumentovanjeRada.md`)
- Kreiranje izvještaja o poznatim ograničenjima i rubnim slučajevima (`KnownIssuesLimitations.md`)
- Generisanje i dokumentovanje finalnog testnog izvještaja (`TestSummary.md`)
- Sumiranje cjelokupnog korištenja AI alata kroz projekat (`FinalAIUsageSummary.md`)
- Priprema finalnih zabilješki o izdanju i verifikacija stabilnosti verzije v1.0.0 (`ReleaseNotes.md`)
