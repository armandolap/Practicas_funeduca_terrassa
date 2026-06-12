const router = require("express").Router();
const tipus_via = require("../controllers/tipus_via");

router.get("/", tipus_via.getAllTipus_via);
router.post("/", tipus_via.createTipus_via);
router.get("/:id", tipus_via.getTipus_viaById);
router.put("/:id", tipus_via.updateTipus_via);
router.delete("/:id", tipus_via.deleteTipus_via);

module.exports = router;
