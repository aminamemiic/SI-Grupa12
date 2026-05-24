const { db } = require("../ApDbContext/AppDB");

class DataOverviewRepository {
  async getOverview() {
    const result = await db.query(`
      SELECT
        COALESCE((
          SELECT json_agg(row_to_json(t))
          FROM (
            SELECT
              tr.id,
              tr.naziv,
              tr.iznos,
              tr.datum,
              tr.opis,
              tr.status_validacije AS "statusValidacije",
              tr.kategorija_id AS "kategorijaId",
              k.naziv AS "kategorijaNaziv",
              tr.odjel_id AS "odjelId",
              o.naziv AS "odjelNaziv",
              tr.valuta_id AS "valutaId",
              v.kod AS "valutaKod",
              v.naziv AS "valutaNaziv",
              tr.projekat_id AS "projekatId",
              p.naziv_projekta AS "projekatNaziv",
              tr.dobavljac_id AS "dobavljacId",
              d.naziv_firme AS "dobavljacNaziv",
              tr.kreirao_korisnik_id AS "kreiraoKorisnikId"
            FROM troskovi tr
            LEFT JOIN kategorije k ON k.id = tr.kategorija_id
            LEFT JOIN odjeli o ON o.id = tr.odjel_id
            LEFT JOIN valute v ON v.id = tr.valuta_id
            LEFT JOIN projekti p ON p.id = tr.projekat_id
            LEFT JOIN dobavljaci d ON d.id = tr.dobavljac_id
            WHERE tr.status_validacije <> 'POTENCIJALNI_DUPLIKAT'
            ORDER BY tr.datum DESC, tr.naziv ASC
          ) t
        ), '[]'::json) AS troskovi,
        COALESCE((
          SELECT json_agg(row_to_json(b))
          FROM (
            SELECT
              bud.id,
              bud.naziv,
              bud.planirani_iznos AS "planiraniIznos",
              bud.datum_pocetka AS "datumPocetka",
              bud.datum_zavrsetka AS "datumZavrsetka",
              bud.odjel_id AS "odjelId",
              o.naziv AS "odjelNaziv",
              bud.projekat_id AS "projekatId",
              p.naziv_projekta AS "projekatNaziv",
              bud.verzija_budzeta AS "verzijaBudzeta",
              bud.status_odobrenja AS "statusOdobrenja",
              bud.odobrio_korisnik_id AS "odobrioKorisnikId",
              COALESCE(json_agg(
                json_build_object('id', k.id, 'naziv', k.naziv)
                ORDER BY k.naziv
              ) FILTER (WHERE k.id IS NOT NULL), '[]'::json) AS kategorije,
              COALESCE(json_agg(k.id ORDER BY k.naziv) FILTER (WHERE k.id IS NOT NULL), '[]'::json) AS "kategorijaIds"
            FROM budzeti bud
            LEFT JOIN odjeli o ON o.id = bud.odjel_id
            LEFT JOIN projekti p ON p.id = bud.projekat_id
            LEFT JOIN budzet_kategorije bk ON bk.budzet_id = bud.id
            LEFT JOIN kategorije k ON k.id = bk.kategorija_id
            GROUP BY bud.id, o.naziv, p.naziv_projekta
            ORDER BY bud.datum_pocetka DESC, bud.naziv ASC
          ) b
        ), '[]'::json) AS budzeti,
        COALESCE((
          SELECT json_agg(row_to_json(k))
          FROM (
            SELECT id, naziv, opis
            FROM kategorije
            ORDER BY naziv ASC
          ) k
        ), '[]'::json) AS kategorije,
        COALESCE((
          SELECT json_agg(row_to_json(o))
          FROM (
            SELECT id, naziv, sifra_odjela AS "sifraOdjela", rukovodilac_id AS "rukovodilacId"
            FROM odjeli
            ORDER BY naziv ASC
          ) o
        ), '[]'::json) AS odjeli,
        COALESCE((
          SELECT json_agg(row_to_json(v))
          FROM (
            SELECT id, kod, naziv
            FROM valute
            ORDER BY kod ASC
          ) v
        ), '[]'::json) AS valute,
        COALESCE((
          SELECT json_agg(row_to_json(p))
          FROM (
            SELECT
              id,
              naziv_projekta AS "nazivProjekta",
              sifra_projekta AS "sifraProjekta",
              budzet_projekta AS "budzetProjekta",
              datum_pocetak AS "datumPocetak",
              datum_zavrsetak AS "datumZavrsetak",
              menadzer_id AS "menadzerId",
              status
            FROM projekti
            ORDER BY naziv_projekta ASC
          ) p
        ), '[]'::json) AS projekti,
        COALESCE((
          SELECT json_agg(row_to_json(d))
          FROM (
            SELECT
              id,
              naziv_firme AS "nazivFirme",
              pib_id_broj AS "pibIdBroj",
              adresa,
              rejting_pouzdanosti AS "rejtingPouzdanosti"
            FROM dobavljaci
            ORDER BY naziv_firme ASC
          ) d
        ), '[]'::json) AS dobavljaci;
    `);

    return this.mapOverview(result.rows[0] || {});
  }

  private mapOverview(row: any) {
    const toArray = (value: any) => (Array.isArray(value) ? value : []);
    const toNumber = (value: any) => (value === null || value === undefined ? value : Number(value));

    return {
      troskovi: toArray(row.troskovi).map((trosak: any) => ({
        ...trosak,
        iznos: toNumber(trosak.iznos),
      })),
      budzeti: toArray(row.budzeti).map((budzet: any) => ({
        ...budzet,
        planiraniIznos: toNumber(budzet.planiraniIznos),
        verzijaBudzeta: toNumber(budzet.verzijaBudzeta),
        kategorije: toArray(budzet.kategorije),
        kategorijaIds: toArray(budzet.kategorijaIds),
      })),
      kategorije: toArray(row.kategorije),
      odjeli: toArray(row.odjeli),
      valute: toArray(row.valute),
      projekti: toArray(row.projekti).map((projekat: any) => ({
        ...projekat,
        budzetProjekta: toNumber(projekat.budzetProjekta),
      })),
      dobavljaci: toArray(row.dobavljaci).map((dobavljac: any) => ({
        ...dobavljac,
        rejtingPouzdanosti: toNumber(dobavljac.rejtingPouzdanosti),
      })),
    };
  }
}

module.exports = { DataOverviewRepository };

