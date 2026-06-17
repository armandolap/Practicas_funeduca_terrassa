const barriRepo = require("../repositories/barri");
const codiPostalRepo = require("../repositories/codi_postal");
const cursoRepo = require("../repositories/curso");
const estFamiliarRepo = require("../repositories/estructura_familiar");
const motiuBaixaRepo = require("../repositories/motiu_baixa");
const nesesRepo = require("../repositories/NESES");
const paisosRepo = require("../repositories/paisos");
const resulAcadRepo = require("../repositories/resul_acad");
const riscRepo = require("../repositories/risc");
const rolRepo = require("../repositories/rol");
const sebasRepo = require("../repositories/SEBAS");
const sitEcoRepo = require("../repositories/situacio_eco");
const tipusDomRepo = require("../repositories/tipus_domicili");
const tipusViaRepo = require("../repositories/tipus_via");

const genereRepo = require("../repositories/genere");

const MAP = {
  barri:              { repo: barriRepo,       idKey: "idBarri",             nomKey: "Nom" },
  codi_postal:        { repo: codiPostalRepo,   idKey: "idCodi_postal",       nomKey: "Codi" },
  curso:              { repo: cursoRepo,         idKey: "idCurs_actual",       nomKey: "Nom" },
  estructura_familiar: { repo: estFamiliarRepo,  idKey: "idEstructura_familiar", nomKey: "Nom_est_fam" },
  genere:             { repo: genereRepo,       idKey: "idGenere",            nomKey: "Nom_genere" },
  motiu_baixa:        { repo: motiuBaixaRepo,   idKey: "idMotiu_baixa",       nomKey: "Nom_motiu_baixa" },
  neses:              { repo: nesesRepo,        idKey: "idNecessitat_especial", nomKey: "Nom_necessitat" },
  pais:               { repo: paisosRepo,       idKey: "idPais",              nomKey: "Nom_pais" },
  resul_acad:         { repo: resulAcadRepo,    idKey: "idResultat_academic",  nomKey: "Nom_resultat_acad" },
  risc:               { repo: riscRepo,         idKey: "idRisc",              nomKey: "Nivel" },
  rol:                { repo: rolRepo,          idKey: "idRol",               nomKey: "Nom_rol" },
  sebas:              { repo: sebasRepo,        idKey: "idSebas",            nomKey: "Nom" },
  situacio_eco:       { repo: sitEcoRepo,       idKey: "idSituacio_economica", nomKey: "Nom" },
  tipus_domicili:     { repo: tipusDomRepo,     idKey: "idTipus_domicili",    nomKey: "Nom_domicili" },
  tipus_via:          { repo: tipusViaRepo,     idKey: "idTipus_via",         nomKey: "Nom" },
};

async function getDesplegable(req, res) {
  const { name } = req.params;
  const entry = MAP[name];

  if (!entry) {
    return res.status(404).json({ message: `Desplegable "${name}" no trobat` });
  }

  try {
    const rows = await entry.repo.getAll();
    const result = rows.map(r => ({ id: r[entry.idKey], Nom: r[entry.nomKey] }));
    res.json(result);
  } catch (err) {
    console.error(`Error en desplegable "${name}":`, err);
    res.status(500).json({ message: "Error intern" });
  }
}

module.exports = { getDesplegable };
