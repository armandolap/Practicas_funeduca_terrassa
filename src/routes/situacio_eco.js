const router = require("express").Router();
const situacioEco = require("../controllers/situacio_eco");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, situacioEco.getAllsituacio_eco);

router.get("/:id", requireAuth, situacioEco.getsituacio_ecoById);

module.exports = router;