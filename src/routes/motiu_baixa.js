const router = require("express").Router();
const motiuBaixa = require("../controllers/motiu_baixa");

router.get("/", motiuBaixa.getAllMotiuBaixa);

router.get("/:id", motiuBaixa.getMotiuBaixaById);

module.exports = router;