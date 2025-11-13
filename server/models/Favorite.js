import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true },
    room: { type: String, ref: "Room", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, room: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;

