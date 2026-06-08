const router = require("express").Router();
const projectes = require("../controllers/projectes");

router.get("/", projectes.getAllProjectes);

router.post("/", projectes.createProject);

router.get("/:id", projectes.getProjectesById);

// falten editar i actualizar ( put i post ) 

module.exports = router;