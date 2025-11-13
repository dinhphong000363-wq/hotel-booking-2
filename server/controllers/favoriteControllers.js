import Favorite from "../models/Favorite.js";
import Room from "../models/Room.js";

export const toggleFavorite = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.json({ success: false, message: "Room ID is required" });
    }

    const userId = req.user._id;

    const existingFavorite = await Favorite.findOne({
      user: userId,
      room: roomId,
    });

    if (existingFavorite) {
      await existingFavorite.deleteOne();
    } else {
      await Favorite.create({
        user: userId,
        room: roomId,
      });
    }

    const updatedCount = await Favorite.countDocuments({ room: roomId });

    res.json({
      success: true,
      isFavorited: !existingFavorite,
      count: updatedCount,
    });
  } catch (error) {
    console.error("❌ Error toggling favorite:", error);
    res.json({ success: false, message: "Failed to toggle favorite" });
  }
};

export const getRoomFavoritesCount = async (req, res) => {
  try {
    const { roomId } = req.params;

    const count = await Favorite.countDocuments({ room: roomId });

    res.json({ success: true, count });
  } catch (error) {
    console.error("❌ Error fetching favorites count:", error);
    res.json({ success: false, message: "Failed to fetch favorites" });
  }
};

export const getUserFavoriteStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const isFavorited = await Favorite.exists({ user: userId, room: roomId });

    res.json({ success: true, isFavorited: !!isFavorited });
  } catch (error) {
    console.error("❌ Error fetching favorite status:", error);
    res.json({ success: false, message: "Failed to fetch favorite status" });
  }
};

export const listMyFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({ user: userId }).lean();
    const roomIds = favorites.map((f) => f.room);

    if (roomIds.length === 0) {
      return res.json({ success: true, favorites: [] });
    }

    const rooms = await Room.find({ _id: { $in: roomIds } })
      .select("_id roomType pricePerNight amenities images")
      .lean();

    const roomById = new Map(rooms.map((r) => [String(r._id), r]));
    const result = favorites
      .map((f) => ({
        _id: f._id,
        room: roomById.get(String(f.room)) || null,
        createdAt: f.createdAt,
      }))
      .filter((x) => x.room);

    res.json({ success: true, favorites: result });
  } catch (error) {
    console.error("❌ Error listing favorites:", error);
    res.json({ success: false, message: "Failed to list favorites" });
  }
};

