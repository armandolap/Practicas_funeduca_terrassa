const router = require("express").Router();
const risc = require("../controllers/risc");

router.get("/", risc.getAllRisc);

router.get("/:id", risc.getRiscById);

module.exports = router;