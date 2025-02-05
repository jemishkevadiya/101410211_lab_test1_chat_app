const express = require("express");
const { signup, login, getUserProfile, logout } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", verifyToken, getUserProfile);
router.post("/logout", logout);

module.exports = router;
