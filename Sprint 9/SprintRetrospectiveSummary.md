# Sprint Retrospective Summary – Sprint 9

## Šta je išlo dobro

- **Uspješna integracija pametnih formi**: Tim je odlično implementirao real-time pred-validaciju na formi troškova sa 500ms debounce-om, što korisnicima pruža izuzetan osjećaj interaktivnosti i sigurnosti.
- **Robustan backend algoritam projekcije**: Uspješno je implementirana logika linearne projekcije budžeta u `BudgetService.ts` sa ugrađenom zaštitom od dijeljenja sa nulom.
- **Fleksibilan workflow za rješavanje duplikata**: Dvoakcijski tok (Odobri/Obriši) u notifikacijama se pokazao kao izuzetno koristan i stabilan, dajući finansijskom timu potpunu kontrolu nad unosima.
- **Fuzzy AI Kategorizacija**: Korištenje Levenshtein distance i prefix boost-a se pokazalo kao izuzetno brzo (<10ms) i precizno rješenje za predlaganje kategorija.

## Šta nije išlo dobro

- **Izazovi sa vremenskim zonama u Docker kontejnerima**: Prilikom kalkulacije trenutnog dana u mjesecu na backendu, uočena su odstupanja jer je Docker kontejner koristio UTC vrijeme, dok su podaci u bazi bili u lokalnom vremenu. To je privremeno davalo blago netačne projekcije tokom kasnih noćnih testiranja.
- **Nedorečenost prvobitne specifikacije sprinta**: Iako su pametne validacije i AI kategorizacija bili ključni dio rada u ovom sprintu, prvobitni Sprint Backlog ih nije u potpunosti i detaljno mapirao, što je stvorilo blage nesporazume oko obima posla na samom početku.

## Šta treba promijeniti

- **Unifikacija rukovanja vremenskim zonama**: Sve kalkulacije i proračuni na backendu moraju se strogo standardizovati na UTC format.
- **Detaljnije mapiranje koda i backloga**: Uspostaviti praksu da se sve tehničke isporuke na backendu i frontendu (poput AI i validacijskih endpoints) detaljno evidentiraju u backlog-u odmah na početku sprinta, a ne samo na osnovu primarnih user story-ja.

## Koje konkretne akcije tim uvodi u narednom sprintu

- **Uvođenje UTC standardizacije**: Uvesti strogo korištenje UTC datuma za sve pozadinske proračune potrošnje.
- **Pisanje testova za frontend komponente**: Pokrenuti razvoj unit testova za novoizgrađene Angular komponente (Jasmine/Karma) kako bi se osigurao integritet prikaza.
