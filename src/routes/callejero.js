const router = require("express").Router();
const callejero = require("../controllers/callejero");

router.get("/", callejero.searchCallejero);
router.get("/:id", callejero.getCallejeroById);

module.exports = router;
