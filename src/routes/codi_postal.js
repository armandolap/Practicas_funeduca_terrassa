const router = require("express").Router();
const codi_postal = require("../controllers/codi_postal");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, codi_postal.getAllCodi_postal);
router.post("/", requireAuth, codi_postal.createCodi_postal);
router.get("/:id", requireAuth, codi_postal.getCodi_postalById);
router.put("/:id", requireAuth, codi_postal.updateCodi_postal);
router.delete("/:id", requireAuth, codi_postal.deleteCodi_postal);

module.exports = router;
