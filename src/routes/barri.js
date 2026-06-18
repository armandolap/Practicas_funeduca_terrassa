const router = require("express").Router();
const barri = require("../controllers/barri");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, barri.getAllBarri);
router.post("/", requireAuth, barri.createBarri);
router.get("/:id", requireAuth, barri.getBarriById);
router.put("/:id", requireAuth, barri.updateBarri);
router.delete("/:id", requireAuth, barri.deleteBarri);

module.exports = router;
