ALTER TABLE budzeti
ADD COLUMN IF NOT EXISTS kreirao_korisnik_id UUID NULL;

ALTER TABLE budzeti
DROP CONSTRAINT IF EXISTS fk_budzeti_kreirao_korisnik;

ALTER TABLE budzeti
ADD CONSTRAINT fk_budzeti_kreirao_korisnik
FOREIGN KEY (kreirao_korisnik_id) REFERENCES korisnici(id) ON DELETE SET NULL;

ALTER TABLE budzeti
DROP CONSTRAINT IF EXISTS chk_status_odobrenja;

ALTER TABLE budzeti
ADD CONSTRAINT chk_status_odobrenja
CHECK (status_odobrenja IN ('NACRT', 'ODOBREN', 'ODBIJEN', 'na_doradi', 'na_cekanju'));

CREATE TABLE IF NOT EXISTS budzet_komentari (
  id SERIAL PRIMARY KEY,
  budzet_id UUID NOT NULL REFERENCES budzeti(id),
  autor_id VARCHAR(255) NOT NULL,
  autor_ime VARCHAR(255) NOT NULL,
  komentar TEXT NOT NULL,
  tip VARCHAR(50) NOT NULL CHECK (tip IN ('povrat_na_doradu', 'ispravka', 'odobravanje', 'odbijanje')),
  kreirano_at TIMESTAMP DEFAULT NOW()
);
