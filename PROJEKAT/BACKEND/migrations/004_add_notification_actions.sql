ALTER TABLE notifikacije
ADD COLUMN IF NOT EXISTS tip_notifikacije VARCHAR(50) NOT NULL DEFAULT 'AI_ANOMALIJA',
ADD COLUMN IF NOT EXISTS povezani_trosak_id UUID NULL,
ADD COLUMN IF NOT EXISTS akcija_status VARCHAR(30) NULL;

ALTER TABLE notifikacije
DROP CONSTRAINT IF EXISTS fk_notifikacije_troskovi;

ALTER TABLE notifikacije
ADD CONSTRAINT fk_notifikacije_troskovi
FOREIGN KEY (povezani_trosak_id) REFERENCES troskovi(id) ON DELETE SET NULL;

ALTER TABLE notifikacije
DROP CONSTRAINT IF EXISTS chk_notifikacije_akcija_status;

ALTER TABLE notifikacije
ADD CONSTRAINT chk_notifikacije_akcija_status
CHECK (akcija_status IS NULL OR akcija_status IN ('SACUVAN', 'OBRISAN'));
