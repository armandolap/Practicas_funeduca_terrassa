const router = require("express").Router();
const ctrl = require("../controllers/familia");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, ctrl.getAllFamilias);
router.get("/search", requireAuth, ctrl.searchFamilies);
router.get("/checkName", requireAuth, ctrl.checkFamilyName);
router.post("/", requireAuth, ctrl.createFamilia);
router.get("/:id", requireAuth, ctrl.getFamiliaById);
router.put("/:id", requireAuth, ctrl.updateFamilia);
router.delete("/:id", requireAuth, ctrl.deleteFamilia);

module.exports = router;
