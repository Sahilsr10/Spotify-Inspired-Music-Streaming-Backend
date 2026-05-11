const express = require("express");
const router = express.Router();
const {
  createSong, getAllSongs, getSong, updateSong,
  deleteSong, playSong, toggleLike, getTrendingSongs,
} = require("../controllers/songController");
const { protect, optionalAuth } = require("../middleware/auth");
const { validateSong } = require("../middleware/validate");

router.get("/trending", getTrendingSongs);
router.get("/", getAllSongs);
router.get("/:id", optionalAuth, getSong);
router.post("/", protect, validateSong, createSong);
router.put("/:id", protect, updateSong);
router.delete("/:id", protect, deleteSong);
router.post("/:id/play", playSong);
router.post("/:id/like", protect, toggleLike);

module.exports = router;
