# Sprint Retrospective Summary – Sprint 7

## Šta je išlo dobro

- Realizacija planiranih zadataka: Tim je uspješno implementirao sve planirane funkcionalnosti — uvoz podataka iz CSV i Excel fajlova te kreiranje i uređivanje budžeta s poslovnom logikom odobravanja.
- Implementacija poslovnih pravila: Uspješno je implementirana logika odobravanja budžeta — budžet je moguće uređivati sve dok finansijski direktor ne odobri, nakon čega izmjene nisu dozvoljene, a brisanje budžeta nije moguće ni u jednom trenutku.
- Bolja organizacija sprinta: Akcioni plan iz Sprinta 6 vezan za detaljniju analizu i bolju raspodjelu posla pokazao je konkretan pozitivan efekt — posao je ravnomjernije raspoređen tokom trajanja sprinta bez pritiska pred kraj.


## Šta nije išlo dobro

- Problemi s redeploy procesom: Redeploy aplikacije na Railway platformi uzrokovao je blokere koji su rezultirali time da je kolega zadužen za deployment morao forkati projekat kako bi nastavio s radom. Ovo ukazuje na nedovoljno dokumentovan i nestabilan deployment proces.
- Ovisnost o jednoj osobi za deployment: Proces deploymenta je koncentrisan na jednog člana tima, što stvara usko grlo i rizik u slučaju bilo kakvih komplikacija.

## Šta treba promijeniti

- Dokumentovanje deployment procesa: Potrebno je napisati jasnu step-by-step dokumentaciju za redeploy na Railway platformi kako bi svaki član tima mogao samostalno izvršiti deployment bez blokera.
- Raspodjela znanja o deploymentu: Više od jednog člana tima treba biti upoznato s deployment procesom kako bi se izbjegla ovisnost o jednoj osobi.


## Koje konkretne akcije tim uvodi u narednom sprintu

- Kreiranje deployment dokumentacije: Član tima koji je radio deployment dokumentuje cijeli proces redeploya na Railway platformi prije početka Sprinta 8.
- Prenošenje znanja o deploymentu: Organizovati kratku internu sesiju gdje kolega koji radi deployment prenosi znanje ostatku tima.
- Nastavak dobre prakse planiranja: Zadržati pristup detaljnije analize i raspodjele posla koji je pokazao pozitivne rezultate u ovom sprintu.
