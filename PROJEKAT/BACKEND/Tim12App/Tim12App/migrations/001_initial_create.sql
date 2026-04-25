CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist; -- potrebno za EXCLUDE constraint (preklapanje perioda)

-- =========================
-- ULOGE
-- =========================
-- Domain model definiše tačno 4 uloge: Administrator, Glavni računovođa,
-- Finansijski direktor, Administrativni zaposlenik.
CREATE TABLE uloge (
    id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    naziv VARCHAR(100) NOT NULL UNIQUE,
    opis  TEXT
);

-- =========================
-- KORISNICI
-- =========================
CREATE TABLE korisnici (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    ime           VARCHAR(100) NOT NULL,
    prezime       VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    uloga_id      UUID         NOT NULL,
    status_naloga VARCHAR(30)  NOT NULL DEFAULT 'AKTIVAN',

    CONSTRAINT fk_korisnici_uloge
        FOREIGN KEY (uloga_id) REFERENCES uloge(id),

    CONSTRAINT chk_status_naloga
        CHECK (status_naloga IN ('AKTIVAN', 'DEAKTIVIRAN'))
);

-- =========================
-- KATEGORIJE
-- =========================
CREATE TABLE kategorije (
    id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    naziv VARCHAR(150) NOT NULL UNIQUE,
    opis  TEXT
);

-- =========================
-- ODJELI
-- =========================
CREATE TABLE odjeli (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    naziv          VARCHAR(150) NOT NULL,
    sifra_odjela   VARCHAR(50)  NOT NULL UNIQUE,
    rukovodilac_id UUID,

    CONSTRAINT fk_odjeli_rukovodilac
        FOREIGN KEY (rukovodilac_id) REFERENCES korisnici(id)
);

-- =========================
-- PROJEKTI
-- =========================
CREATE TABLE projekti (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    naziv_projekta   VARCHAR(150)  NOT NULL,
    sifra_projekta   VARCHAR(50)   NOT NULL UNIQUE,
    budzet_projekta  NUMERIC(12,2) NOT NULL DEFAULT 0,
    datum_pocetak    DATE          NOT NULL,
    datum_zavrsetak  DATE,
    menadzer_id      UUID,
    status           VARCHAR(30)   NOT NULL DEFAULT 'AKTIVAN',

    CONSTRAINT fk_projekti_menadzer
        FOREIGN KEY (menadzer_id) REFERENCES korisnici(id),

    CONSTRAINT chk_budzet_projekta
        CHECK (budzet_projekta >= 0),

    CONSTRAINT chk_status_projekta
        CHECK (status IN ('AKTIVAN', 'PAUZIRAN', 'ZAVRSEN')),

    CONSTRAINT chk_datumi_projekta
        CHECK (datum_zavrsetak IS NULL OR datum_zavrsetak >= datum_pocetak)
);

-- =========================
-- DOBAVLJACI
-- =========================
CREATE TABLE dobavljaci (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    naziv_firme         VARCHAR(200)  NOT NULL,
    pib_id_broj         VARCHAR(100)  UNIQUE,
    adresa              TEXT,
    rejting_pouzdanosti NUMERIC(5,2),

    CONSTRAINT chk_rejting_pouzdanosti
        CHECK (rejting_pouzdanosti IS NULL OR rejting_pouzdanosti BETWEEN 0 AND 100)
);

-- =========================
-- VALUTE
-- =========================
CREATE TABLE valute (
    id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    kod   VARCHAR(10) NOT NULL UNIQUE,
    naziv VARCHAR(100) NOT NULL
);

-- =========================
-- BUDZETI
-- Ispravljeno:
--   1. Dodat EXCLUDE constraint koji sprječava preklapanje perioda
--      za isti odjel (Poslovno pravilo br. 1)
--   2. Dodat projekat_id period check u trigger (ispod)
-- =========================
CREATE TABLE budzeti (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    naziv                VARCHAR(200)  NOT NULL,
    planirani_iznos      NUMERIC(12,2) NOT NULL,
    datum_pocetka        DATE          NOT NULL,
    datum_zavrsetka      DATE          NOT NULL,
    odjel_id             UUID          NOT NULL,
    projekat_id          UUID,
    verzija_budzeta      INTEGER       NOT NULL DEFAULT 1,
    status_odobrenja     VARCHAR(30)   NOT NULL DEFAULT 'NACRT',
    -- Pravilo br. 7: korisnik koji je autorizovao posljednju promjenu
    odobrio_korisnik_id  UUID,

    CONSTRAINT fk_budzeti_odjeli
        FOREIGN KEY (odjel_id) REFERENCES odjeli(id),

    CONSTRAINT fk_budzeti_projekti
        FOREIGN KEY (projekat_id) REFERENCES projekti(id),

    CONSTRAINT fk_budzeti_odobrio_korisnik
        FOREIGN KEY (odobrio_korisnik_id) REFERENCES korisnici(id),

    CONSTRAINT chk_planirani_iznos
        CHECK (planirani_iznos > 0),

    CONSTRAINT chk_datumi_budzeta
        CHECK (datum_zavrsetka >= datum_pocetka),

    CONSTRAINT chk_status_odobrenja
        CHECK (status_odobrenja IN ('NACRT', 'ODOBREN', 'ODBIJEN')),

    -- Poslovno pravilo br. 1: zabrana preklapanja perioda za isti odjel
    -- Koristi btree_gist ekstenziju i daterange tip
    EXCLUDE USING GIST (
        odjel_id WITH =,
        daterange(datum_pocetka, datum_zavrsetka, '[]') WITH &&
    )
);

-- =========================
-- BUDZET - KATEGORIJA  (M:N)
-- Poslovno pravilo br. 3 (Budžetska pokrivenost):
-- Jedan budžet može pokrivati više kategorija
-- =========================
CREATE TABLE budzet_kategorije (
    budzet_id    UUID NOT NULL,
    kategorija_id UUID NOT NULL,

    PRIMARY KEY (budzet_id, kategorija_id),

    CONSTRAINT fk_budzet_kategorije_budzet
        FOREIGN KEY (budzet_id) REFERENCES budzeti(id) ON DELETE CASCADE,

    CONSTRAINT fk_budzet_kategorije_kategorija
        FOREIGN KEY (kategorija_id) REFERENCES kategorije(id) ON DELETE CASCADE
);

-- =========================
-- TROSKOVI
-- Ispravljeno:
--   - Uklonjena redundantna kolona "zakljucano BOOLEAN" — status
--     'ZAKLJUCAN' u status_validacije je jedini izvor istine
--     (Poslovno pravilo br. 8)
--   - Dodat NOT NULL na obavezna polja prema prav. br. 4
--     (iznos, datum, kategorija_id, odjel_id već su NOT NULL)
-- =========================
CREATE TABLE troskovi (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    naziv               VARCHAR(200)  NOT NULL,
    iznos               NUMERIC(12,2) NOT NULL,   -- Pravilo br. 4: obavezno
    datum               DATE          NOT NULL,   -- Pravilo br. 4: obavezno
    opis                TEXT,

    kategorija_id       UUID NOT NULL,            -- Pravilo br. 4: obavezno
    odjel_id            UUID NOT NULL,            -- Pravilo br. 4: obavezno
    projekat_id         UUID,
    dobavljac_id        UUID,
    valuta_id           UUID NOT NULL,
    kreirao_korisnik_id UUID NOT NULL,

    -- Pravilo br. 8: 'ZAKLJUCAN' je jedini mehanizam zaključavanja
    status_validacije   VARCHAR(30) NOT NULL DEFAULT 'NA_CEKANJU',

    CONSTRAINT fk_troskovi_kategorije
        FOREIGN KEY (kategorija_id) REFERENCES kategorije(id),

    CONSTRAINT fk_troskovi_odjeli
        FOREIGN KEY (odjel_id) REFERENCES odjeli(id),

    CONSTRAINT fk_troskovi_projekti
        FOREIGN KEY (projekat_id) REFERENCES projekti(id),

    CONSTRAINT fk_troskovi_dobavljaci
        FOREIGN KEY (dobavljac_id) REFERENCES dobavljaci(id),

    CONSTRAINT fk_troskovi_valute
        FOREIGN KEY (valuta_id) REFERENCES valute(id),

    CONSTRAINT fk_troskovi_korisnici
        FOREIGN KEY (kreirao_korisnik_id) REFERENCES korisnici(id),

    CONSTRAINT chk_iznos_troska
        CHECK (iznos > 0),

    CONSTRAINT chk_status_validacije
        CHECK (status_validacije IN ('NA_CEKANJU', 'VALIDAN', 'ANOMALIJA', 'ODBIJEN', 'ZAKLJUCAN'))
);

-- =========================
-- ANOMALIJE
-- =========================
CREATE TABLE anomalije (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tip_anomalije    VARCHAR(100) NOT NULL,
    opis_detekcije   TEXT        NOT NULL,
    trosak_id        UUID        NOT NULL,
    status_potvrde   VARCHAR(30) NOT NULL DEFAULT 'OTVORENA',

    CONSTRAINT fk_anomalije_troskovi
        FOREIGN KEY (trosak_id) REFERENCES troskovi(id) ON DELETE CASCADE,

    CONSTRAINT chk_status_potvrde
        CHECK (status_potvrde IN ('OTVORENA', 'POTVRDENA', 'ODBACENA'))
);

-- =========================
-- KOMENTARI
-- Pravilo br. 5:
--   - Nema ON DELETE CASCADE na brisanje — komentari su nepromjenjivi
--   - Brisanje troška ne smije biti dozvoljeno dok postoje komentari,
--     ili se mora enforсirati na aplikacijskom sloju
--   - Nema UPDATE/DELETE prava na ovoj tabeli za normalne uloge
-- =========================
CREATE TABLE komentari (
    id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    tekst         TEXT      NOT NULL,
    -- Pravilo br. 5: sortirani hronološki, DEFAULT osigurava tačno vrijeme unosa
    vrijeme_unosa TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    autor_id      UUID      NOT NULL,
    trosak_id     UUID      NOT NULL,

    CONSTRAINT fk_komentari_autor
        FOREIGN KEY (autor_id) REFERENCES korisnici(id),

    CONSTRAINT fk_komentari_troskovi
        -- Namjerno bez ON DELETE CASCADE — komentari se ne smiju brisati (Pravilo br. 5)
        FOREIGN KEY (trosak_id) REFERENCES troskovi(id)
);

-- =========================
-- TRILOZI (digitalni dokazi)
-- =========================
CREATE TABLE prilozi (
    id        UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    url_fajla TEXT  NOT NULL,
    tip_fajla VARCHAR(100),
    trosak_id UUID  NOT NULL,

    CONSTRAINT fk_prilozi_troskovi
        FOREIGN KEY (trosak_id) REFERENCES troskovi(id) ON DELETE CASCADE
);

-- =========================
-- NOTIFIKACIJE
-- Ispravljeno: dodat timestamp kreiranje (nedostajao u originalnom kodu)
-- =========================
CREATE TABLE notifikacije (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    naslov           VARCHAR(200) NOT NULL,
    poruka           TEXT        NOT NULL,
    prioritet        VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    korisnik_id      UUID        NOT NULL,
    procitano        BOOLEAN     NOT NULL DEFAULT FALSE,
    -- Novo: datum kreiranja notifikacije (za sortiranje i historiju)
    vrijeme_kreiranja TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifikacije_korisnici
        FOREIGN KEY (korisnik_id) REFERENCES korisnici(id) ON DELETE CASCADE,

    CONSTRAINT chk_prioritet
        CHECK (prioritet IN ('LOW', 'MEDIUM', 'HIGH'))
);

-- =========================
-- IZVJESTAJI
-- Ispravljeno: dodati datum_od i datum_do — period na koji se izvještaj odnosi.
-- UC 13 i Pravilo br. 8 zahtijevaju vezu između izvještaja i vremenskog perioda.
-- =========================
CREATE TABLE izvjestaji (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    naziv             VARCHAR(200) NOT NULL,
    tip               VARCHAR(50)  NOT NULL,
    url_dokumenta     TEXT,
    datum_generisanja TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Novo: period koji izvještaj pokriva (za Pravilo br. 8 — zaključavanje troškova)
    datum_od          DATE        NOT NULL,
    datum_do          DATE        NOT NULL,
    autor_id          UUID        NOT NULL,

    CONSTRAINT fk_izvjestaji_autor
        FOREIGN KEY (autor_id) REFERENCES korisnici(id),

    CONSTRAINT chk_tip_izvjestaja
        CHECK (tip IN ('MJESECNI', 'KVARTALNI', 'GODISNJI', 'CUSTOM')),

    CONSTRAINT chk_datumi_izvjestaja
        CHECK (datum_do >= datum_od)
);

-- =========================
-- AUDIT LOGOVI
-- Pravilo br. 6: zapisi su tehnički zaštićeni od modifikacija.
-- REVOKE UPDATE, DELETE na ovoj tabeli od svih rola osim superusera.
-- =========================
CREATE TABLE audit_logovi (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    naziv_tabele    VARCHAR(100) NOT NULL,
    tip_promjene    VARCHAR(10)  NOT NULL,
    stara_vrijednost JSONB,
    nova_vrijednost  JSONB,
    korisnik_id     UUID,
    timestamp       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logovi_korisnici
        FOREIGN KEY (korisnik_id) REFERENCES korisnici(id),

    CONSTRAINT chk_tip_promjene
        CHECK (tip_promjene IN ('C', 'U', 'D'))
);

-- =====================================================================
-- TRIGGERI
-- =====================================================================

-- ---------------------------------------------------------------------
-- TRIGGER 1: Pravilo br. 9 — Validacija projekta pri unosu/izmjeni troška
-- Trošak se ne može alocirati na projekat čiji je status 'ZAVRSEN'
-- ili ako datum troška izlazi iz vremenskog okvira projekta.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_validacija_projekta_troska()
RETURNS TRIGGER AS $$
DECLARE
    v_status        VARCHAR(30);
    v_datum_pocetak DATE;
    v_datum_kraj    DATE;
BEGIN
    IF NEW.projekat_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT status, datum_pocetak, datum_zavrsetak
    INTO v_status, v_datum_pocetak, v_datum_kraj
    FROM projekti
    WHERE id = NEW.projekat_id;

    IF v_status = 'ZAVRSEN' THEN
        RAISE EXCEPTION 'Trošak se ne može alocirati na završeni projekat.';
    END IF;

    IF NEW.datum < v_datum_pocetak THEN
        RAISE EXCEPTION 'Datum troška (%) je prije početka projekta (%).',
            NEW.datum, v_datum_pocetak;
    END IF;

    IF v_datum_kraj IS NOT NULL AND NEW.datum > v_datum_kraj THEN
        RAISE EXCEPTION 'Datum troška (%) je nakon završetka projekta (%).',
            NEW.datum, v_datum_kraj;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validacija_projekta_troska
    BEFORE INSERT OR UPDATE ON troskovi
    FOR EACH ROW
    EXECUTE FUNCTION fn_validacija_projekta_troska();

-- ---------------------------------------------------------------------
-- TRIGGER 2: Pravilo br. 7 — Rebalans budžeta
-- Svaka izmjena ODOBRENOG budžeta automatski povećava verzija_budzeta
-- i zahtijeva da odobrio_korisnik_id bude postavljen.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_rebalans_budzeta()
RETURNS TRIGGER AS $$
BEGIN
    -- Promjena se vrši na već odobrenom budžetu
    IF OLD.status_odobrenja = 'ODOBREN' AND (
        OLD.planirani_iznos  <> NEW.planirani_iznos  OR
        OLD.datum_pocetka    <> NEW.datum_pocetka    OR
        OLD.datum_zavrsetka  <> NEW.datum_zavrsetka  OR
        OLD.odjel_id         <> NEW.odjel_id         OR
        OLD.projekat_id      IS DISTINCT FROM NEW.projekat_id
    ) THEN
        IF NEW.odobrio_korisnik_id IS NULL THEN
            RAISE EXCEPTION 'Izmjena odobrenog budžeta zahtijeva korisnika koji autorizuje promjenu (odobrio_korisnik_id).';
        END IF;

        NEW.verzija_budzeta := OLD.verzija_budzeta + 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rebalans_budzeta
    BEFORE UPDATE ON budzeti
    FOR EACH ROW
    EXECUTE FUNCTION fn_rebalans_budzeta();

-- ---------------------------------------------------------------------
-- TRIGGER 3: Pravilo br. 8 — Zaključavanje troškova
-- Nakon što se generiše finalni MJESECNI Izvještaj, svi troškovi
-- čiji datum pada u taj period dobijaju status 'ZAKLJUCAN'.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_zakljucaj_troskove_po_izvjestaju()
RETURNS TRIGGER AS $$
BEGIN
    -- Zaključavanje se vrši samo za MJESECNI tip izvještaja
    IF NEW.tip = 'MJESECNI' THEN
        UPDATE troskovi
        SET    status_validacije = 'ZAKLJUCAN'
        WHERE  datum BETWEEN NEW.datum_od AND NEW.datum_do
          AND  status_validacije <> 'ZAKLJUCAN';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_zakljucaj_troskove
    AFTER INSERT ON izvjestaji
    FOR EACH ROW
    EXECUTE FUNCTION fn_zakljucaj_troskove_po_izvjestaju();

-- ---------------------------------------------------------------------
-- TRIGGER 4: Pravilo br. 6 — Nepromjenjivost audit logova
-- Sprječava UPDATE i DELETE nad audit_logovi tabelom.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_zabrani_izmjenu_audita()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log zapisi su nepromjenjivi i ne mogu se mijenjati ili brisati.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_zabrana_update_audita
    BEFORE UPDATE ON audit_logovi
    FOR EACH ROW
    EXECUTE FUNCTION fn_zabrani_izmjenu_audita();

CREATE TRIGGER trg_zabrana_delete_audita
    BEFORE DELETE ON audit_logovi
    FOR EACH ROW
    EXECUTE FUNCTION fn_zabrani_izmjenu_audita();

-- ---------------------------------------------------------------------
-- TRIGGER 5: Pravilo br. 5 — Nepromjenjivost komentara
-- Sprječava UPDATE i DELETE nad komentari tabelom.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_zabrani_izmjenu_komentara()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Komentari su nepromjenjivi i ne mogu se mijenjati ili brisati.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_zabrana_update_komentara
    BEFORE UPDATE ON komentari
    FOR EACH ROW
    EXECUTE FUNCTION fn_zabrani_izmjenu_komentara();

CREATE TRIGGER trg_zabrana_delete_komentara
    BEFORE DELETE ON komentari
    FOR EACH ROW
    EXECUTE FUNCTION fn_zabrani_izmjenu_komentara();

-- =====================================================================
-- SIGURNOST: Zaštita audit loga na nivou privilegija
-- (izvršiti kao superuser nakon kreiranja aplikacijskog role-a)
-- =====================================================================
-- REVOKE UPDATE, DELETE ON audit_logovi FROM <app_role>;
-- REVOKE UPDATE, DELETE ON komentari   FROM <app_role>;

-- =====================================================================
-- POČETNI PODACI
-- =====================================================================

-- Tačno 4 uloge kako definiše domain model (uklonjen MENADZER)
INSERT INTO uloge (naziv, opis) VALUES
('ADMINISTRATOR',             'Administrator sistema — upravljanje korisnicima i ulogama'),
('GLAVNI_RACUNOVODJA',        'Glavni računovođa — unos, izmjena i brisanje troškova'),
('FINANSIJSKI_DIREKTOR',      'Finansijski direktor — odobravanje budžeta i pregled AI analize'),
('ADMINISTRATIVNI_ZAPOSLENIK','Administrativni zaposlenik — ručni unos troškova i uvoz podataka');

INSERT INTO valute (kod, naziv) VALUES
('BAM', 'Konvertibilna marka'),
('EUR', 'Euro'),
('USD', 'Američki dolar');

INSERT INTO kategorije (naziv, opis) VALUES
('Plate',          'Troškovi plata zaposlenih'),
('Oprema',         'Kupovina opreme'),
('Marketing',      'Marketing troškovi'),
('Putni troškovi', 'Troškovi službenih putovanja'),
('Zakup',          'Troškovi zakupa prostora');