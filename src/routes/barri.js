const router = require("express").Router();
const barri = require("../controllers/barri");
const { requireAuth } = require("../middlewares/auth");

router.get("/", barri.getAllBarri);
router.post("/",requireAuth, barri.createBarri);
router.get("/:id", barri.getBarriById);
router.put("/:id",requireAuth, barri.updateBarri);
router.delete("/:id",requireAuth, barri.deleteBarri);

module.exports = router;
