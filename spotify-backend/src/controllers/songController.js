const Song = require("../models/Song");
const User = require("../models/User");

// @desc    Upload / Create a song
// @route   POST /api/songs
// @access  Private
const createSong = async (req, res) => {
  try {
    const { title, album, genre, duration, audioUrl, coverImage, lyrics, releaseDate } = req.body;

    const song = await Song.create({
      title, album, genre, duration, audioUrl,
      coverImage, lyrics, releaseDate,
      artist: req.user._id,
    });

    await song.populate("artist", "username profilePicture");
    res.status(201).json({ success: true, message: "Song uploaded", song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all public songs (with filters & pagination)
// @route   GET /api/songs
// @access  Public
const getAllSongs = async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 20, sort = "-createdAt" } = req.query;
    const query = { isPublic: true };

    if (genre) query.genre = genre;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [songs, total] = await Promise.all([
      Song.find(query)
        .populate("artist", "username profilePicture")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Song.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      songs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single song by ID
// @route   GET /api/songs/:id
// @access  Public
const getSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate("artist", "username profilePicture followers");
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    if (!song.isPublic && song.artist._id.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ success: false, message: "This song is private" });
    }
    res.json({ success: true, song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a song
// @route   PUT /api/songs/:id
// @access  Private (owner only)
const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    if (song.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this song" });
    }

    const allowed = ["title", "album", "genre", "coverImage", "lyrics", "isPublic"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) song[field] = req.body[field];
    });
    await song.save();

    res.json({ success: true, message: "Song updated", song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a song
// @route   DELETE /api/songs/:id
// @access  Private (owner only)
const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    if (song.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this song" });
    }

    await song.deleteOne();
    res.json({ success: true, message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment play count
// @route   POST /api/songs/:id/play
// @access  Public
const playSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { playCount: 1 } },
      { new: true }
    );
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    res.json({ success: true, playCount: song.playCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like / Unlike a song
// @route   POST /api/songs/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });

    const isLiked = song.likes.includes(req.user._id);

    if (isLiked) {
      await Song.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { likedSongs: req.params.id } });
      res.json({ success: true, message: "Song removed from liked songs", liked: false });
    } else {
      await Song.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { likedSongs: req.params.id } });
      res.json({ success: true, message: "Song added to liked songs", liked: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending songs (most played)
// @route   GET /api/songs/trending
// @access  Public
const getTrendingSongs = async (req, res) => {
  try {
    const songs = await Song.find({ isPublic: true })
      .sort({ playCount: -1 })
      .limit(20)
      .populate("artist", "username profilePicture");
    res.json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSong, getAllSongs, getSong, updateSong, deleteSong, playSong, toggleLike, getTrendingSongs };
