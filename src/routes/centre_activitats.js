const router = require("express").Router();
const ctrl = require("../controllers/centre_activitats");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, ctrl.getAll);
router.get("/search", requireAuth, ctrl.search);
router.get("/:id", requireAuth, ctrl.getById);
router.post("/", requireAuth, ctrl.create);
router.put("/:id", requireAuth, ctrl.update);
router.delete("/:id", requireAuth, ctrl.remove);

module.exports = router;
