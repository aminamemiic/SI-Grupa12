-- =====================================================================
-- SEED DATA ZA TESTIRANJE PROJEKCIJA BUDŽETA
-- Ova skripta koristi PostgreSQL funkcije date_trunc i CURRENT_DATE
-- kako bi dinamički kreirala podatke koji se uvijek odnose na 
-- TEKUĆI MJESEC, bez obzira kada se skripta pokrene.
-- =====================================================================

DO $$
DECLARE
    -- Uloge
    v_admin_role_id UUID;
    v_racunovodja_role_id UUID;
    v_direktor_role_id UUID;
    v_zaposlenik_role_id UUID;

    -- Korisnici
    v_admin_id UUID;
    v_racunovodja_id UUID;
    v_direktor_id UUID;
    v_zaposlenik_id UUID;

    -- Odjeli
    v_odjel_it_id UUID;
    v_odjel_mkt_id UUID;
    v_odjel_fin_id UUID;

    -- Projekti
    v_projekat_it_id UUID;
    v_projekat_mkt_id UUID;

    -- Dobavljači
    v_dobavljac_it_id UUID;
    v_dobavljac_mkt_id UUID;

    -- Valute
    v_valuta_bam_id UUID;

    -- Kategorije
    v_kat_plate_id UUID;
    v_kat_oprema_id UUID;
    v_kat_marketing_id UUID;
    v_kat_put_id UUID;
    v_kat_zakup_id UUID;

    -- Budžeti
    v_budzet_it_id UUID;
    v_budzet_mkt_id UUID;
    v_budzet_fin_id UUID;
BEGIN
    -- 1. Dohvatanje uloga
    SELECT id INTO v_admin_role_id FROM uloge WHERE naziv = 'ADMINISTRATOR';
    SELECT id INTO v_racunovodja_role_id FROM uloge WHERE naziv = 'GLAVNI_RACUNOVODJA';
    SELECT id INTO v_direktor_role_id FROM uloge WHERE naziv = 'FINANSIJSKI_DIREKTOR';
    SELECT id INTO v_zaposlenik_role_id FROM uloge WHERE naziv = 'ADMINISTRATIVNI_ZAPOSLENIK';

    -- 2. Kreiranje testnih korisnika
    INSERT INTO korisnici (ime, prezime, email, password_hash, uloga_id, status_naloga)
    VALUES 
    ('Admin', 'Adminovic', 'admin@tim12.com', '$2b$10$wN9P3.WfKjUenQ7YlK02c.j8.n4l0f/R8K.qT8W.6FzV5K.t5dKx.', v_admin_role_id, 'AKTIVAN'),
    ('Haris', 'Racunovodja', 'racunovodja@tim12.com', '$2b$10$wN9P3.WfKjUenQ7YlK02c.j8.n4l0f/R8K.qT8W.6FzV5K.t5dKx.', v_racunovodja_role_id, 'AKTIVAN'),
    ('Amra', 'Direktorica', 'direktor@tim12.com', '$2b$10$wN9P3.WfKjUenQ7YlK02c.j8.n4l0f/R8K.qT8W.6FzV5K.t5dKx.', v_direktor_role_id, 'AKTIVAN'),
    ('Zaposlenik', 'Zaposlenikovic', 'zaposlenik@tim12.com', '$2b$10$wN9P3.WfKjUenQ7YlK02c.j8.n4l0f/R8K.qT8W.6FzV5K.t5dKx.', v_zaposlenik_role_id, 'AKTIVAN')
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email;

    -- Ponovno dohvatanje ID-eva korisnika za svaki slučaj
    SELECT id INTO v_admin_id FROM korisnici WHERE email = 'admin@tim12.com';
    SELECT id INTO v_racunovodja_id FROM korisnici WHERE email = 'racunovodja@tim12.com';
    SELECT id INTO v_direktor_id FROM korisnici WHERE email = 'direktor@tim12.com';
    SELECT id INTO v_zaposlenik_id FROM korisnici WHERE email = 'zaposlenik@tim12.com';

    -- 3. Kreiranje odjela
    INSERT INTO odjeli (naziv, sifra_odjela, rukovodilac_id)
    VALUES 
    ('IT i Razvoj', 'IT-01', v_admin_id),
    ('Marketing i PR', 'MKT-01', v_direktor_id),
    ('Finansijski odjel', 'FIN-01', v_racunovodja_id)
    ON CONFLICT (sifra_odjela) DO UPDATE SET naziv = EXCLUDED.naziv;

    -- Ponovno dohvatanje ID-eva odjela
    SELECT id INTO v_odjel_it_id FROM odjeli WHERE sifra_odjela = 'IT-01';
    SELECT id INTO v_odjel_mkt_id FROM odjeli WHERE sifra_odjela = 'MKT-01';
    SELECT id INTO v_odjel_fin_id FROM odjeli WHERE sifra_odjela = 'FIN-01';

    -- 4. Kreiranje projekata
    INSERT INTO projekti (naziv_projekta, sifra_projekta, budzet_projekta, datum_pocetak, datum_zavrsetak, menadzer_id, status)
    VALUES 
    ('Razvoj Mobilne Aplikacije', 'PRJ-APP', 150000.00, date_trunc('month', CURRENT_DATE) - INTERVAL '3 months', date_trunc('month', CURRENT_DATE) + INTERVAL '6 months', v_admin_id, 'AKTIVAN'),
    ('Digitalna Kampanja 2026', 'PRJ-CAM', 30000.00, date_trunc('month', CURRENT_DATE) - INTERVAL '1 month', date_trunc('month', CURRENT_DATE) + INTERVAL '2 months', v_direktor_id, 'AKTIVAN')
    ON CONFLICT (sifra_projekta) DO UPDATE SET naziv_projekta = EXCLUDED.naziv_projekta;

    SELECT id INTO v_projekat_it_id FROM projekti WHERE sifra_projekta = 'PRJ-APP';
    SELECT id INTO v_projekat_mkt_id FROM projekti WHERE sifra_projekta = 'PRJ-CAM';

    -- 5. Kreiranje dobavljača
    INSERT INTO dobavljaci (naziv_firme, pib_id_broj, adresa, rejting_pouzdanosti)
    VALUES 
    ('IT Cloud Solutions d.o.o.', '4200000000001', 'Ulica Tehnologije 12, Sarajevo', 98.5),
    ('Media Agency d.o.o.', '4200000000002', 'Bulevar Marketinga 44, Ilidža', 92.0)
    ON CONFLICT (pib_id_broj) DO UPDATE SET naziv_firme = EXCLUDED.naziv_firme;

    SELECT id INTO v_dobavljac_it_id FROM dobavljaci WHERE pib_id_broj = '4200000000001';
    SELECT id INTO v_dobavljac_mkt_id FROM dobavljaci WHERE pib_id_broj = '4200000000002';

    -- 6. Dohvatanje valute i kategorija
    SELECT id INTO v_valuta_bam_id FROM valute WHERE kod = 'BAM';
    SELECT id INTO v_kat_plate_id FROM kategorije WHERE naziv = 'Plate';
    SELECT id INTO v_kat_oprema_id FROM kategorije WHERE naziv = 'Oprema';
    SELECT id INTO v_kat_marketing_id FROM kategorije WHERE naziv = 'Marketing';
    SELECT id INTO v_kat_put_id FROM kategorije WHERE naziv = 'Putni troškovi';
    SELECT id INTO v_kat_zakup_id FROM kategorije WHERE naziv = 'Zakup';

    -- 7. Kreiranje budžeta
    -- Budžet 1: IT - Višemjesečni budžet (U granicama normale)
    INSERT INTO budzeti (naziv, planirani_iznos, datum_pocetka, datum_zavrsetka, odjel_id, projekat_id, verzija_budzeta, status_odobrenja, odobrio_korisnik_id)
    VALUES 
    ('Godišnja IT Oprema i Licence', 100000.00, date_trunc('month', CURRENT_DATE) - INTERVAL '2 months', date_trunc('month', CURRENT_DATE) + INTERVAL '2 months' - INTERVAL '1 day', v_odjel_it_id, v_projekat_it_id, 1, 'ODOBREN', v_direktor_id)
    RETURNING id INTO v_budzet_it_id;

    -- Budžet 2: Marketing - Višemjesečni budžet (Prekoračenje budžeta!)
    INSERT INTO budzeti (naziv, planirani_iznos, datum_pocetka, datum_zavrsetka, odjel_id, projekat_id, verzija_budzeta, status_odobrenja, odobrio_korisnik_id)
    VALUES 
    ('Marketing Q2 Kampanja', 15000.00, date_trunc('month', CURRENT_DATE) - INTERVAL '1 month', date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day', v_odjel_mkt_id, v_projekat_mkt_id, 1, 'ODOBREN', v_direktor_id)
    RETURNING id INTO v_budzet_mkt_id;

    -- Budžet 3: Finansije - Nacrt
    INSERT INTO budzeti (naziv, planirani_iznos, datum_pocetka, datum_zavrsetka, odjel_id, projekat_id, verzija_budzeta, status_odobrenja, odobrio_korisnik_id)
    VALUES 
    ('Zakup Ureda i Režije', 10000.00, date_trunc('month', CURRENT_DATE), date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day', v_odjel_fin_id, NULL, 1, 'NACRT', NULL)
    RETURNING id INTO v_budzet_fin_id;

    -- 8. Povezivanje budžeta i kategorija
    INSERT INTO budzet_kategorije (budzet_id, kategorija_id) VALUES
    (v_budzet_it_id, v_kat_plate_id),
    (v_budzet_it_id, v_kat_oprema_id),
    (v_budzet_mkt_id, v_kat_marketing_id),
    (v_budzet_mkt_id, v_kat_put_id),
    (v_budzet_fin_id, v_kat_zakup_id);

    -- 9. Kreiranje troškova za Budžet 1 (IT - Ukupno 100.000 KM)
    -- Troškovi prije ovog mjeseca (ukupno: 34.000 KM)
    INSERT INTO troskovi (naziv, iznos, datum, opis, kategorija_id, odjel_id, projekat_id, dobavljac_id, valuta_id, kreirao_korisnik_id, status_validacije)
    VALUES 
    ('Kupovina programerskih laptopa', 30000.00, date_trunc('month', CURRENT_DATE) - INTERVAL '1 month', 'Nabavka 10 novih Macbook Pro laptopa za dev tim.', v_kat_oprema_id, v_odjel_it_id, v_projekat_it_id, v_dobavljac_it_id, v_valuta_bam_id, v_racunovodja_id, 'VALIDAN'),
    ('Cloud Serveri (Prethodni mjesec)', 4000.00, date_trunc('month', CURRENT_DATE) - INTERVAL '45 days', 'Pretplata za AWS hosting.', v_kat_oprema_id, v_odjel_it_id, v_projekat_it_id, v_dobavljac_it_id, v_valuta_bam_id, v_racunovodja_id, 'VALIDAN');

    -- Troškovi u ovom mjesecu (ukupno: 8.000 KM)
    INSERT INTO troskovi (naziv, iznos, datum, opis, kategorija_id, odjel_id, projekat_id, dobavljac_id, valuta_id, kreirao_korisnik_id, status_validacije)
    VALUES 
    ('Godišnje licence za razvojni alat', 6000.00, CURRENT_DATE - INTERVAL '5 days', 'Licence za JetBrains i GitHub Copilot.', v_kat_oprema_id, v_odjel_it_id, v_projekat_it_id, v_dobavljac_it_id, v_valuta_bam_id, v_racunovodja_id, 'VALIDAN'),
    ('Novi dodatni monitori', 2000.00, CURRENT_DATE - INTERVAL '1 day', 'Kupovina 4 dodatna Dell monitora za kancelariju.', v_kat_oprema_id, v_odjel_it_id, v_projekat_it_id, v_dobavljac_it_id, v_valuta_bam_id, v_racunovodja_id, 'VALIDAN');


    -- 10. Kreiranje troškova za Budžet 2 (Marketing - Ukupno 15.000 KM)
    -- Troškovi prije ovog mjeseca (ukupno: 5.000 KM)
    INSERT INTO troskovi (naziv, iznos, datum, opis, kategorija_id, odjel_id, projekat_id, dobavljac_id, valuta_id, kreirao_korisnik_id, status_validacije)
    VALUES 
    ('Google Ads (Prošli mjesec)', 5000.00, date_trunc('month', CURRENT_DATE) - INTERVAL '15 days', 'Oglašavanje za lansiranje proizvoda.', v_kat_marketing_id, v_odjel_mkt_id, v_projekat_mkt_id, v_dobavljac_mkt_id, v_valuta_bam_id, v_racunovodja_id, 'VALIDAN');

    -- Troškovi u ovom mjesecu (ukupno: 12.000 KM -> Brz tempo trošenja!)
    INSERT INTO troskovi (naziv, iznos, datum, opis, kategorija_id, odjel_id, projekat_id, dobavljac_id, valuta_id, kreirao_korisnik_id, status_validacije)
    VALUES 
    ('Sponzorstvo tehnološke konferencije', 8000.00, CURRENT_DATE - INTERVAL '10 days', 'Glavno sponzorstvo za IT Day.', v_kat_marketing_id, v_odjel_mkt_id, v_projekat_mkt_id, v_dobavljac_mkt_id, v_valuta_bam_id, v_racunovodja_id, 'VALIDAN'),
    ('Social Media kampanje (FB/Insta)', 4000.00, CURRENT_DATE - INTERVAL '2 days', 'Tekuće sedmično oglašavanje.', v_kat_marketing_id, v_odjel_mkt_id, v_projekat_mkt_id, v_dobavljac_mkt_id, v_valuta_bam_id, v_racunovodja_id, 'VALIDAN');

END $$;
