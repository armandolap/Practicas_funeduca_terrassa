const router = require("express").Router();
const tipusDomicili= require("../controllers/tipus_domicili");

router.get("/", tipusDomicili.getAlltipus_domicili);

router.get("/:id", tipusDomicili.getTipus_domiciliById);

module.exports = router;