const router = require("express").Router();
const motiuBaixa = require("../controllers/motiu_baixa");

router.get("/", motiuBaixa.getAllMotiu_baixa);

router.get("/:id", motiuBaixa.getMotiu_baixaById);

module.exports = router;