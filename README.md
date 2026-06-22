# IdeaSlate — Collaborative Whiteboard 🎨

A real-time collaborative whiteboard app where teams can draw, sketch, and brainstorm together on an infinite canvas.

🔗 **Live Demo:** [idea-slate-collaborative-whiteboard.vercel.app](https://idea-slate-collaborative-whiteboard.vercel.app)

---

## Features

- 🎨 **Infinite canvas** — draw freely with pen, shapes, and text tools
- ⚡ **Real-time sync** — every stroke appears instantly for all collaborators via Socket.IO
- 🔗 **Share links** — invite anyone to a board with a single shareable link
- 💾 **Auto-saved boards** — canvas state is persisted to MongoDB and restored on reload
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
- Brevo SMTP (transactional emails via Nodemailer)
- bcryptjs

**Deployment**
- Frontend → Vercel
- Backend → Render

---

## How Real-Time Sync Works

Canvas sync uses a two-mode strategy:

- **Delta sync** — while drawing, individual object changes are streamed via `canvas:object` events so only what changed is sent, keeping it lightweight
- **Full sync** — when a user joins a room, or after a delete/clear, the complete canvas state is sent from MongoDB so they're immediately up to date

This is similar to how Google Docs works — small changes stream live, full state loads when you open the document fresh.

---

## Project Structure

```
IdeaSlate/
├── client/               # React frontend
│   └── src/
│       ├── components/
│       ├── context/      # React Context for state
│       └── pages/
└── server/               # Express backend
    ├── config/
    ├── middleware/
    ├── models/
    ├── routes/
    └── sockets/
```

---

## Getting Started Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Brevo account (for transactional emails)

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

Create a `.env` file in `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
BREVO_USER=your_brevo_login_email
BREVO_PASS=your_brevo_smtp_key
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
|---|---|
| `PORT` | Port for the Express server |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `BREVO_USER` | Brevo account login email |
| `BREVO_PASS` | Brevo SMTP key (from Brevo dashboard → SMTP & API) |
| `CLIENT_URL` | Frontend URL (for CORS and email links) |
| `NODE_ENV` | `development` or `production` |

---

## Deployment

This project is deployed as two separate services:

- **Frontend** on [Vercel](https://vercel.com) — set root directory to `client` when importing
- **Backend** on [Render](https://render.com) — set all env vars in Render's dashboard, including `NODE_ENV=production` and `CLIENT_URL` pointing to your Vercel URL

> ⚠️ **Email note:** Gmail SMTP doesn't work on Render's free tier due to port restrictions. Use [Brevo](https://brevo.com) (free tier, no credit card) with SMTP relay at `smtp-relay.brevo.com:587` instead. Update `BREVO_USER` and `BREVO_PASS` in your Render environment variables.

---

## License

MIT
