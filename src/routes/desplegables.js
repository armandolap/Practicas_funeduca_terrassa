const router = require("express").Router();
const desplegables = require("../controllers/desplegables");

router.get("/:name", desplegables.getDesplegable);

module.exports = router;
