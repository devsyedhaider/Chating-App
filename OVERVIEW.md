# Pulse Chat - Project Overview

Welcome to **Pulse Chat**, a premium, production-ready real-time messaging sanctuary. This document provides a comprehensive guide to understanding the architecture, technologies, and internal workings of the application.

---

## 🚀 Technology Stack

### Frontend (User Interface)
- **React (Vite)**: Core framework for building a fast, modular UI.
- **Tailwind CSS**: Utility-first CSS for a premium, responsive design.
- **Framer Motion**: Powering smooth transitions and micro-animations.
- **Socket.io-client**: Enabling real-time, bi-directional communication.
- **React Router Dom**: For seamless navigation between Login, Signup, and Dashboard.
- **Lucide React**: A collection of beautiful, consistent icons.
- **React Hot Toast**: For elegant, non-intrusive notifications.

### Backend (Server & API)
- **Node.js & Express**: The foundation of our RESTful API.
- **Socket.io**: Managing real-time events like message delivery and typing indicators.
- **MongoDB & Mongoose**: NoSQL database for flexible data modeling (Users, Messages, Friends).
- **JSON Web Token (JWT)**: Secure authentication and session management.
- **Bcryptjs**: Desktop-grade password hashing for security.
- **Cloudinary**: Cloud-based storage for profile pictures and chat media.
- **Multer**: Middleware for handling `multipart/form-data` (file uploads).

---

## 📂 Project Structure

### Backend (`/backend`)
- **`src/models/`**: Defines the data structure for Users, Messages, and Friends.
- **`src/controllers/`**: Contains the logic for handling API requests (Auth, User profile, etc.).
- **`src/routes/`**: Maps API endpoints to their respective controllers.
- **`src/sockets/`**: Handles real-time events like connecting/disconnecting and message broadcasting.
- **`src/middlewares/`**: Custom logic for authentication (JWT verification) and error handling.
- **`src/config/`**: Database connection and external service configurations (Cloudinary).

### Frontend (`/frontend`)
- **`src/pages/`**: Primary views (Login, Signup, Dashboard).
- **`src/components/`**: Reusable UI elements (Sidebar, ChatBox, UserProfile, etc.).
- **`src/context/`**: Global state management for Authentication and Real-time Calls.
- **`src/hooks/`**: Custom hooks for shared logic.
- **`src/services/`**: API abstraction using Axios for clean data fetching.
- **`src/assets/`**: Static images and global styles.

---

## ✨ Key Features

1. **Real-Time Messaging**: Instant message delivery with Socket.io.
2. **Hybrid Layout**: A sophisticated three-column design (Sidebar, Chat, Info) that adapts to mobile devices.
3. **Friend Management**: Send, accept, or decline friend requests in a dedicated 'Requests' hub.
4. **Authentication**: Fully secure registration and login system.
5. **Media Uploads**: High-speed image uploads for profile pictures and chat attachments.
6. **Smart Notifications**: Real-time toast notifications for incoming messages when they are not in focus.
7. **Responsive Design**: Optimized for both Ultra-wide monitors and mobile screens.

---

## 🔄 How It Works (Data Flow)

### 1. The Real-Time Engine (Socket.IO)
When a user sends a message, it doesn't just go to the database. It is emitted as a `send_message` event. The server receives this, saves it to MongoDB, and then broadcasts a `receive_message` event to the recipient. If the recipient is online, their UI updates instantly without a page refresh.

### 2. Secure Authentication
We use **JWT (JSON Web Tokens)**. When you login, the server sends a token. The frontend stores this token (usually in LocalStorage or a Context) and attaches it to the header of every subsequent API request to prove who you are.

### 3. Media Handling
When you upload a file, **Multer** intercepts the request on the server, and then we stream that file to **Cloudinary**. Once uploaded, Cloudinary gives us a URL, which we then save in our MongoDB database.

---

## 🛠️ Development Setup

To run the project locally, follow these steps:

1. **Install Dependencies**:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the `backend` directory with your MongoDB URI, JWT Secret, and Cloudinary credentials.

3. **Run the App**:
   From the root directory, run:
   ```bash
   npm run dev
   ```
   *This uses `concurrently` to start both the backend and frontend at the same time.*

---

*This project is built with a focus on performance, security, and a "wow" user experience. Happy coding!*
