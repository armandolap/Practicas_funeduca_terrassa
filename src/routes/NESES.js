const router = require("express").Router();
const neses = require("../controllers/NESES");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, neses.getAllNESES);
router.post("/", requireAuth, neses.createNESES);

router.get("/:id", requireAuth, neses.getNESESById);
router.put("/:id", requireAuth, neses.updateNESES);
router.delete("/:id", requireAuth, neses.deleteNESES);

module.exports = router;