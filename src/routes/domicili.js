const router = require("express").Router();
const domicili = require("../controllers/domicili");

router.get("/", domicili.getAllDomicilis);
router.get("/byFamily/:idFamilia", domicili.getDomicilisByFamily);
router.post("/", domicili.createDomicili);

router.get("/:id", domicili.getDomiciliById);
router.put("/:id", domicili.updateDomicili);
router.delete("/:id", domicili.deleteDomicili);

module.exports = router;