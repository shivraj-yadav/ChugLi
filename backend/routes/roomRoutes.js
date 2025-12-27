const express = require("express");

const auth = require("../middleware/auth");
const { createRoom, getNearbyRooms, deleteRoom } = require("../controllers/roomController");

const router = express.Router();

router.post("/create", auth, createRoom);
router.get("/nearby", getNearbyRooms);
router.delete("/:id", auth, deleteRoom);

module.exports = router;
