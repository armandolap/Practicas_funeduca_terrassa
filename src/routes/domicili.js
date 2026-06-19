const router = require("express").Router();
const ctrl = require("../controllers/domicili");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, ctrl.getAllDomicilis);
router.get("/search", requireAuth, ctrl.searchDomicilisCarrer);
router.get("/byFamily/:idFamilia", requireAuth, ctrl.getDomicilisByFamily);
router.post("/", requireAuth, ctrl.createDomicili);
router.get("/:id", requireAuth, ctrl.getDomiciliById);
router.put("/:id", requireAuth, ctrl.updateDomicili);
router.delete("/:id", requireAuth, ctrl.deleteDomicili);

module.exports = router;
