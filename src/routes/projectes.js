const router = require("express").Router();
const ctrl = require("../controllers/projectes");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, ctrl.getAllProjectes);
router.post("/", requireAuth, ctrl.createProject);
router.get("/usuaris-per-nivell", requireAuth, ctrl.getUsuarisPerNivell);
router.get("/centre/:id", requireAuth, ctrl.getProjectesByCentre);
router.get("/:id", requireAuth, ctrl.getProjectesById);
router.put("/:id", requireAuth, ctrl.updateProject);
router.delete("/:id", requireAuth, ctrl.deleteProject);
router.post("/:id/clients", requireAuth, ctrl.addClients);
router.delete("/:id/clients/:idClient", requireAuth, ctrl.removeClient);

module.exports = router;
