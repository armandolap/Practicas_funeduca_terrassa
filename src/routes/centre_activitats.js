const router = require("express").Router();
const ctrl = require("../controllers/centre_activitats");

router.get("/", ctrl.getAll);
router.get("/search", ctrl.search);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
