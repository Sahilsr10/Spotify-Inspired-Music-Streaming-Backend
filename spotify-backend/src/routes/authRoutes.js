const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, toggleFollow } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../middleware/validate");

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/follow/:userId", protect, toggleFollow);

module.exports = router;
