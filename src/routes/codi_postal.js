const router = require("express").Router();
const codi_postal = require("../controllers/codi_postal");

router.get("/", codi_postal.getAllCodi_postal);
router.post("/", codi_postal.createCodi_postal);
router.get("/:id", codi_postal.getCodi_postalById);
router.put("/:id", codi_postal.updateCodi_postal);
router.delete("/:id", codi_postal.deleteCodi_postal);

module.exports = router;
