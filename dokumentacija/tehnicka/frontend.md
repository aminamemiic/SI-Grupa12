# Frontend

[Dokumentacija](../README.md) · [Izvorni kod](../../PROJEKAT/FRONTEND/)

Angular 21 aplikacija koristi TypeScript, RxJS, Angular Router i reaktivne forme. Komunicira s backendom preko REST API-ja i koristi rute s hashom, npr. `/#/home`.

## Organizacija

Putanje su relativne na `PROJEKAT/FRONTEND`:

| Putanja                                  | Namjena                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `src/app/app.*`                          | Okvir aplikacije, navigacija i zaglavlje                                       |
| `src/app/app.routes.ts`                  | Rute i ograničenja pristupa prema ulogama                                      |
| `src/app/components/`                    | Ekrani za pregled, troškove, budžete, uvoz, podatke, izvještaje i notifikacije |
| `src/app/ui/icon.ts`                     | Zajedničke SVG ikone                                                           |
| `src/services/`                          | Pozivi backend API-ja                                                          |
| `src/models/entities.ts`                 | Tipovi podataka                                                                |
| `src/middleware/middleware.authguard.ts` | Prijava, tokeni i korisničke uloge                                             |
| `src/environments/`                      | Razvojna i produkcijska konfiguracija                                          |
| `src/styles.css`                         | Zajednička paleta i stilovi                                                    |
| `src/styles/dashboard.css`               | Stilovi nadzorne ploče                                                         |

## Razvoj, testiranje i izgradnja

Iz korijena repozitorija:

```powershell
cd PROJEKAT/FRONTEND
npm.cmd ci
npm.cmd run dev
```

Razvojni server je [localhost:4200](http://localhost:4200/).

```powershell
npm.cmd test -- --watch=false
npm.cmd run build
```

Izgradnja se zapisuje u `dist/TIM12Frontend/browser`. `npm.cmd start` služi za posluživanje izgrađenih fajlova i očekuje varijablu `PORT`; za svakodnevni lokalni razvoj koristite `npm.cmd run dev`.

## Okruženja i prijava

`environment.development.ts` postavlja lokalni backend i razvojnu prijavu bez lozinke. `ng serve` koristi ovu konfiguraciju.

`environment.ts` koristi produkcijsku konfiguraciju s Keycloak prijavom. Produkcijske adrese su naslijeđene iz ranijeg okruženja i treba ih podesiti prije nove objave; izgradnja sama ne potvrđuje da su ti servisi dostupni.

Nadzorna ploča ima odvojene kartice za finansijski pregled i AI uvide. Pregled podataka je podijeljen na troškove, budžete, šifarnike i historiju uvoza. Na užim ekranima navigacija se otvara preko izbornika.

Za pokretanje cijelog sistema i promjenu načina prijave pogledajte [lokalno pokretanje](../lokalno-pokretanje.md).
