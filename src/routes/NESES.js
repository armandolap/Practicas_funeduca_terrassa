const router = require("express").Router();
const neses = require("../controllers/NESES");

router.get("/", neses.getAllNESES);

router.get("/:id", neses.getNESESById);

module.exports = router;