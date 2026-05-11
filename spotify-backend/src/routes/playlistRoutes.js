const express = require("express");
const router = express.Router();
const {
  createPlaylist, getAllPlaylists, getPlaylist, getMyPlaylists,
  updatePlaylist, deletePlaylist, addSong, removeSong, toggleFollow,
} = require("../controllers/playlistController");
const { protect, optionalAuth } = require("../middleware/auth");
const { validatePlaylist } = require("../middleware/validate");

router.get("/", getAllPlaylists);
router.get("/my", protect, getMyPlaylists);
router.get("/:id", optionalAuth, getPlaylist);
router.post("/", protect, validatePlaylist, createPlaylist);
router.put("/:id", protect, updatePlaylist);
router.delete("/:id", protect, deletePlaylist);
router.post("/:id/songs", protect, addSong);
router.delete("/:id/songs/:songId", protect, removeSong);
router.post("/:id/follow", protect, toggleFollow);

module.exports = router;
