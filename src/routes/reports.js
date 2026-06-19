const router = require("express").Router();
const ctrl = require("../controllers/reports");
const { requireAuth } = require("../middlewares/auth");

router.get("/projectes/generesEdats", requireAuth, ctrl.getProjectesGeneresEdats);
router.get("/genere", requireAuth, ctrl.getGenere);
router.get("/sitEco", requireAuth, ctrl.getSitEco);
router.get("/rolFam", requireAuth, ctrl.getRolFam);
router.get("/tipHab", requireAuth, ctrl.getTipHab);
router.get("/cont", requireAuth, ctrl.getCont);
router.get("/neses", requireAuth, ctrl.getNeses);
router.get("/sebasDev", requireAuth, ctrl.getSebasDev);
router.get("/cursAny/:any", requireAuth, ctrl.getCursAny);
router.get("/cursAcademic", requireAuth, ctrl.getCursAcademic);
router.get("/resAcad", requireAuth, ctrl.getResAcad);
router.get("/motiusBaixa", requireAuth, ctrl.getMotiusBaixa);
router.get("/riscos", requireAuth, ctrl.getRiscos);
router.get("/paisos", requireAuth, ctrl.getPaisos);

module.exports = router;
