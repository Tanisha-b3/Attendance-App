# Attendance & Leave Management System – Backend

## Project Overview

The **Backend** of the Attendance & Leave Management System provides RESTful APIs to manage user authentication, attendance tracking, and leave requests. It handles business logic, database operations, and secure communication between the frontend and database.

The backend is built using **Node.js, Express.js, and MongoDB**, providing scalable and efficient API services for the system.

---

## Tech Stack

* **Node.js** – JavaScript runtime environment
* **Express.js** – Backend web framework
* **MongoDB** – NoSQL database for storing application data
* **Mongoose** – ODM for MongoDB
* **JWT (JSON Web Token)** – Authentication and authorization
* **bcrypt.js** – Password hashing
* **dotenv** – Environment variable management
* **CORS** – Cross-origin resource sharing
* **Nodemon** – Development server auto-restart

---

## Features

### Authentication

* User registration
* Secure login using JWT
* Password encryption using bcrypt
* Role-based access (Admin / Employee)

### Attendance Management

* Mark daily attendance
* Fetch attendance records
* Track employee attendance history

### Leave Management

* Apply for leave
* View leave requests
* Admin approval or rejection of leave
* Filter leave requests by status

### User Management

* Fetch employee details
* Admin access to all users

---

## Folder Structure

```bash
backend
│
├── config
│   └── db.js            # MongoDB connection
│
├── controllers          # Business logic
│   ├── authController.js
│   ├── attendanceController.js
│   └── leaveController.js
│
├── models               # Database schemas
│   ├── User.js
│   ├── Attendance.js
│   └── Leave.js
│
├── routes               # API routes
│   ├── authRoutes.js
│   ├── attendanceRoutes.js
│   ├── leaveRoutes.js
│   └── userRoutes.js
│
├── middleware
│   └── authMiddleware.js
│
├── server.js            # Main server file
└── .env                 # Environment variables
```

---

## Installation Steps

### 1. Clone the repository

```bash
git clone https://github.com/your-username/attendance-backend.git
```

### 2. Navigate to the backend folder

```bash
cd backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 5. Run the server

```bash
npm run dev
```

Server will run on:

```
http://localhost:5000
```

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | User login        |

---

### Attendance

| Method | Endpoint        | Description            |
| ------ | --------------- | ---------------------- |
| POST   | /api/attendance | Mark attendance        |
| GET    | /api/attendance | Get attendance records |

---

### Leave Management

| Method | Endpoint       | Description            |
| ------ | -------------- | ---------------------- |
| POST   | /api/leave     | Apply for leave        |
| GET    | /api/leave     | Get leave requests     |
| PUT    | /api/leave/:id | Approve / Reject leave |

---

### Users

| Method | Endpoint   | Description   |
| ------ | ---------- | ------------- |
| GET    | /api/users | Get all users |

---

## Security

* Passwords are encrypted using **bcrypt**
* Authentication handled using **JWT tokens**
* Protected routes using **middleware**

---

## Future Improvements

* Email notifications for leave approvals
* Attendance analytics dashboard
* Role-based permissions for advanced admin features
* Audit logs for admin actions

---

## Author

**Tanisha Borana**

Full Stack Developer | MERN Stack Developer
