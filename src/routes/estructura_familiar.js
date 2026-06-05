const router = require("express").Router();
const estFamiliar = require("../controllers/estructura_familiar");

router.get("/", estFamiliar.getAllEstructura_familiar);

router.get("/:id", estFamiliar.getEstructura_familiarById);

module.exports = router;