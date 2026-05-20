# Sprint Retrospective Summary – Sprint 8

## Šta je išlo dobro

- **Uspješna realizacija akcionog plana iz Sprinta 7**: Kolega zadužen za deployment je napisao detaljnu step-by-step dokumentaciju za redeploy na Railway platformi. Održana je kratka interna sesija prenosa znanja, pa su u ovom sprintu još dva člana tima uspješno obavila deployment bez blokera. Ovisnost o jednoj osobi je u potpunosti eliminisana.
- **Izuzetna tehnička realizacija izvještaja**: Izrada višelisnog Excel generatora i laganog PDF generatora na backendu odrađena je vrlo čisto i bez povlačenja masivnih eksternih biblioteka, čime je sačuvan nizak memorijski otisak aplikacije u Dockeru.
- **Efikasna unifikacija formata datuma**: Kreiranjem jedinstvenih Helper metoda za formatiranje datuma na frontendu, format `dd.mm.yyyy` je brzo i bez grešaka primijenjen kroz sve tabele, modalne detalje i filtere.

## Šta nije išlo dobro

- **Teškoće u testiranju binarnih PDF tokovima**: Automatizovani testovi ne mogu lako verifikovati ispravnost i čitljivost binarno generisanih PDF fajlova. Tim je morao uložiti dosta vremena u ručnu provjeru i vizuelnu inspekciju svakog preuzetog PDF-a.
- **Blago kašnjenje pri integraciji historije grešaka uvoza**: Nedostatak rano definisanog ugovora o JSON formatu za greške uvoza uzrokovao je manje nesporazume između backend i frontend developera. To je usporilo spajanje prikaza loga grešaka na Data Overview stranici za jedan dan.

## Šta treba promijeniti

- **Obavezno definisanje API ugovora (JSON šema) unaprijed**: Za sve nove endpointe, a posebno one vezane za AI analizu u narednom sprintu, JSON šeme zahtjeva i odgovora moraju biti precizno definisane i odobrene od strane cijelog tima prije početka kodiranja.
- **Uvođenje mock provjera binarnih odgovora**: U automatizovanim testovima uvesti detaljniju provjeru strukture bafera i zaglavlja (MIME tipovi) kako bi se smanjila potreba za ručnim preuzimanjem fajlova tokom razvoja.

## Koje konkretne akcije tim uvodi u narednom sprintu

- **Zajednički sastanak za definisanje AI API ugovora**: Prvog dana Sprinta 9, tim će kreirati tačne JSON ugovore za komunikaciju s AI mikroservisom i Redis redovima poruka, te ih dokumentovati u zajedničkom repozitoriju.
- **Dodavanje integracionih testova za binarne bafer strukture**: Proširiti backend testove tako da verifikuju zaglavlja, veličinu i početne bajtove generisanih `.xlsx` i `.pdf` dokumenata radi automatske regresione zaštite.
- **Zadržavanje dobre prakse deploymenta**: Nastaviti s praksom da različiti članovi tima naizmjenično rade deploy na produkciju kako bi se znanje i dalje održavalo aktivnim.
