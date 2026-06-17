const router = require("express").Router();
const reports = require("../controllers/reports");

router.get("/projectes/generesEdats", reports.projectesGeneresEdats);
router.get("/genere", reports.genere);
router.get("/sitEco", reports.sitEco);
router.get("/rolFam", reports.rolFam);
router.get("/tipHab", reports.tipHab);
router.get("/cont", reports.cont);
router.get("/neses", reports.neses);
router.get("/sebasDev", reports.sebasDev);
router.get("/cursAny/:any", reports.cursAny);
router.get("/resAcad", reports.resAcad);
router.get("/motiusBaixa", reports.motiusBaixa);
router.get("/riscos", reports.riscos);
router.get("/paisos", reports.paisos);

module.exports = router;
