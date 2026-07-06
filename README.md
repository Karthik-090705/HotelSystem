<<<<<<< HEAD
# 🏨 GrandStay - Hotel Room Booking Management System

GrandStay is a full-stack **MERN (MongoDB, Express.js, React, Node.js)** hotel room booking and management system designed to provide a seamless booking experience for users while offering powerful management tools for administrators.

Built with a modern tech stack, GrandStay features secure authentication, room management, booking management, user profiles, reviews, image uploads, analytics, and a responsive user interface.

---

## ✨ Features

### 👤 User Features

* 🔐 Secure User Authentication (JWT)
* 🏨 Browse available hotel rooms
* 🔍 Search, filter, and sort rooms
* 📄 View detailed room information
* 📅 Book rooms with check-in/check-out dates
* 🚫 Prevent double bookings using date overlap validation
* 💰 Automatic booking price calculation
* 📖 View booking history
* ❌ Cancel bookings before check-in
* ⭐ Rate and review completed stays
* 👤 Multi-tab user profile
* 📷 Profile photo upload
* 🌙 Light & Dark mode
* 📱 Fully responsive design

---

### 👨‍💼 Admin Features

* 📊 Interactive Dashboard
* 📈 Booking & Revenue Analytics
* 🏨 Room Management

  * Add Rooms
  * Edit Rooms
  * Delete Rooms
  * Upload Room Images
  * Manage Availability
* 📅 Booking Management

  * View All Bookings
  * Confirm/Cancel Bookings
  * Mark Completed
* 👥 User Management
* ⭐ Review Moderation
* 📊 Occupancy & Revenue Statistics

---

## 🚀 Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Context API
* Axios
* Lucide React
* React Toastify

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcrypt
* Multer
* Nodemailer

---

## 📂 Project Structure

```text
GrandStay/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## 📦 Installation

### Clone the repository

```bash
git clone https://github.com/your-username/GrandStay.git
```

```bash
cd GrandStay
```

---

### Backend Setup

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_app_password
```

Run the backend
```bash
cd backend
```

```
npm install
```

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run the frontend

```bash
npm run dev
```

---

## 📸 Screenshots

> Screenshots will be added after completing the project.

---

## 🔒 Authentication

* JWT Authentication
* Password Hashing using bcrypt
* Protected Routes
* Role-Based Authorization
* User & Admin Access Control

---

## 📊 Upcoming Features

* PDF Booking Receipt
* Booking Confirmation Emails
* Advanced Room Filters
* Wishlist / Favorite Rooms
* Dashboard Analytics
* Enhanced Booking Reports

---

## 👨‍💻 Author

**Sai Karthik**

Final Year B.Tech Project

---

## 📄 License

This project is created for educational and portfolio purposes.
=======
# HotelSystem
GrandStay is a premium MERN hotel booking system. It features a React/Vite/Tailwind frontend, a Node/Express/MongoDB API, JWT auth, and multer uploads. Users can browse rooms, review stays, manage bookings, and customize multi-tab profiles with photo uploads, while admins monitor system analytics.
>>>>>>> abe9ef2ad6bdd29a40aaa6fc103452c4fb5b50a2
