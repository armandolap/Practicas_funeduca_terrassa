const router = require("express").Router();
const famili = require("../controllers/famili");

router.get("/", famili.getAllFamilias);
router.post("/", famili.createFamilia);

router.get("/:id", famili.getFamiliaById);
router.put("/:id", famili.updateFamilia);
router.delete("/:id", famili.deleteFamilia);

module.exports = router;