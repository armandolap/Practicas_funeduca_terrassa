const router = require("express").Router();
const motiuBaixa = require("../controllers/motiu_baixa");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, motiuBaixa.getAllMotiu_baixa);

router.get("/:id", requireAuth, motiuBaixa.getMotiu_baixaById);

module.exports = router;