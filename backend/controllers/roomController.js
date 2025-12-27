const Room = require("../models/Room");

async function createRoom(req, res) {
  try {
    const { title, tags, lat, lng } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const room = await Room.create({
      title: String(title).trim(),
      creator: req.user.userId,
      tags: Array.isArray(tags) ? tags.map((t) => String(t)) : [],
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("room_created", room.toObject());
    }

    return res.status(201).json(room);
  } catch (err) {
    console.error("Create room error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Room id is required" });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (String(room.creator) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await room.deleteOne();

    const roomMessages = req.app.get("roomMessages");
    if (roomMessages) {
      roomMessages.delete(String(id));
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("room_deleted", { roomId: String(id) });
    }

    return res.status(200).json({ message: "Room deleted" });
  } catch (err) {
    console.error("Delete room error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getNearbyRooms(req, res) {
  try {
    const { lat, lng } = req.query;

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ message: "lat and lng query params are required" });
    }

    const rooms = await Room.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 5000,
        },
      },
    }).populate("creator", "anonymousHandle");

    return res.status(200).json(rooms);
  } catch (err) {
    console.error("Get nearby rooms error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createRoom,
  getNearbyRooms,
  deleteRoom,
};
