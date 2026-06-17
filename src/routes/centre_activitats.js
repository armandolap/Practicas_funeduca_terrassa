const router = require("express").Router();
const centreActivitatsController = require("../controllers/centre_activitats");

router.get("/", centreActivitatsController.getAll);
router.get("/search", centreActivitatsController.search);
router.get("/:id", centreActivitatsController.getById);
router.post("/", centreActivitatsController.create);
router.put("/:id", centreActivitatsController.update);
router.delete("/:id", centreActivitatsController.remove);

module.exports = router;
