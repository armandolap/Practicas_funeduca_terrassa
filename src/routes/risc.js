const router = require("express").Router();
const risc = require("../controllers/risc");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, risc.getAllRisc);

router.get("/:id", requireAuth, risc.getRiscById);

module.exports = router;