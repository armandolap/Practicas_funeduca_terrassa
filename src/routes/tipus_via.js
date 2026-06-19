const router = require("express").Router();
const tipus_via = require("../controllers/tipus_via");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, tipus_via.getAllTipus_via);
router.post("/", requireAuth, tipus_via.createTipus_via);
router.get("/:id", requireAuth, tipus_via.getTipus_viaById);
router.put("/:id", requireAuth, tipus_via.updateTipus_via);
router.delete("/:id", requireAuth, tipus_via.deleteTipus_via);

module.exports = router;
