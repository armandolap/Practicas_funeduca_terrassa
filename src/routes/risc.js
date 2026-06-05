const router = require("express").Router();
const risc = require("../controllers/risc");

router.get("/", risc.getAllRiscos);

router.get("/:id", risc.getRiscosById);

module.exports = router;