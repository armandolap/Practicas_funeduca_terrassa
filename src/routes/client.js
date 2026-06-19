const router = require("express").Router();
const ctrl = require("../controllers/client");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, ctrl.getAllClients);
router.post("/", requireAuth, ctrl.createClient);
router.post("/full", requireAuth, ctrl.createFullClient);
router.put("/:id/full", requireAuth, ctrl.updateFullClient);
router.get("/:id", requireAuth, ctrl.getClientById);
router.put("/:id", requireAuth, ctrl.updateClient);
router.delete("/:id", requireAuth, ctrl.deleteClient);

module.exports = router;
