const router = require("express").Router();
const desplegables = require("../controllers/desplegables");
const { requireAuth } = require("../middlewares/auth");

router.get("/:name", requireAuth, desplegables.getDesplegable);

module.exports = router;
