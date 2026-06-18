const router = require("express").Router();
const callejero = require("../controllers/callejero");
const { requireAuth, requireTotal } = require("../middlewares/auth");

router.get("/", callejero.searchCallejero);
router.get("/:id", callejero.getCallejeroById);
router.post("/", requireAuth, requireTotal, callejero.createCallejero);

module.exports = router;
