const router = require("express").Router();
const ctrl = require("../controllers/client");

router.get("/", ctrl.getAllClients);
router.post("/", ctrl.createClient);
router.post("/full", ctrl.createFullClient);
router.put("/:id/full", ctrl.updateFullClient);
router.get("/:id", ctrl.getClientById);
router.put("/:id", ctrl.updateClient);
router.delete("/:id", ctrl.deleteClient);

module.exports = router;
