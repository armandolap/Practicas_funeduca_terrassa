const router = require("express").Router();
const neses = require("../controllers/NESES");

router.get("/", neses.getAllNESES);
router.post("/",neses.createNESES);

router.get("/:id", neses.getNESESById);
router.put("/:id",neses.updateNESES);
router.delete("/:id",neses.deleteNESES);

module.exports = router;