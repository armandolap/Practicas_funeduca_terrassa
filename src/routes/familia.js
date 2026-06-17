const router = require("express").Router();
const ctrl = require("../controllers/familia");

router.get("/", ctrl.getAllFamilias);
router.get("/search", ctrl.searchFamilies);
router.get("/checkName", ctrl.checkFamilyName);
router.post("/", ctrl.createFamilia);
router.get("/:id", ctrl.getFamiliaById);
router.put("/:id", ctrl.updateFamilia);
router.delete("/:id", ctrl.deleteFamilia);

module.exports = router;
