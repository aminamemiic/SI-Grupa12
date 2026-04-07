# Lista nefunkcionalnih zahtjeva

| ID | Kategorija | Opis zahtjeva | Kako će se provjeravati | Prioritet | Napomena |
|:---|:---:|:---|:---|:---:|:---|
| 1 | **Sigurnost** | Implementacija Role-Based Access Control (RBAC) kako bi se osiguralo da samo određeni stakeholderi imaju pristup povjerljivim podacima/izvještajima | Testiranje pokušaja pristupa povjerljivim informacijama za sve nivoe korisnika sistema (penetration test) | High | |
| 2 | **Pouzdanost** | Sistem mora osigurati tačnost podataka pri unosu, kao i pri uvozu iz csv/excel file-ova | Unošenje testnih podataka sa greškama kako bi se provjerilo da li sistem detektuje greške | High | |
| 3 | **Upotrebljivost** | Administrativni zaposlenici moraju moći unijeti novi trošak u manje od 3 koraka (klika) | User testing sa administrativnim zaposlenicima | Medium | |
| 4 | **Performanse** | AI generisanje izvještaja i analiza odstupanja ne smije trajati duže od 10 sekundi za standardne mjesečne količine podataka | Mjerenje vremena potrebnog za generisanje AI izvještaja pod normalnim i povećanim opterećenjem | Medium | |
| 5 | **Sigurnost** | Sistem mora biti u potpunosti usklađen sa GDPR regulativama jer obrađuje osjetljive finansijske podatke i plate zaposlenika | Provjera usklađenosti sa GDPR regulativama od strane službenika za usklađenost | High | |
| 6 | **Upotrebljivost** | Potrebno je da bude omogućen jasan vizuelni prikaz podataka putem grafika, tabela | Recenzija UI prototipa od strane finansijskog direktora i glavnog računovođe | Medium | |
| 7 | **Pouzdanost** | Sistem mora biti dostupan tokom cijelog radnog vremena, s obzirom da administrativni zaposlenici redovno unose podatke | Praćenje dostupnosti sistema tokom radnog vremena u periodu od 30 dana | Medium | |
| 8 | **Održivost** | Sve API rute između frontenda i backenda moraju biti jasno dokumentovane putem API ugovora, kako bi timovi mogli raditi paralelno | Pregled API dokumentacije | Medium | |
| 9 | Skalabilnost | Sistem mora podržati istovremeni rad najmanje 50 korisnika bez degradacije performansi | Load testing sa simuliranim brojem od 50 istovremenih korisnika | Medium | |
| 10 | Održivost | Sistem mora imati automatizovane backup mehanizme koji osiguravaju dnevno pravljenje sigurnosnih kopija finansijskih podataka | Provjera da li se backup kreira svakodnevno i testiranje uspješnosti oporavka podataka | High | |
| 11 | Upotrebljivost | Sistem mora biti u potpunosti responzivan i funkcionalan na mobilnim uređajima i tabletima, pored desktop pretraživača | Testiranje ključnih funkcionalnosti na najmanje 3 različita uređaja (desktop, tablet, mobitel) | Low | |
| 12 | Privatnost | Korisnici moraju imati mogućnost pregleda, izmjene i brisanja svojih ličnih podataka u skladu sa GDPR pravom | Testiranje toka zahtjeva za pristup i brisanje podataka; provjera da li se podaci stvarno uklanjaju iz baze | High | |
| 13 | Sigurnost | Sve komunikacije između klijenta i servera moraju biti šifrirane putem HTTPS/TLS protokola | Provjera SSL/TLS certifikata i testiranje da li su svi endpointi isključivo na HTTPS-u | High | |
| 14 | Sigurnost | Svaki korisnik mora biti autentificiran prije pristupa sistemu. Sistem mora podržavati sigurnu prijavu, odjavu i upravljanje sesijama | Testiranje prijave bez autentifikacije, kao i sa ispravnom autentifikacijom | High | |
