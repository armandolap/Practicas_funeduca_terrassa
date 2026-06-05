const router = require("express").Router();
const situacioEco = require("../controllers/situacio_eco");

router.get("/", situacioEco.getAllsituacio_eco);

router.get("/:id", situacioEco.getsituacio_ecoById);

module.exports = router;