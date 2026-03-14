# 🚀 Attendance & Leave Management System

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A **full-stack Attendance and Leave Management System** built using the **MERN Stack** to simplify employee attendance tracking and leave management.

The system provides role-based access for **employees** and **administrators**, enabling efficient management of attendance records, leave requests, and approval workflows.

---

# 📌 Project Overview

Managing employee attendance and leave manually can be inefficient and error-prone.
This application provides a centralized platform where employees can mark attendance, apply for leave, and track requests, while administrators can monitor attendance and manage leave approvals.

The system is designed with a **modern UI, secure authentication, and scalable backend architecture**.

---

# ✨ Features

## 👨‍💻 Employee Features

* Mark daily attendance
* Apply for leave (Casual, Sick, Paid)
* View leave requests
* Cancel pending leave requests
* View leave history
* View attendance history
* Dashboard with attendance statistics

---

## 🛠 Admin Features

* View attendance records of all employees
* Approve or reject leave requests
* Monitor leave statistics
* Manage employee accounts
* Track leave status and history

---

# 🧰 Tech Stack

## Frontend

* **React (Vite)** – Fast and optimized frontend framework
* **TypeScript** – Static typing for better maintainability
* **TailwindCSS** – Responsive modern UI styling
* **ShadCN UI** – Reusable UI components
* **Axios** – API communication
* **React Hot Toast** – User notifications

## Backend

* **Node.js** – Server runtime
* **Express.js** – REST API framework
* **MongoDB** – NoSQL database
* **Mongoose** – ODM for MongoDB
* **JWT Authentication** – Secure login system
* **CORS** – Cross-origin resource sharing support

---

# 🏗 System Architecture

```
React Frontend
       │
       │ REST API (Axios)
       ▼
Node.js + Express Backend
       │
       ▼
MongoDB Database
```

---

# 📂 Project Structure

```
Attendance-App
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── config
│   └── server.js
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   ├── context
│   ├── hooks
│   └── App.tsx
│
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone the repository

```
git clone https://github.com/Tanisha-b3/Attendance-App.git
cd Attendance-App
```

---

## 2️⃣ Install backend dependencies

```
cd backend
npm install
```

---

## 3️⃣ Install frontend dependencies

```
cd ../frontend
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file inside the **backend folder**.

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

---

# ▶️ Run the Application

## Start Backend

```
cd backend
npm run dev
```

Backend runs on

```
http://localhost:5000
```

---

## Start Frontend

```
cd frontend
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# 🔌 API Endpoints

## Authentication

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | User login        |

---

## Attendance

| Method | Endpoint                      | Description                |
| ------ | ----------------------------- | -------------------------- |
| POST   | /api/attendance/mark          | Mark attendance            |
| GET    | /api/attendance/my-attendance | Get user attendance        |
| GET    | /api/attendance               | Admin fetch all attendance |

---

## Leave Management

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| POST   | /api/leaves/apply     | Apply for leave                |
| GET    | /api/leaves/my-leaves | Get user leave requests        |
| GET    | /api/leaves           | Admin fetch all leave requests |
| PUT    | /api/leaves/:id       | Update leave status            |
| DELETE | /api/leaves/:id       | Cancel leave request           |

---

# 🗄 Database Models

## User Model

Fields

* name
* email
* password
* role (admin / employee)
* leaveBalance

Relationship

```
User → Attendance (One to Many)
User → Leave Requests (One to Many)
```

---

## Attendance Model

Fields

* user
* date
* status (Present / Absent)
* createdAt

---

## Leave Model

Fields

* user
* leaveType
* startDate
* endDate
* totalDays
* reason
* status (Pending / Approved / Rejected)
* appliedDate

---

# 👤 Admin Credentials

If admin is seeded in database:

```
Email: admin@example.com
Password: admin123
```

---

# 🤖 AI Tools Declaration

The following AI tools were used during development:

**ChatGPT**

* Debugging assistance
* API design suggestions
* UI improvement ideas
* Documentation guidance

All final implementation and code integration were completed manually.

**Claude.ai**
* UI improvement ideas
* Documentation guidance
  
**Deepseek**
* UI improvement ideas
* Documentation guidance
---

# ⚠ Known Limitations

* No email notifications for leave approval
* Attendance editing not implemented
* Basic role system (admin / employee)
* No analytics dashboard

---

# 🚀 Future Improvements

* Email notifications for leave approvals
* Attendance analytics dashboard
* Automatic leave balance management
* Role-based permission system
* Mobile-friendly UI

---

# ⏱ Time Spent

Approximately **20 hours**

* Backend development — 8 hours
* Frontend development — 8 hours
* Debugging & testing — 3 hours
* Documentation — 1 hour

---

# 👩‍💻 Author

**Tanisha Borana**

Full Stack Developer

GitHub:
https://github.com/Tanisha-b3
