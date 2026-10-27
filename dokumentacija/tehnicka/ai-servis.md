# AI servis

[Dokumentacija](../README.md) · [Izvorni kod](../../PROJEKAT/BACKEND/ai-service/)

Interni Python / FastAPI servis podržava backend provjerama troškova, prijedlozima kategorija i evidencijom analiza. Koristi PostgreSQL. Dio analitike i integracija s Google Gemini API-jem nalaze se u Node.js backendu, ne u ovom servisu.

## Pokretanje kroz Docker

Preporučeni način je pokretanje cijelog sistema kroz `start-local.ps1`. Za zasebno podizanje AI servisa, iz korijena repozitorija:

```powershell
docker compose -f PROJEKAT/BACKEND/docker-compose.yml -f PROJEKAT/BACKEND/docker-compose.local.yml up -d --build ai-service
```

Compose pokreće i PostgreSQL kao zavisnost te postavlja internu adresu baze. Backend pristupa servisu preko `http://ai-service:8000`.

## Rute

| Metoda i putanja                 | Namjena                                    |
| -------------------------------- | ------------------------------------------ |
| `GET /health`                    | Provjera da servis odgovara                |
| `POST /ai/expense-check`         | Provjera troška                            |
| `POST /ai/category-suggestion`   | Prijedlog kategorije                       |
| `POST /ai/analysis`              | Pokretanje pozadinske analize              |
| `GET /ai/analysis/latest`        | Posljednja analiza                         |
| `GET /ai/analysis/{analysis_id}` | Status i rezultat pojedine analize         |
| `POST /ai/budget-forecast`       | Pripremljena ruta; trenutno vraća HTTP 501 |

Pozadinska analiza u ovom Python servisu ima početnu, placeholder implementaciju. Dostupnost rute nije potvrda da je kompletna analitička funkcionalnost implementirana.

Interaktivna specifikacija je dostupna na [localhost:8000/docs](http://localhost:8000/docs), a provjera rada na [localhost:8000/health](http://localhost:8000/health).

## Pokretanje bez Docker kontejnera za Python

Potrebni su Python 3.11 i dostupna PostgreSQL baza. Iz korijena repozitorija:

```powershell
cd PROJEKAT/BACKEND/ai-service
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Kreirajte lokalni `.env` s pristupom bazi:

```dotenv
DATABASE_URL=postgresql://postgres:<lozinka_baze>@localhost:5433/grupa12app
AI_SERVICE_PORT=8000
NODE_ENV=development
```

Zatim pokrenite:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Port `8000` mora biti slobodan; za ovaj način prethodno zaustavite AI kontejner ako već radi. Ne pohranjujte vlastite lozinke ili API ključeve u verzionisane dokumente.
