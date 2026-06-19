const router = require("express").Router();
const genere = require("../controllers/genere");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, genere.getAllGenere);
router.get("/:id", requireAuth, genere.getGenereById);

module.exports = router;
