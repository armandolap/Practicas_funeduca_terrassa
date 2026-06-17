const router = require("express").Router();
const authController = require("../controllers/auth");
const { requireAuth } = require("../middlewares/auth");

router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);

module.exports = router;
