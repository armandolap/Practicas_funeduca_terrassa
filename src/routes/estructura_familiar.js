const router = require("express").Router();
const estFamiliar = require("../controllers/estructura_familiar");

router.get("/", estFamiliar.getAllestFamiliar);

router.get("/:id", estFamiliar.getestFamiliarById);

module.exports = router;