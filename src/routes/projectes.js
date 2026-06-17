const router = require("express").Router();
const ctrl = require("../controllers/projectes");

router.get("/", ctrl.getAllProjectes);
router.post("/", ctrl.createProject);
router.get("/:id", ctrl.getProjectesById);
router.put("/:id", ctrl.updateProject);
router.delete("/:id", ctrl.deleteProject);
router.post("/:id/clients", ctrl.addClients);
router.delete("/:id/clients/:idClient", ctrl.removeClient);

module.exports = router;
