const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Playlist name is required"],
      trim: true,
      maxlength: [100, "Playlist name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    songs: [
      {
        song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    coverImage: {
      type: String,
      default: "default-playlist.png",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Virtual for total duration
playlistSchema.virtual("songCount").get(function () {
  return this.songs.length;
});

playlistSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Playlist", playlistSchema);
