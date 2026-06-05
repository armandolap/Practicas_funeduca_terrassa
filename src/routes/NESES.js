const router = require("express").Router();
const neses = require("../controllers/NESES");

router.get("/", neses.getAllNeses);

router.get("/:id", neses.getNesesById);

module.exports = router;