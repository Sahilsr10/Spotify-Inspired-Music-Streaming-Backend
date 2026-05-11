const Playlist = require("../models/Playlist");
const Song = require("../models/Song");

// @desc    Create a playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, tags } = req.body;
    const playlist = await Playlist.create({
      name, description, isPublic, tags,
      owner: req.user._id,
    });
    res.status(201).json({ success: true, message: "Playlist created", playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all public playlists
// @route   GET /api/playlists
// @access  Public
const getAllPlaylists = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { isPublic: true };
    if (search) query.name = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);
    const [playlists, total] = await Promise.all([
      Playlist.find(query)
        .populate("owner", "username profilePicture")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Playlist.countDocuments(query),
    ]);

    res.json({ success: true, total, page: Number(page), playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single playlist
// @route   GET /api/playlists/:id
// @access  Public (with private guard)
const getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("owner", "username profilePicture")
      .populate({ path: "songs.song", populate: { path: "artist", select: "username" } });

    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
    if (!playlist.isPublic && playlist.owner._id.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ success: false, message: "This playlist is private" });
    }

    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my playlists
// @route   GET /api/playlists/my
// @access  Private
const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .sort("-updatedAt")
      .populate("songs.song", "title coverImage duration");
    res.json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update playlist details
// @route   PUT /api/playlists/:id
// @access  Private (owner only)
const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const allowed = ["name", "description", "coverImage", "isPublic", "tags"];
    allowed.forEach((f) => { if (req.body[f] !== undefined) playlist[f] = req.body[f]; });
    await playlist.save();

    res.json({ success: true, message: "Playlist updated", playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private (owner only)
const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await playlist.deleteOne();
    res.json({ success: true, message: "Playlist deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
// @access  Private (owner only)
const addSong = async (req, res) => {
  try {
    const { songId } = req.body;
    const [playlist, song] = await Promise.all([
      Playlist.findById(req.params.id),
      Song.findById(songId),
    ]);

    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const exists = playlist.songs.some((s) => s.song.toString() === songId);
    if (exists) return res.status(409).json({ success: false, message: "Song already in playlist" });

    playlist.songs.push({ song: songId });
    await playlist.save();

    res.json({ success: true, message: `"${song.title}" added to playlist`, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private (owner only)
const removeSong = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    playlist.songs = playlist.songs.filter((s) => s.song.toString() !== req.params.songId);
    await playlist.save();

    res.json({ success: true, message: "Song removed from playlist", playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Follow / Unfollow a playlist
// @route   POST /api/playlists/:id/follow
// @access  Private
const toggleFollow = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

    const isFollowing = playlist.followers.includes(req.user._id);
    if (isFollowing) {
      await Playlist.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
      res.json({ success: true, message: "Unfollowed playlist", following: false });
    } else {
      await Playlist.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });
      res.json({ success: true, message: "Following playlist", following: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPlaylist, getAllPlaylists, getPlaylist, getMyPlaylists, updatePlaylist, deletePlaylist, addSong, removeSong, toggleFollow };
