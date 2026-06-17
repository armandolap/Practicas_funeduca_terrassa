const router = require("express").Router();
const genere = require("../controllers/genere");

router.get("/", genere.getAllGenere);
router.get("/:id", genere.getGenereById);

module.exports = router;
