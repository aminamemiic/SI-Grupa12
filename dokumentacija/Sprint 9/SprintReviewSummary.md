# Sprint Review Summary

## Sprint 9

# 1. Planirani sprint goal
Implementirati cjelokupan napredni modul za poređenje finansijskih podataka, predviđanje/projekciju potrošnje budžeta te pametne AI mehanizme za kontrolu i validaciju troškova. Korisnicima omogućiti checkbox selekciju troškova iz Data Overview tabele za tabelarni side-by-side prikaz razlika po kategorijama i odjelima. Na backendu razviti formulu linearne projekcije budžeta na osnovu brzine trošenja tekućeg mjeseca. Dodatno, integrisati AI modul za automatsko predlaganje kategorija na osnovu naziva troška, uvesti klijentsku real-time pred-validaciju forme za unos (koja u pozadini prepoznaje anomalije, duplikate i prekoracenja budžeta prije spašavanja) te zatvoriti kompletan radni tok odlučivanja i rješavanja potencijalnih duplih troškova direktno kroz interfejs notifikacija.

# 2. Šta je završeno
Tim je uspješno realizirao sve planirane aktivnosti za ovaj sprint:

- **Odabir podataka za poređenje (US-29)**: Omogućena je checkbox selekcija više zapisa troškova u Data Overview tabeli radi lakšeg poređenja.
- **Poređenje po kategorijama (US-30)**: Implementiran je side-by-side tabelarni prikaz selektovanih troškova u Angular komponenti `selected-expense-comparison` s jasno istaknutim razlikama.
- **Poređenje planiranih i stvarnih troškova (US-31)**: Kreirana je komponenta `planned-actual-comparison` za vizuelno poređenje (Variance Analysis) sa dinamičkim progress bar-ovima i crvenim indikatorima prekoračenja.
- **Slanje notifikacije (US-32)**: Implementirano je slanje automatskih notifikacija kada pozadinski sistem detektuje anomaliju ili potencijalni dupli trošak.
- **Sažetak o uočenoj anomaliji (US-33)**: Uz svaku notifikaciju o anomaliji priložen je i tekstualni opis koji pojašnjava ozbiljnost i vrstu problema.
- **Automatska validacija i detekcija anomalija pri unosu (US-34)**: Implementirana je klijentska real-time pred-validacija na formi troškova s debounce mehanizmom od 500ms, koja u pozadini analizira unos (Z-score, IQR, duplikati, prekoračenja) prije spašavanja.
- **Dubinska analiza trendova na zahtjev (US-35)**: Omogućeno je pokretanje AI analize cjelokupne baze podataka jednim klikom radi generisanja detaljnog izvještaja.
- **Predviđanje potrošnje do kraja perioda (US-36)**: Razvijen je backend servis `BudgetService.getBudgetProjection` i endpoint `/api/budzeti/:id/projekcija` koji računa dnevnu brzinu trošenja, projektovanu mjesečnu potrošnju i projektovano krajnje stanje budžeta.
- **Pametno grupisanje troškova (US-37)**: Integrisan je AI modul za automatsko predlaganje kategorije na osnovu naziva i opisa troška tokom ručnog unosa.
- **Prateća dokumentacija**: Ažurirani su Product Backlog, Sprint Backlog, Decision Log, AI Usage Log, Testing Proof i Sprint Retrospective za Sprint 9.

# 3. Šta nije završeno
Sve planirane stavke za Sprint 9 su uspješno završene.

# 4. Demonstrirane funkcionalnosti ili artefakti
- Checkbox selekcija u Data Overview tabeli
- Side-by-side poređenje selektovanih troškova (tabela)
- Variance Analysis za planirane i stvarne troškove sa progress bar-ovima
- Automatske notifikacije s tekstualnim opisima detektovanih anomalija
- Real-time pred-validacija forme troškova sa 500ms debounce
- Dubinska AI analiza trendova i projekcije budžeta
- Linearna projekcija krajnjeg stanja budžeta na backendu
- AI preporuka kategorije troška pri unosu
- Rješavanje potencijalno duplih troškova kroz interfejs notifikacija

# 5. Glavni problemi i blokeri
- **Deploy AI servisa**: U početku je bilo poteškoća pri deployu AI servisa na server. Zahvaljujući brzoj komunikaciji i saradnji unutar tima, problem je uspješno identifikovan i riješen bez uticaja na rokove isporuke.

# 6. Ključne odluke donesene u sprintu
- Za sprečavanje preopterećenja backend servera usljed čestih API poziva tokom real-time pred-validacije unosa troška, uveden je debounce mehanizam od 500ms na klijentskoj strani.
- Odlučeno je da se selektovani checkbox-ovi čuvaju u lokalnom stanju komponente kako bi se selekcija zadržala stabilnom čak i tokom pretrage ili filtriranja unutar tabele.
- Odlučeno je da se linearne projekcije budžeta računaju isključivo na backendu kako bi se smanjila kompleksnost klijentskog koda i osigurala tačnost formula.

# 7. Povratna informacija Product Ownera
Product Owner je izrazio zadovoljstvo implementiranim funkcionalnostima. Kao jedinu sugestiju za poboljšanje, napomenuo je da bi tim mogao za još jedan stepen povećati obim posla.

# 8. Zaključak za naredni sprint
- Vizuelno i grafičko poređenje troškova (US-38, US-39)
- Identifikacija sumnjivih obrazaca potrošnje (US-40)
- Detekcija periodičnih troškova i izostanka istih (US-41)
- Centralni interaktivni Dashboard (US-42) i drill-down na grafikone (US-43)
- Dodavanje i pregled komentara na troškove (US-44, US-45)
- Tok odobravanja i dorade budžeta sa komentarima i historijom (US-52, US-53, US-54)
- RBAC sigurnosna zaštita novih endpointa i stranica
