# Final AI Usage Summary

## 1. Uvod

Tokom razvoja sistema korišteni su AI alati **ChatGPT**, **Codex** i **GitHub Copilot**.  
AI alati nisu korišteni kao zamjena za rad članova tima, već kao podrška pri planiranju, implementaciji, testiranju i analizi mogućih rješenja.

Svaki prijedlog generisan pomoću AI alata dodatno je analiziran i prilagođen postojećoj arhitekturi, poslovnim pravilima i dizajnu aplikacije. Tim nije automatski prihvatao generisana rješenja, već je procjenjivao njihovu ispravnost, složenost i usklađenost sa zahtjevima projekta.

Detaljni pojedinačni zapisi o korištenju AI alata nalaze se u fajlu `AIUsageLog.md`.

---

## 2. Korišteni AI alati

| AI alat | Način korištenja |
|---|---|
| **ChatGPT** | Planiranje funkcionalnosti, prijedlozi arhitekture, analiza grešaka, pomoć pri implementaciji, definisanje testnih scenarija i procjena rizika |
| **Codex** | Generisanje početnih struktura projekta, pomoć pri backend implementaciji i prijedlozi konkretnih programskih rješenja |
| **GitHub Copilot** | Prijedlozi koda tokom razvoja frontend komponenti, servisa i testova |

---

## 3. Za šta je AI korišten

AI alati korišteni su u više faza razvoja sistema.

### 3.1. Početna struktura aplikacije i baza podataka

AI je korišten za:

- prijedlog početne organizacije foldera i fajlova;
- kreiranje osnovnih komponenti aplikacije;
- prijedlog tabela, veza i atributa baze podataka;
- provjeru usklađenosti baze sa funkcionalnim zahtjevima sistema.

Tim je prihvatio osnovni smjer organizacije projekta, ali je izmijenio nazive foldera, fajlova, tabela i kolona prema usvojenim konvencijama.

### 3.2. Upravljanje troškovima

AI je korišten kao pomoć pri implementaciji:

- forme za unos troška;
- validacije obaveznih polja;
- učitavanja kategorija, odjela i valuta;
- izmjene postojećeg troška;
- brisanja troška;
- provjere prava pristupa i statusa troška prije izvršavanja akcije.

Posebna pažnja posvećena je zaštiti zaključanih troškova i sprečavanju neovlaštenih izmjena ili brisanja.

### 3.3. Uvoz CSV i Excel fajlova

AI je korišten pri definisanju toka za uvoz troškova iz fajlova:

1. upload fajla;
2. parsiranje sadržaja;
3. prikaz pregleda podataka;
4. validacija redova;
5. potvrda korisnika;
6. upis validnih podataka u bazu.

AI je također korišten za prijedlog parsera za `CSV`, `XLS` i `XLSX` fajlove, kao i za pripremu testnih scenarija za validne i nevalidne podatke.

### 3.4. Budžeti i proces odobravanja

AI je korišten za definisanje:

- pravila kreiranja i uređivanja budžeta;
- RBAC prava pristupa;
- statusa odobravanja i odbijanja budžeta;
- vraćanja budžeta na doradu;
- obaveznog komentara pri vraćanju na doradu;
- provjere kreatora budžeta prije ponovne dostave;
- historije komentara i akcija nad budžetom;
- in-app notifikacija za relevantne korisnike.

### 3.5. Izvještaji i Data Overview modul

AI je korišten pri implementaciji:

- kartica sa sažetim podacima;
- filtera i agregacijskih tabela;
- generisanja višelisnog Excel izvještaja;
- formatiranja valuta i procenata;
- parsiranja datuma u evropskom formatu `dd.mm.yyyy`;
- selekcije troškova pomoću checkbox elemenata;
- poređenja više odabranih troškova;
- tabelarnog i grafičkog prikaza poređenja podataka.

### 3.6. Dashboard i drill-down funkcionalnosti

AI je korišten kao pomoć pri:

- paralelnom učitavanju Dashboard metrika;
- organizaciji podataka kroz widget komponente;
- prikazu grafikona;
- otvaranju modalnog prozora sa detaljima;
- filtriranju troškova nakon klika na grafikon ili metriku.

### 3.7. AI funkcionalnosti unutar sistema

Pored korištenja AI alata tokom razvoja, u aplikaciju su uključene i funkcionalnosti koje koriste AI ili analitičke algoritme:

- servis za detekciju anomalija među troškovima;
- AI asistent za odgovaranje na finansijska pitanja;
- AI Executive Summary modul;
- detekcija izostalih periodičnih troškova;
- analiza rasta troškova po dobavljaču;
- procjena rizika zavisnosti od dobavljača;
- generisanje preporuka za optimizaciju troškova.

Za AI asistenta prihvaćen je hibridni pristup: backend dohvaća relevantne agregatne podatke iz baze i prosljeđuje ih LLM modelu kao kontekst. Time se smanjuje mogućnost da model odgovara na osnovu nepouzdanih ili izmišljenih podataka.

---

## 4. Šta je tim prihvatio

Tim je prihvatio AI prijedloge koji su bili usklađeni sa zahtjevima sistema i koji nisu uvodili nepotrebnu složenost.

Najvažniji prihvaćeni prijedlozi su:

- osnovna struktura projekta i baze podataka;
- validacija obaveznih polja pri unosu troškova;
- zaštita zaključanih troškova;
- višekoračni tok za import podataka sa preview prikazom;
- povezivanje ingestion logike sa postojećim servisom za troškove;
- RBAC podjela prava pristupa;
- statusi za odobravanje, odbijanje i vraćanje budžeta na doradu;
- posebna tabela za historiju komentara budžeta;
- kartice, filteri i agregacijske tabele u Report i Data Overview modulima;
- generisanje Excel izvještaja sa više listova;
- selekcija i poređenje više troškova;
- tabovi za tabelarni i grafički prikaz;
- Dashboard widget struktura;
- hibridna arhitektura AI asistenta;
- fallback odgovor kada nema dovoljno podataka;
- keširanje Executive Summary rezultata;
- statistička detekcija periodičnih troškova;
- trostepena skala rizika dobavljača: `LOW`, `MEDIUM`, `HIGH`;
- sistem preporuka za optimizaciju troškova;
- in-app notifikacije u procesu dorade budžeta.

---

## 5. Šta je tim izmijenio

Većina AI prijedloga zahtijevala je dodatno prilagođavanje projektu.

Tim je najčešće mijenjao:

- nazive foldera, fajlova, tabela i kolona;
- nazive endpointa i metoda;
- strukture backend odgovora;
- SQL upite prema stvarnoj strukturi baze;
- poruke grešaka;
- nazive statusa;
- stilove, boje, margine i raspored UI elemenata;
- mock podatke u testovima;
- pragove za detekciju periodičnih troškova;
- pragove za procjenu rizika dobavljača;
- format prompta za AI asistenta;
- formulacije odgovora prema poslovnom kontekstu aplikacije;
- podatke koji se šalju LLM modelu kako bi se izbjeglo prekoračenje token limita.

AI je često davao generička rješenja koja su morala biti usklađena sa postojećim servisima i pravilima sistema.

---

## 6. Šta je tim odbacio

Tim je odbacio prijedloge koji su bili nepotrebno složeni, nedovoljno sigurni ili neprikladni za obim projekta.

Odbačeni su, između ostalog:

| Odbačeni prijedlog | Razlog odbacivanja |
|---|---|
| Generički i nepotrebni početni fajlovi | Nisu odgovarali dogovorenoj strukturi projekta |
| Dodatne tabele koje nisu bile potrebne | Uvodile su nepotrebnu složenost baze |
| Parcijalno ažuriranje troška preko `PATCH` metode | Tim je odabrao slanje kompletnih podataka troška putem `PUT` metode |
| Soft delete pristup za troškove | Nije odgovarao pravilima projekta |
| Direktan import fajla bez pregleda i potvrde korisnika | Postojao je rizik upisa nevalidnih podataka |
| Potpuno odvajanje ingestion logike od postojećeg ExpenseService-a | Dovelo bi do dupliranja poslovne logike |
| Preopširni end-to-end testovi u ranim sprintovima | Nisu bili prioritet u odnosu na unit i integracione testove |
| Korištenje biblioteke `moment.js` | Jednostavniji RegExp pristup bio je dovoljan |
| Kompleksni NgRx store za selekciju checkbox elemenata | Nepotrebna složenost za lokalno stanje komponente |
| Dodatni `ai-worker` i Redis servis u prvoj verziji AI analitike | Nisu bili potrebni za trenutni obim sistema |
| D3.js za grafikone | Chart.js je bio jednostavnije rješenje |
| Potpuna RAG arhitektura za AI asistenta | Prezahtjevna za vremenski okvir projekta |
| Direktni LLM poziv bez kontrolisanog konteksta | Veći rizik netačnih odgovora |
| Prompt bez fallback poruke | Model je mogao generisati izmišljene iznose |
| Direktan poziv LLM-a iz kontrolera bez servisnog sloja | Narušavao bi arhitekturu aplikacije |
| Ručno označavanje svih periodičnih troškova | Statistička detekcija je korisnija za automatizaciju |
| Binarna podjela rizika dobavljača | Trostepena skala pruža detaljnije informacije |
| Generičke preporuke bez iznosa i obrazloženja | Nisu bile dovoljno korisne krajnjim korisnicima |
| Čuvanje historije komentara budžeta u JSON polju | Posebna tabela omogućava jednostavnije upite i pregled podataka |

---

## 7. Greške, rizici i ograničenja AI prijedloga

AI alati nisu uvijek davali rješenja koja su se mogla direktno koristiti.

Tokom razvoja identifikovani su sljedeći problemi i rizici:

### 7.1. Neusklađenost sa arhitekturom

AI je povremeno predlagao generičke strukture, endpoint nazive ili dodatne servise koji nisu odgovarali postojećoj arhitekturi aplikacije.

### 7.2. Neusklađenost frontenda i backenda

Kod formi za unos troškova postojao je rizik da frontend očekuje drugačiju strukturu odgovora od one koju backend vraća. Ovo je moglo dovesti do praznih dropdown elemenata ili neispravnog prikaza podataka.

### 7.3. Problemi sa validacijom

Generisana validacija nije uvijek pokrivala sve rubne slučajeve, kao što su:

- nevalidni datumi;
- nepostojeći referentni podaci;
- neispravan format iznosa;
- zaključani troškovi;
- nepotpuni redovi u import fajlovima.

### 7.4. Rizici u testovima

AI-generisani testovi mogli su dati lažno pozitivne rezultate ako mock podaci nisu pravilno usklađeni sa servisnom logikom i stvarnim privilegijama korisnika.

### 7.5. Rizici AI asistenta

Kod AI asistenta identifikovani su rizici:

- izmišljanje podataka kada kontekst nije dovoljan;
- prekoračenje token limita;
- slanje prevelike količine podataka modelu;
- nejasna pitanja korisnika;
- odgovori koji nisu u potpunosti zasnovani na podacima iz sistema.

Zbog toga je uvedena fallback poruka kojom AI asistent navodi da nema dovoljno podataka kada pouzdan odgovor nije moguć.

### 7.6. Rizici analitičkih algoritama

Kod detekcije periodičnih troškova i analize dobavljača mogući su:

- lažno pozitivni rezultati;
- pogrešno povezivanje troškova sa sličnim nazivima;
- problemi sa dobavljačima koji nemaju dovoljan broj historijskih podataka;
- netačne preporuke u slučaju neuobičajenih historijskih perioda;
- zastarjeli podaci zbog vremenski ograničenog keširanja.

### 7.7. Rizici korisničkog interfejsa

Kod Dashboarda i grafikona uočeni su rizici:

- pogrešno skaliranje grafikona za troškove u različitim valutama;
- blokiranje učitavanja svih widgeta ako jedan zahtjev ne uspije;
- neažurni podaci ako se widgeti učitavaju samo jednom;
- pogrešan filter parametar pri otvaranju drill-down prikaza.

---

## 8. Dijelovi sistema razvijeni uz AI pomoć koje tim mora posebno znati objasniti

Članovi tima trebaju razumjeti i samostalno objasniti sve dijelove sistema, a naročito module kod kojih su AI alati korišteni za značajniji dio planiranja ili implementacije.

| Dio sistema | Šta je potrebno znati objasniti |
|---|---|
| **Upravljanje troškovima** | Validaciju forme, dohvat referentnih podataka, izmjenu i brisanje troškova, provjeru statusa i prava pristupa |
| **Import CSV/XLS/XLSX fajlova** | Upload, parser, mapiranje kolona, validaciju redova, preview prikaz i potvrdu upisa |
| **Budžet workflow** | Statusne promjene, RBAC pravila, povrat na doradu, komentare, provjeru kreatora i notifikacije |
| **Report modul** | Agregacije, generisanje višelisnog Excel dokumenta i formatiranje podataka |
| **Data Overview** | Filtriranje, checkbox selekciju, poređenje troškova i grafički prikaz |
| **Dashboard** | Paralelno dohvaćanje podataka, widget strukturu, fallback ponašanje i drill-down modal |
| **Servis za detekciju anomalija** | Razloge izdvajanja AI servisa i ograničenja trenutne arhitekture bez dodatnog workera i Redis servisa |
| **AI asistent** | Hibridni pristup, kreiranje konteksta iz baze, system prompt, fallback poruku i zaštitu od izmišljanja podataka |
| **Executive Summary** | Koji podaci ulaze u sažetak, način generisanja i TTL keširanje |
| **Periodični troškovi** | Logiku intervala ponavljanja, prag tolerancije i moguće lažne detekcije |
| **Analiza dobavljača** | Računanje rasta troškova, procjenu rizika i ograničenja za nove dobavljače |
| **Preporuke za optimizaciju** | Način formiranja preporuka i potrebu za prikazom konkretnih iznosa i obrazloženja |

---

## 9. Način transparentnog i kritičkog korištenja AI alata

Tim je AI alate koristio transparentno i kritički:

1. svaki značajniji način korištenja AI alata evidentiran je u `AIUsageLog.md` fajlu;
2. AI prijedlozi nisu automatski kopirani u projekat;
3. generisani kod je pregledan i prilagođen postojećoj arhitekturi;
4. kompleksna rješenja su odbacivana kada nisu bila potrebna;
5. poslovna pravila i sigurnosne provjere definisao je tim;
6. AI-generisani testovi prilagođeni su stvarnim servisima i korisničkim rolama;
7. identifikovani su mogući rizici, rubni slučajevi i ograničenja;
8. odgovornost za konačna tehnička rješenja ostala je na članovima tima.

---

## 10. Zaključak

AI alati su ubrzali istraživanje mogućih pristupa, pomogli pri pisanju dijelova koda i olakšali identifikaciju potencijalnih problema. Međutim, konačne odluke nisu donosili AI alati.

Tim je zadržao kontrolu nad arhitekturom, poslovnim pravilima, sigurnosnim provjerama, dizajnom korisničkog interfejsa i izborom tehnologija. Prihvaćena su samo rješenja koja su nakon provjere bila opravdana i usklađena sa zahtjevima projekta.
