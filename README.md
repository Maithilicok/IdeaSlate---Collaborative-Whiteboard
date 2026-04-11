# IdeaSlate — Collaborative Whiteboard

A real-time collaborative whiteboard app where teams can draw, sketch, and brainstorm together on an infinite canvas.

---

## Features

- 🎨 **Infinite canvas** — draw freely with pen, shapes, and text tools
- ⚡ **Real-time sync** — every stroke appears instantly for all collaborators via Socket.IO
- 🔗 **Share links** — invite anyone to a board with a single link
- 💾 **Auto-saved boards** — canvas state is persisted to the database
- 🔐 **Full auth flow** — register, email OTP verification, login, forgot/reset password
- 🌙 **Dark / Light mode** — theme toggle with localStorage persistence
- 👥 **Room-based collaboration** — create rooms, manage members, owner controls

---

## Tech Stack

**Frontend**
- React + Vite
- React Router v6
- Socket.IO client
- Tailwind CSS
- Axios

**Backend**
- Node.js + Express
- Socket.IO
- MongoDB + Mongoose
- JWT (httpOnly cookies)
- Nodemailer (Gmail)
- bcryptjs

---

## Project Structure

```
Ideaslate/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
└── server/          # Express backend
    ├── config/
    ├── middleware/
    ├── models/
    ├── routes/
    └── sockets/
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Gmail account with an App Password

### 1. Clone the repo

```bash
git clone https://github.com/Maithilicok/IdeaSlate---Collaborative-Whiteboard.git
cd IdeaSlate---Collaborative-Whiteboard
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

### 3. Set up the client

```bash
cd ../client
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail App Password (not your regular password) |
| `CLIENT_URL` | Frontend URL (for CORS and email links) |
| `PORT` | Port for the Express server |

---

## License

MIT
