const router = require("express").Router();
const barri = require("../controllers/barri");

router.get("/", barri.getAllBarri);
router.post("/", barri.createBarri);
router.get("/:id", barri.getBarriById);
router.put("/:id", barri.updateBarri);
router.delete("/:id", barri.deleteBarri);

module.exports = router;
