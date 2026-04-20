# Nexus Real-time Messenger

A premium, production-ready real-time chat application built with the MERN stack and Socket.IO.

## 🚀 Features
- **Real-time Messaging**: Instant text and image communication using Socket.IO.
- **Friend System**: Search users by unique ID, send/accept/reject friend requests.
- **Premium UI**: Dark mode with Glassmorphism, smooth animations (Framer Motion), and responsive layout.
- **Secure Auth**: JWT-based authentication with password hashing.
- **Image Support**: Upload and share images in chats.

## 🛠 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, Multer.

## 📦 Getting Started

### 1. Prerequisites
- Node.js installed
- MongoDB running locally or a MongoDB Atlas URI

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (one has been pre-created for you).
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Usage
1. Open [http://localhost:5173](http://localhost:5173).
2. Register an account and copy your unique `user_id`.
3. Open another browser/incognito, register another account.
4. Search for the first account's `user_id` and send a friend request.
5. Accept the request and start chatting!

---
Built with ❤️ by Antigravity
