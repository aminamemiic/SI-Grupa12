# Technical Setup & Branching Strategy
### Tim 12 — Sistem za AI asistirano analiziranje troškova firme

---

## 1. Branching strategija — GitHub Flow

### Odabir i obrazloženje

Odabrali smo **GitHub Flow** kao branching strategiju. Razlog je jednostavnost i prilagođenost timovima koji rade kontinuirani razvoj bez kompleksnih release ciklusa.
GitHub Flow je linearan, pregledan i svim članovima tima odmah razumljiv.

### Pravila

| Grana | Namjena |
|---|---|
| `main` | Uvijek stabilan, direktno deployabilan kod |
| `feature/naziv-stavke` | Svaka backlog stavka = jedna grana |
| `fix/naziv-buga` | Ispravke grešaka |

### Konvencija commit poruka

```
feat:     nova funkcionalnost
fix:      ispravka greške
refactor: refaktorisanje bez promjene funkcionalnosti
docs:     izmjene dokumentacije
test:     dodavanje ili izmjena testova
chore:    build, konfiguracija, dependencies
```

### Tok rada

1. Kreirati granu iz `main`: `git checkout -b feature/budget-planning`
2. Razviti funkcionalnost uz redovne commitove
3. Otvoriti **Pull Request** prema `main`
4. Minimalno jedan član tima radi code review
5. Nakon odobrenja — merge u `main` i brisanje feature grane

---

## 2. Tehnički stack

### 2.1 Frontend — Angular + TypeScript

**Odabir:** Angular 21 + TypeScript

**Obrazloženje:**
- TypeScript je ugrađen by default — nema dodatne konfiguracije
- Striktna struktura (moduli, servisi, komponente) osigurava konzistentnost koda kroz cijeli tim
- Angular Material pruža gotove komponente: tabele, forme, grafikoni — direktno primjenjivo na dashboard, pregled troškova i izvještaje
- Dependency injection i ugrađeni HTTP klijent smanjuju potrebu za eksternim bibliotekama
- Idealan za form-heavy i table-heavy aplikacije kakva je naša

**Ključne Angular biblioteke:**

| Biblioteka | Namjena |
|---|---|
| `@angular/material` | UI komponente (tabele, forme, dialozi) |
| `@angular/forms` | Reaktivne forme za unos troškova |
| `@angular/router` | Routing između ekrana |
| `@angular/http` | HTTP komunikacija s backendom |
| `chart.js` + `ng2-charts` | Grafikoni na dashboardu |
| `ngx-file-drop` | Drag-and-drop upload fajlova |

---

### 2.2 Backend — Node.js + Express

**Odabir:** Node.js 20 LTS + Express.js + TypeScript

**Obrazloženje:**
- Isti jezik (TypeScript) kao frontend — tim ne mijenja kontekst između dijelova projekta
- Odlična async podrška za duže operacije: OCR obrada, pozivi prema AI mikroservisu, uvoz velikih fajlova
- Express je minimalistički i fleksibilan — dovoljan za naše potrebe bez nepotrebnog overheada
- Veliki npm ekosistem pokriva sve potrebe: JWT, validacija, CSV/Excel parsing, PostgreSQL klijent

**Ključne npm biblioteke:**

| Biblioteka | Namjena |
|---|---|
| `express` | Web framework |
| `typescript` | Tipizacija |
| `jsonwebtoken` | JWT autentifikacija |
| `bcryptjs` | Hash lozinki |
| `pg` + `sequelize` | PostgreSQL klijent i ORM |
| `multer` | Upload fajlova (CSV, Excel, slike) |
| `csv-parse` | Parsiranje CSV fajlova |
| `xlsx` | Parsiranje Excel fajlova |
| `zod` | Validacija podataka |
| `bull` + `redis` | Async queue za AI analizu |
| `winston` | Logging i audit log |
| `cors` + `helmet` | Sigurnost API-ja |
| `swagger-ui-express` | Automatska API dokumentacija |
| `jest` + `supertest` | Testiranje |

---

### 2.3 AI mikroservis — Python

**Odabir:** Python 3.11 kao zaseban mikroservis

**Obrazloženje:**
- Python je industrijski standard za ML/AI razvoj — ekosistema biblioteka nema premca
- Arhitekturalno je već predviđen kao izdvojen servis koji komunicira s backendom kroz interni REST API
- Zamjena ili nadogradnja AI modela ne zahtijeva izmjene na ostatku sistema

#### Python biblioteke — statistička analiza i ML

| Biblioteka | Namjena | Alternativa |
|---|---|---|
| `pandas` | Manipulacija i agregacija podataka | `polars` (brži za velike skupove) |
| `numpy` | Numeričke operacije, z-score izračun | — |
| `scikit-learn` | Isolation Forest, clustering, regresija | `statsmodels` za statističke modele |
| `scipy` | Statistički testovi, IQR detekcija | `pingouin` |
| `statsmodels` | Analiza vremenskih serija, trendovi | `prophet` (Facebook, za sezonalnost) |

#### Python biblioteke — LLM i generisanje obrazloženja

| Biblioteka | Namjena | Alternativa |
|---|---|---|
| `openai` | OpenAI API (GPT-4o) za generisanje opisa | `anthropic` (Claude API) |
| `ollama` | Lokalni LLM (Llama 3, Mistral) — GDPR siguran | `transformers` (HuggingFace) |
| `langchain` | Orkestacija LLM poziva i promptova | `llama-index` |

> **Napomena:** Počinjemo s `ollama` + lokalnim modelom zbog GDPR zahtjeva (podaci o platama i troškovima ne napuštaju server). OpenAI API kao alternativa ako tačnost lokalnog modela ne bude zadovoljavajuća.

#### Python biblioteke — API i infrastruktura

| Biblioteka | Namjena | Alternativa |
|---|---|---|
| `fastapi` | REST API mikroservisa | `flask` (jednostavniji, manji) |
| `uvicorn` | ASGI server za FastAPI | `gunicorn` |
| `pydantic` | Validacija ulaznih podataka | — |
| `celery` + `redis` | Async task queue | `rq` (jednostavniji) |
| `alembic` | Migracije baze (ako AI servis ima vlastitu) | — |
| `pytest` | Testiranje | — |
| `python-dotenv` | Upravljanje environment varijablama | — |

---

### 2.4 OCR modul — EasyOCR

**Odabir:** **EasyOCR**

**Obrazloženje:**
- Najjednostavniji za integraciju — svega nekoliko linija koda za pokretanje
- Odlična tačnost na printanim dokumentima (računi, fakture) — superioran od Tesseracta za ovaj tip sadržaja bez fine-tuninga
- Podrška za bosanski/hrvaski/srpski latinični tekst out-of-the-box
- Radi lokalno — podaci ne napuštaju server (GDPR)
- Open-source, bez licencnih troškova

```python
import easyocr
reader = easyocr.Reader(['bs', 'en'])
result = reader.readtext('racun.jpg', detail=1)
# Vraća: [(bbox, tekst, confidence_score), ...]
```

**Alternativne opcije:**

| Alat | Prednost | Nedostatak |
|---|---|---|
| `Tesseract` + `pytesseract` | Industrijski standard, open-source | Slabija tačnost na printanim računima bez predobrade |
| `AWS Textract` | Izvrsna tačnost, strukturirani output | Plaća se po stranici, podaci idu na AWS (GDPR rizik) |
| `Google Vision API` | Odlična tačnost | Plaća se, podaci idu na Google servere |
| `PaddleOCR` | Visoka tačnost, brz | Kompleksnija instalacija |

> **Migracija:** EasyOCR → PaddleOCR je moguća bez promjena u ostatku sistema jer OCR engine komunicira s ostatkom servisa kroz interni API.

---

### 2.5 Baza podataka — PostgreSQL

**Odabir:** PostgreSQL 16

**Obrazloženje:**
- ACID transakcije — kritično za finansijske podatke (batch upis troškova mora biti atomičan)
- Odlična podrška za kompleksne agregacijske upite (izvještaji, poređenja po periodu/odjelu)
- JSON kolone za fleksibilno čuvanje AI nalaza i audit log detalja
- Open-source, bez licencnih troškova
- Nativna podrška u Sequelize ORM-u (Node.js backend)

---

### 2.6 Infrastruktura i deployment

**Operativni sistem:** Ubuntu 24.04 LTS

**Kontejnerizacija:** Docker + Docker Compose

Svaki servis radi u vlastitom kontejneru:

```
├── nginx          → Reverse proxy, SSL terminacija
├── angular-app    → Frontend (build serviran kroz Nginx)
├── node-backend   → Express API server
├── python-ai      → FastAPI AI mikroservis
├── postgresql     → Baza podataka
└── redis          → Queue za async AI zadatke
```

**Web server:** Nginx — reverse proxy ispred Node.js i Angular aplikacije, SSL/TLS terminacija

**Hosting:** VPS server 

**CI/CD:** GitHub Actions — automatski testovi i deploy pri svakom merge u `main`

---

## 3. Pregled stack-a

| Sloj | Tehnologija |
|---|---|
| Frontend | Angular 21 + TypeScript + Angular Material |
| Backend | Node.js 20 + Express + TypeScript |
| AI mikroservis | Python 3.11 + FastAPI |
| OCR | EasyOCR |
| Baza podataka | PostgreSQL 16 |
| Queue | Redis + Bull (Node) / Celery (Python) |
| Kontejnerizacija | Docker + Docker Compose |
| Web server | Nginx |
| Hosting | VPS — Ubuntu 24.04 LTS |
| Branching | GitHub Flow |
| CI/CD | GitHub Actions |

---
