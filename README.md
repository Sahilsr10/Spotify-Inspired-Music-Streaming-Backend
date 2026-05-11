# Spotify-Inspired-Music-Streaming-Backend
<div align="center">

<img src="https://img.shields.io/badge/Spotify-Inspired-1DB954?style=for-the-badge&logo=spotify&logoColor=white" />


**A production-ready music streaming REST API built with Node.js, Express & MongoDB**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Features](#-features) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Project Structure](#-project-structure) · [Security](#-security)

</div>

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 🎵 **Song Management** — Full CRUD, play count tracking, like/unlike, genre filtering, full-text search
- 📋 **Playlist System** — Create, manage, and follow playlists with song ordering
- 👥 **Social Features** — Follow/unfollow users, public/private profiles
- 📄 **Pagination** — All list endpoints support page & limit query params
- 🛡️ **Route Guards** — Owner-only middleware, optional auth for public routes
- ✅ **Request Validation** — express-validator on all create/update endpoints
- 🔥 **Trending Endpoint** — Top songs ranked by play count
- 🌐 **CORS Enabled** — Ready for frontend integration

---

## 🚀 Quick Start

### Prerequisites

- Node.js `v18+`
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1 — Clone & Install

```bash
git clone https://github.com/your-username/spotify-backend.git
cd spotify-backend
npm install
```

### 2 — Configure Environment

Create a `.env` file in the root:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spotify_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> ⚠️ **Never commit your `.env` file.** It's already in `.gitignore`.

### 3 — Run

```bash
# Development — hot reload with nodemon
npm run dev

# Production
npm start
```

Server starts at → `http://localhost:5000`

---

## 📁 Project Structure

```
spotify-backend/
├── src/
│   ├── config/
│   │   └── db.js                   # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js       # Register, login, profile, follow
│   │   ├── songController.js       # Song CRUD, play count, like toggle
│   │   └── playlistController.js   # Playlist CRUD, add/remove songs, follow
│   ├── middleware/
│   │   ├── auth.js                 # JWT protect / optionalAuth / premiumOnly
│   │   └── validate.js             # express-validator rule sets
│   ├── models/
│   │   ├── User.js                 # User schema + password hashing hooks
│   │   ├── Song.js                 # Song schema + text index
│   │   └── Playlist.js             # Playlist schema + virtual songCount
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── songRoutes.js
│   │   └── playlistRoutes.js
│   └── server.js                   # Express app + global error handler
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### 🔑 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | Public | Create a new account |
| `POST` | `/login` | Public | Sign in, receive JWT |
| `GET` | `/me` | 🔒 Private | Fetch current user profile |
| `PUT` | `/update-profile` | 🔒 Private | Update username / avatar |
| `PUT` | `/change-password` | 🔒 Private | Change password |
| `POST` | `/follow/:userId` | 🔒 Private | Toggle follow / unfollow |

<details>
<summary><b>Register</b> — POST /api/auth/register</summary>

**Request body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "username": "johndoe", "email": "john@example.com" }
}
```
</details>

<details>
<summary><b>Login</b> — POST /api/auth/login</summary>

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
</details>

---

### 🎵 Songs — `/api/songs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Public | List songs with filters + pagination |
| `GET` | `/trending` | Public | Top 20 by play count |
| `GET` | `/:id` | Public | Get a single song |
| `POST` | `/` | 🔒 Private | Upload / create a song |
| `PUT` | `/:id` | 🔒 Owner | Update song metadata |
| `DELETE` | `/:id` | 🔒 Owner | Delete a song |
| `POST` | `/:id/play` | Public | Increment play count |
| `POST` | `/:id/like` | 🔒 Private | Toggle like / unlike |

<details>
<summary><b>Query Parameters</b> — GET /api/songs</summary>

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `genre` | string | — | Filter by genre |
| `search` | string | — | Full-text search (title, album) |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Results per page |
| `sort` | string | `-createdAt` | Sort field |

```
GET /api/songs?genre=Pop&search=love&page=1&limit=10
```
</details>

<details>
<summary><b>Create Song</b> — POST /api/songs</summary>

```json
{
  "title": "My Song",
  "album": "My Album",
  "genre": "Pop",
  "duration": 210,
  "audioUrl": "https://cdn.example.com/song.mp3",
  "coverImage": "https://cdn.example.com/cover.jpg",
  "lyrics": "Optional lyrics here..."
}
```

**Supported genres:** `Pop` · `Rock` · `Hip-Hop` · `Jazz` · `Classical` · `Electronic` · `R&B` · `Country` · `Indie` · `Other`
</details>

---

### 📋 Playlists — `/api/playlists`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Public | Browse public playlists |
| `GET` | `/my` | 🔒 Private | Your playlists |
| `GET` | `/:id` | Public | Get playlist + all songs |
| `POST` | `/` | 🔒 Private | Create a playlist |
| `PUT` | `/:id` | 🔒 Owner | Update playlist |
| `DELETE` | `/:id` | 🔒 Owner | Delete playlist |
| `POST` | `/:id/songs` | 🔒 Owner | Add song |
| `DELETE` | `/:id/songs/:songId` | 🔒 Owner | Remove song |
| `POST` | `/:id/follow` | 🔒 Private | Toggle follow / unfollow |

<details>
<summary><b>Create Playlist</b> — POST /api/playlists</summary>

```json
{
  "name": "Chill Vibes",
  "description": "Perfect for late nights",
  "isPublic": true,
  "tags": ["chill", "lofi", "focus"]
}
```
</details>

<details>
<summary><b>Add Song to Playlist</b> — POST /api/playlists/:id/songs</summary>

```json
{ "songId": "64f1a2b3c4d5e6f7a8b9c0d1" }
```
</details>

---

## 🗄️ Data Models

<details>
<summary><b>User Schema</b></summary>

| Field | Type | Notes |
|-------|------|-------|
| `username` | String | Unique, 3–30 chars |
| `email` | String | Unique, validated |
| `password` | String | Hashed, hidden from responses |
| `profilePicture` | String | URL |
| `isPremium` | Boolean | Default: false |
| `following` | [ObjectId] | Ref: User |
| `followers` | [ObjectId] | Ref: User |
| `likedSongs` | [ObjectId] | Ref: Song |
</details>

<details>
<summary><b>Song Schema</b></summary>

| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `artist` | ObjectId | Ref: User |
| `album` | String | Default: "Single" |
| `genre` | String | Enum of 10 genres |
| `duration` | Number | In seconds |
| `audioUrl` | String | Required |
| `coverImage` | String | URL |
| `playCount` | Number | Default: 0 |
| `likes` | [ObjectId] | Ref: User |
| `isPublic` | Boolean | Default: true |
</details>

<details>
<summary><b>Playlist Schema</b></summary>

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required, max 100 chars |
| `description` | String | Max 300 chars |
| `owner` | ObjectId | Ref: User |
| `songs` | Array | `{ song, addedAt }` |
| `followers` | [ObjectId] | Ref: User |
| `isPublic` | Boolean | Default: true |
| `tags` | [String] | Searchable tags |
</details>

---

## 🔒 Security

| Mechanism | Implementation |
|-----------|----------------|
| Password hashing | bcryptjs with 12 salt rounds |
| Authentication | JWT with configurable expiry |
| Route protection | `protect` middleware on all private routes |
| Ownership checks | Controller-level guards for edit/delete |
| Input validation | express-validator on all write endpoints |
| Sensitive field stripping | `select: false` on password & refreshToken |
| CORS | Configured via `cors` package |

---

## 🧰 Tech Stack

| | Technology | Version |
|---|---|---|
| **Runtime** | Node.js | 18+ |
| **Framework** | Express.js | 4.x |
| **Database** | MongoDB + Mongoose | 8.x |
| **Auth** | JSON Web Tokens | 9.x |
| **Hashing** | bcryptjs | 2.x |
| **Validation** | express-validator | 7.x |
| **Logging** | Morgan | 1.x |

---

## 📦 Sample Responses

<details>
<summary>Successful Login</summary>

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
</details>

<details>
<summary>Validation Error</summary>

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```
</details>

---

## 🗺️ Roadmap

- [ ] Refresh token rotation
- [ ] Album management endpoints
- [ ] Artist profile pages
- [ ] Song recommendations engine
- [ ] File upload with Cloudinary / S3
- [ ] Rate limiting with express-rate-limit
- [ ] Unit & integration tests (Jest + Supertest)
- [ ] Swagger / OpenAPI documentation
- [ ] Docker support

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

Built with ❤️ using Node.js & Express

</div>
