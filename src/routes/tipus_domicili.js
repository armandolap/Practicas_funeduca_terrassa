const router = require("express").Router();
const tipusDomicili = require("../controllers/tipus_domicili");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, tipusDomicili.getAlltipus_domicili);

router.get("/:id", requireAuth, tipusDomicili.getTipus_domiciliById);

module.exports = router;