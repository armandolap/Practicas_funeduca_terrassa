const router = require("express").Router();
const estFamiliar = require("../controllers/estructura_familiar");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, estFamiliar.getAllEstructura_familiar);

router.get("/:id", requireAuth, estFamiliar.getEstructura_familiarById);

module.exports = router;