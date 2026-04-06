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
