# ChugLi

Anonymous, location-based chat rooms with real-time messaging.

## Repository Name
**ChugLi**

## Description
A lightweight MERN + Socket.io app where users can create nearby, short-lived chat rooms and chat in real time — with anonymous handles and ephemeral messages.

## Tech Stack
- **Frontend:** React (Vite) + TypeScript + Tailwind + shadcn/ui
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)
- **Real-time:** Socket.io
- **Auth:** JWT

## Key Features
- **Anonymous auth** with randomly generated handles
- **Nearby rooms (5km radius)** using MongoDB geospatial queries
- **Rooms auto-expire** (TTL index; ~2 hours)
- **Real-time chat** via Socket.io
- **Live member count** per room
- **Creator-only delete** (protected endpoint)
- **Real-time room updates** (create/delete sync without refreshing)
- **Ephemeral chat history** (last ~50 messages per room kept in server memory; not stored in DB)

## Project Structure
```
backend/   # Express + MongoDB + Socket.io
client/    # Vite React UI
```

## Getting Started (Local)

### 1) Backend setup
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=YOUR_MONGODB_ATLAS_URI
   CORS_ORIGIN=http://localhost:8080
   JWT_SECRET=YOUR_SECRET
   ```
3. Run the server:
   ```bash
   npm run dev
   ```

Backend will run on:
- `http://localhost:5000`

### 2) Frontend setup
1. Install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Run the client:
   ```bash
   npm run dev
   ```

Frontend will run on:
- `http://localhost:8080`

## Environment Variables

### Backend (`backend/.env`)
- **`PORT`**: API port (default `5000`)
- **`MONGO_URI`**: MongoDB Atlas connection string
- **`CORS_ORIGIN`**: Frontend origin (default `http://localhost:8080`)
- **`JWT_SECRET`**: JWT signing secret

### Frontend (optional)
If you want to override the API URL, set:
- `VITE_API_BASE_URL=http://localhost:5000`

## API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/signin`

### Rooms
- `POST /api/rooms/create` (JWT required)
- `GET /api/rooms/nearby?lat=...&lng=...`
- `DELETE /api/rooms/:id` (JWT required; creator-only)

## Socket.io Events

### Rooms / Presence
- **Client -> Server**: `join_room` `{ roomId }`
- **Client -> Server**: `leave_room` `{ roomId }`
- **Server -> Room**: `room_users` `{ roomId, count }`

### Chat
- **Client -> Server**: `send_message` `{ roomId, message, handle }`
- **Server -> Room**: `receive_message` `{ id, roomId, message, handle, timestamp }`
- **Server -> Client**: `chat_history` `{ roomId, messages }` (sent on join)

### Room feed updates
- **Server -> All**: `room_created` `<room document>`
- **Server -> All**: `room_deleted` `{ roomId }`

## Notes
- Messages are **not persisted** to MongoDB (ephemeral). The server only keeps a small in-memory buffer for recent history.
- Do not commit secrets: add your real values only in `backend/.env`.

## License
MIT
