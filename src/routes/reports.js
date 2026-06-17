const router = require("express").Router();
const ctrl = require("../controllers/reports");

router.get("/projectes/generesEdats", ctrl.getProjectesGeneresEdats);
router.get("/genere", ctrl.getGenere);
router.get("/sitEco", ctrl.getSitEco);
router.get("/rolFam", ctrl.getRolFam);
router.get("/tipHab", ctrl.getTipHab);
router.get("/cont", ctrl.getCont);
router.get("/neses", ctrl.getNeses);
router.get("/sebasDev", ctrl.getSebasDev);
router.get("/cursAny/:any", ctrl.getCursAny);
router.get("/resAcad", ctrl.getResAcad);
router.get("/motiusBaixa", ctrl.getMotiusBaixa);
router.get("/riscos", ctrl.getRiscos);
router.get("/paisos", ctrl.getPaisos);

module.exports = router;
