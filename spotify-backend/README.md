# 🎵 Spotify-Inspired Music Streaming Backend

A fully-featured RESTful backend API built with **Node.js**, **Express.js**, and **MongoDB**, inspired by Spotify's core architecture.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework & routing |
| MongoDB | NoSQL database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication & authorization |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| Morgan | HTTP request logging |
| CORS | Cross-origin resource sharing |

---

## 📁 Project Structure

```
spotify-backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # User auth & profile logic
│   │   ├── songController.js  # Song CRUD + likes/plays
│   │   └── playlistController.js  # Playlist CRUD + follow
│   ├── middleware/
│   │   ├── auth.js            # JWT protect / optionalAuth
│   │   └── validate.js        # express-validator rules
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Song.js            # Song schema
│   │   └── Playlist.js        # Playlist schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── songRoutes.js
│   │   └── playlistRoutes.js
│   └── server.js              # Entry point
├── .env
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. Clone & Install

```bash
git clone <your-repo>
cd spotify-backend
npm install
```

### 2. Configure Environment

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spotify_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Run the Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

---

## 🔐 Authentication

All protected routes require a **Bearer token** in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📡 API Reference

### 🔑 Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| GET | `/me` | Private | Get current user profile |
| PUT | `/update-profile` | Private | Update username / avatar |
| PUT | `/change-password` | Private | Change password |
| POST | `/follow/:userId` | Private | Follow / Unfollow a user |

**Register body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Login body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

---

### 🎵 Song Routes — `/api/songs`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all public songs (filter + paginate) |
| GET | `/trending` | Public | Get top 20 most-played songs |
| GET | `/:id` | Public | Get single song |
| POST | `/` | Private | Upload / create a song |
| PUT | `/:id` | Private | Update your song |
| DELETE | `/:id` | Private | Delete your song |
| POST | `/:id/play` | Public | Increment play count |
| POST | `/:id/like` | Private | Like / Unlike a song |

**Create Song body:**
```json
{
  "title": "My Song",
  "album": "My Album",
  "genre": "Pop",
  "duration": 210,
  "audioUrl": "https://cdn.example.com/song.mp3",
  "coverImage": "https://cdn.example.com/cover.jpg"
}
```

**Query parameters for GET /:**
- `genre` — filter by genre
- `search` — full-text search on title/album
- `page` — page number (default: 1)
- `limit` — results per page (default: 20)
- `sort` — sort field (default: `-createdAt`)

---

### 📋 Playlist Routes — `/api/playlists`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all public playlists |
| GET | `/my` | Private | Get your playlists |
| GET | `/:id` | Public | Get single playlist with songs |
| POST | `/` | Private | Create a playlist |
| PUT | `/:id` | Private | Update playlist details |
| DELETE | `/:id` | Private | Delete a playlist |
| POST | `/:id/songs` | Private | Add song to playlist |
| DELETE | `/:id/songs/:songId` | Private | Remove song from playlist |
| POST | `/:id/follow` | Private | Follow / Unfollow a playlist |

**Create Playlist body:**
```json
{
  "name": "Chill Vibes",
  "description": "Perfect for relaxing",
  "isPublic": true,
  "tags": ["chill", "lofi"]
}
```

**Add song body:**
```json
{ "songId": "<song_object_id>" }
```

---

## 📊 Data Models

### User
- `username`, `email`, `password` (hashed)
- `profilePicture`, `isPremium`
- `following[]`, `followers[]`, `likedSongs[]`

### Song
- `title`, `artist` (ref User), `album`, `genre`
- `duration` (seconds), `audioUrl`, `coverImage`, `lyrics`
- `playCount`, `likes[]`, `isPublic`, `releaseDate`

### Playlist
- `name`, `description`, `owner` (ref User)
- `songs[]` with `addedAt` timestamp
- `coverImage`, `isPublic`, `followers[]`, `tags[]`

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 12)
- JWT tokens with configurable expiry
- Protected routes via `protect` middleware
- Owner-only guards on update/delete operations
- Request validation with `express-validator`
- Password fields excluded from all API responses

---

## 📦 Sample API Response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "username": "johndoe",
    "email": "john@example.com",
    "isPremium": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```
