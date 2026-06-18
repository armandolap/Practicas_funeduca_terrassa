const router = require("express").Router();
const sebas = require("../controllers/SEBAS");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, sebas.getAllSEBAS);

router.get("/:id", requireAuth, sebas.getSEBASById);

module.exports = router;