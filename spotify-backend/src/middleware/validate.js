const { body, validationResult } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3–30 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

const validateLogin = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Song validations
const validateSong = [
  body("title").trim().notEmpty().withMessage("Song title is required"),
  body("duration")
    .isNumeric()
    .withMessage("Duration must be a number (in seconds)"),
  body("audioUrl").notEmpty().withMessage("Audio URL is required"),
  handleValidationErrors,
];

// Playlist validations
const validatePlaylist = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Playlist name must be 1–100 characters"),
  handleValidationErrors,
];

module.exports = { validateRegister, validateLogin, validateSong, validatePlaylist };
