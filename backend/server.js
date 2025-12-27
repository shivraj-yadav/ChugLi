const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");

dotenv.config();

const app = express();

const server = http.createServer(app);

const corsOrigin = (process.env.CORS_ORIGIN || "*").replace(/\/+$/, "");

const roomMessages = new Map();
const MAX_ROOM_MESSAGES = 50;

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST", "OPTIONS"],
  },
});

app.set("io", io);
app.set("roomMessages", roomMessages);

app.use(express.json());

app.use(
  cors({
    origin: corsOrigin,
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  const joinedRooms = new Set();

  const emitRoomUsers = async (roomId) => {
    try {
      const room = io.sockets.adapter.rooms.get(roomId);
      const count = room ? room.size : 0;
      io.to(roomId).emit("room_users", { roomId, count });
    } catch (err) {
      // ignore
    }
  };

  socket.on("join_room", async ({ roomId }) => {
    if (!roomId) return;
    const rid = String(roomId);
    socket.join(rid);
    joinedRooms.add(rid);
    const history = roomMessages.get(rid) || [];
    socket.emit("chat_history", { roomId: rid, messages: history });
    await emitRoomUsers(rid);
  });

  socket.on("leave_room", async ({ roomId }) => {
    if (!roomId) return;
    const rid = String(roomId);
    socket.leave(rid);
    joinedRooms.delete(rid);
    await emitRoomUsers(rid);
  });

  socket.on("send_message", (payload) => {
    if (!payload || !payload.roomId || !payload.message) return;

    const roomId = String(payload.roomId);
    const outgoing = {
      id: payload.id || `${Date.now()}-${socket.id}`,
      roomId,
      message: String(payload.message),
      handle: payload.handle ? String(payload.handle) : "@Anonymous",
      timestamp: payload.timestamp || new Date().toISOString(),
    };

    const prev = roomMessages.get(roomId) || [];
    const next = [...prev, outgoing].slice(-MAX_ROOM_MESSAGES);
    roomMessages.set(roomId, next);

    io.to(roomId).emit("receive_message", outgoing);
  });

  socket.on("disconnect", async () => {
    for (const rid of joinedRooms) {
      await emitRoomUsers(rid);
    }
  });
});

(async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
