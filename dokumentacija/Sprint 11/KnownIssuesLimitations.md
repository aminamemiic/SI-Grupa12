# Known Issues / Limitations

## Svrha dokumenta

Ovaj dokument navodi poznata ograničenja sistema u finalnoj verziji projekta. Cilj nije umanjiti vrijednost implementacije, nego jasno odvojiti ono što je završeno od dijelova koji zavise od konfiguracije, količine podataka ili budućeg produkcijskog hardeninga.

## Poznata ograničenja pri korištenju

- AI prijedlog kategorije zavisi od backend konfiguracije. Kada je podešen `GEMINI_API_KEY`, sistem prvo koristi Gemini API; ako Gemini nije dostupan, pokušava fallback preko Python AI servisa. Ako nijedan servis nije dostupan, korisniku se prikaže poruka da AI prijedlog trenutno nije dostupan.
- Notifikacije su implementirane kao in-app notifikacije. E-mail, SMS i push notifikacije nisu dio finalne verzije.
- Sistem nema direktnu integraciju sa vanjskim ERP, bankarskim ili e-faktura servisima. Podaci se unose ručno ili kroz podržani import.
- Dashboard, izvještaji i AI preporuke imaju najviše smisla kada u bazi postoji dovoljno historijskih i uredno unesenih podataka.

## AI ograničenja

- AI funkcionalnosti su pomoćni analitički sloj, ne automatska finansijska odluka. Rezultate treba koristiti kao prijedloge i upozorenja koja korisnik može provjeriti.
- Dio AI funkcionalnosti koristi Gemini, a dio radi preko pravila, statistike i heuristika nad postojećim podacima. To posebno važi za anomalije, duplikate, rast dobavljača, ponavljajuće troškove i dio preporuka za optimizaciju.
- Prijedlog kategorije bira jednu od postojećih kategorija iz baze. Sistem ne kreira nove kategorije automatski.
- Detekcija ponavljajućih troškova pretpostavlja sličan naziv troška i mjesečni obrazac. Sezonski, kvartalni ili drugačije imenovani troškovi mogu ostati neprepoznati.

## Tehnička i produkcijska ograničenja

- Deployment zavisi od ispravnih environment varijabli za bazu, Keycloak, backend, frontend, Gemini i Python AI servis.
- Keycloak konfiguracija mora biti usklađena između frontenda, backenda i deployment okruženja, posebno `JWT_ISSUER`, `JWT_AUDIENCE`, `JWKS_URI`, realm i client ID.
- Za produkcijsko okruženje potrebno je postaviti pravi `SESSION_SECRET`; lokalni fallback nije namijenjen produkciji.
- Aplikacija se oslanja na HTTPS/TLS koji obezbjeđuje hosting platforma ili reverse proxy.
- Backup baze, antivirus skeniranje uploadovanih fajlova, napredni audit log i rate limiting nisu posebno razvijeni kao puni produkcijski moduli u okviru aplikacije.
- Prije ozbiljne produkcijske upotrebe treba dodatno pregledati sve read/reference rute i sigurnosne postavke deploymenta.

## Pretpostavke sistema

- Sistem je zamišljen za jednu organizaciju/tim, ne za više firmi koje paralelno koriste istu instalaciju sa potpuno odvojenim podacima.
- Troškovi se unose sa validnim iznosom, datumom, kategorijom, odjelom i valutom.
- Kategorije, odjeli, valute i dobavljači trebaju biti uredno održavani da bi izvještaji i AI prijedlozi bili korisni.
- Uloge korisnika moraju biti pravilno dodijeljene u Keycloak-u, jer od njih zavisi pristup modulima.

## Šta ne treba predstavljati kao potpuno završeno

- AI ne treba predstavljati kao nepogrešiv sistem za finansijsko odlučivanje, nego kao pomoć pri analizi.
- Notifikacije ne treba predstavljati kao automatske e-mail ili push obavijesti. U finalnoj verziji one se prikazuju unutar aplikacije.
- Sistem ne treba predstavljati kao potpuno spreman za rad u stvarnoj firmi bez dodatnog podešavanja deploymenta, backup-a, sigurnosnih postavki i vanjskih servisa.
