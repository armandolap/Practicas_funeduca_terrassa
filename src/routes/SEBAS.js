const router = require("express").Router();
const sebas = require("../controllers/SEBAS");

router.get("/", sebas.getAllSEBAS);

router.get("/:id", sebas.getSEBASById);

module.exports = router;