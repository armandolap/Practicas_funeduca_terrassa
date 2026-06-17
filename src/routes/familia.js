const router = require("express").Router();
const famili = require("../controllers/familia");

router.get("/", famili.getAllFamilias);
router.get("/search", famili.searchFamilies);
router.post("/", famili.createFamilia);

router.get("/:id", famili.getFamiliaById);
router.put("/:id", famili.updateFamilia);
router.delete("/:id", famili.deleteFamilia);

module.exports = router;