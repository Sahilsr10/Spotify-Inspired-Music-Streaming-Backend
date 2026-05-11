const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Song title is required"],
      trim: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    album: {
      type: String,
      trim: true,
      default: "Single",
    },
    genre: {
      type: String,
      enum: ["Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic", "R&B", "Country", "Indie", "Other"],
      default: "Other",
    },
    duration: {
      type: Number, // in seconds
      required: [true, "Song duration is required"],
    },
    audioUrl: {
      type: String,
      required: [true, "Audio URL is required"],
    },
    coverImage: {
      type: String,
      default: "default-cover.png",
    },
    lyrics: {
      type: String,
      default: "",
    },
    playCount: {
      type: Number,
      default: 0,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPublic: {
      type: Boolean,
      default: true,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for search functionality
songSchema.index({ title: "text", album: "text", genre: 1 });

module.exports = mongoose.model("Song", songSchema);
