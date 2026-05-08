# Sprint Retrospective Summary – Sprint 6

## Šta je išlo dobro

- Implementacija CRUD operacija: Tim je uspješno implementirao brisanje i ažuriranje troškova, čime su zaokružene sve osnovne CRUD operacije nad tabelom troškova.
- Keycloak znanje: Edukacija o Keycloaku iz Sprinta 5 pokazala je pozitivan efekt — tim je efikasnije rješavao pitanja vezana za autentifikaciju i upravljanje korisnicima bez većih blokera.
- Brzo prepoznavanje preurađenog posla: Tim je pravovremeno uočio da je admin panel za pregled i upravljanje korisnicima već riješen kroz Keycloak, što je izbjeglo nepotrebno dupliranje funkcionalnosti.

## Šta nije išlo dobro

- Podcijenjen obim sprinta: Planirane stavke za Sprint 6 pokazale su se nedovoljnim za cijeli sprint — admin panel i upravljanje korisnicima su bili gotovi ranije nego očekivano zahvaljujući Keycloaku, što je ostavilo tim bez dovoljno posla.
- Procjena složenosti: Nije se dovoljno uzelo u obzir da neke stavke mogu biti implicitno riješene kroz već odabrane tehnologije (Keycloak), što je dovelo do precijenjenog backlog kapaciteta sprinta.
- Kasno preuzimanje dodatnih zadataka: Dodatne stavke iz budućih sprintova su preuzete reaktivno, tek nakon što je primijećen nedostatak posla, umjesto proaktivno tokom sprint planiranja.

## Šta treba promijeniti

- Detaljnija analiza pri sprint planiranju: Prije nego se stavka uvrsti u sprint, tim treba eksplicitno provjeriti koje su njene zavisnosti i da li je možda već djelimično ili potpuno riješena kroz postojeću infrastrukturu ili tehnologije.
- Rezervne stavke u sprint planiranju: Uvesti praksu da se sprint planning završava s jednom ili dvije rezervne stavke manjeg prioriteta koje tim može preuzeti ako primarni zadaci budu završeni ranije od predviđenog.

## Koje konkretne akcije tim uvodi u narednom sprintu

- Sprint planning s rezervnim stavkama: Na početku Sprinta 7 tim će definisati primarne i rezervne stavke, tako da postoji jasan plan šta se preuzima ako se primarne stavke završe ranije.
- Tehnološka provjera pri planiranju: Uvesti korak u sprint planning gdje se za svaku stavku eksplicitno provjerava da li je djelimično riješena kroz Keycloak, Docker, Angular Material ili drugi dio stacka.
- Kontinuirani check-in: Nastaviti s kraćim internim check-in sastancima sredinom sprinta uvedenim u Sprintu 6, uz eksplicitnu tačku dnevnog reda o obimu preostalog posla.
