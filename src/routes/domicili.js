const router = require("express").Router();
const ctrl = require("../controllers/domicili");

router.get("/", ctrl.getAllDomicilis);
router.get("/search", ctrl.searchDomicilisCarrer);
router.get("/byFamily/:idFamilia", ctrl.getDomicilisByFamily);
router.post("/", ctrl.createDomicili);
router.get("/:id", ctrl.getDomiciliById);
router.put("/:id", ctrl.updateDomicili);
router.delete("/:id", ctrl.deleteDomicili);

module.exports = router;
