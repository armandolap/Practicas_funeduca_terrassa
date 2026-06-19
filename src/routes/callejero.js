const router = require("express").Router();
const callejero = require("../controllers/callejero");
const { requireAuth, requireTotal } = require("../middlewares/auth");

router.get("/", requireAuth, callejero.searchCallejero);
router.get("/:id", requireAuth, callejero.getCallejeroById);
router.post("/", requireAuth, requireTotal, callejero.createCallejero);

module.exports = router;
