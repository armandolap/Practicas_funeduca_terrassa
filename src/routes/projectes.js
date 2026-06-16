const router = require("express").Router();
const projectes = require("../controllers/projectes");

router.get("/", projectes.getAllProjectes);

router.post("/", projectes.createProject);

router.get("/:id", projectes.getProjectesById);

router.put("/:id", projectes.updateProject);

router.delete("/:id", projectes.deleteProject);

module.exports = router;