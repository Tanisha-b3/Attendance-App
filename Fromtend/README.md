# Attendance & Leave Management System – Frontend

## Project Overview

The **Attendance & Leave Management System (Frontend)** is a responsive web application that allows employees and administrators to manage attendance records and leave requests efficiently.

Employees can mark their daily attendance, apply for leave, and track leave status. Administrators can view employee attendance, manage leave requests, and approve or reject applications through a centralized dashboard.

The application is built using **React, TypeScript, and modern UI components** to ensure a fast and user-friendly experience.

---

## Tech Stack

* **React.js** – Component-based UI development
* **TypeScript** – Static typing for better code quality
* **Vite** – Fast development and build tool
* **Tailwind CSS** – Utility-first styling framework
* **Shadcn UI** – Pre-built UI components
* **React Router** – Navigation and routing
* **Axios** – API communication with backend
* **React Hot Toast** – Notifications and alerts

---

## Features

### Authentication

* Secure login and registration
* Role-based access control (Admin / Employee)

### Employee Features

* Mark daily attendance
* Apply for leave
* View leave request status
* Dashboard with attendance summary

### Admin Features

* View all employee attendance records
* Approve or reject leave requests
* Filter leave requests by status
* Dashboard analytics

---

## Folder Structure

```
src
│
├── components        # Reusable UI components
├── pages             # Application pages (Dashboard, Login, etc.)
├── services          # API service functions
├── context           # Global state management
├── hooks             # Custom React hooks
├── utils             # Helper functions
└── App.tsx           # Main application component
```

---

## Installation Steps

### 1. Clone the repository

```
git clone https://github.com/your-username/Attendance-App.git
```

### 2. Navigate to the project folder

```
cd fromtend
```

### 3. Install dependencies

```
npm install
```

### 4. Run the development server

```
npm run dev
```

The application will run at:

```
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file in the root directory and add:

```
VITE_API_URL=http://localhost:5000/api
```

This variable is used to connect the frontend with the backend API.

---

## API Integration

The frontend communicates with the backend using **Axios services**.

Example endpoints used:

* `POST /api/auth/login` – User login
* `POST /api/auth/register` – User registration
* `POST /api/attendance/mark` – Mark attendance
* `GET /api/attendance` – Get attendance records
* `POST /api/leave/apply` – Apply leave
* `GET /api/leave` – Get leave requests
* `PUT /api/leave/:id` – Approve / reject leave

---

## UI Components

The project uses **Shadcn UI components** such as:

* Button
* Card
* Dialog
* Select
* Textarea
* Input
* Toast Notifications

These components help maintain a consistent and modern design system.

---

## Future Improvements

* Email notifications for leave approval
* Attendance analytics and charts
* Calendar-based attendance view
* Mobile-friendly enhancements

---

## Author

**Tanisha Borana**

Full Stack Developer | MERN Stack Enthusiast
