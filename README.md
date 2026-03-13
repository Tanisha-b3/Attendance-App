<div align="center">

# 📋 Attendance App

### A full-stack web application to track, manage, and monitor attendance effortlessly.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-black?style=for-the-badge)](https://attendance-app-opal.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-89.7%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-8.3%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS](https://img.shields.io/badge/CSS-1.9%25-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Author](#-author)

---

## 🎯 About the Project

**Attendance App** is a modern, full-stack attendance management system designed to simplify tracking attendance for students or employees. It features a clean frontend interface paired with a robust backend API, enabling real-time data management.

> 🔗 **Live:** [attendance-app-opal.vercel.app](https://attendance-app-opal.vercel.app)

---

## ✨ Features

- ✅ **Mark Attendance** — Easily record present/absent status
- 📊 **View Attendance Records** — Browse historical attendance data
- 👥 **User Management** — Add and manage attendees/students
- 🔐 **Secure API** — Backend with authentication and protected routes
- 📱 **Responsive Design** — Works seamlessly on desktop and mobile
- ☁️ **Cloud Deployed** — Hosted on Vercel for instant access

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| TypeScript | Strongly-typed application logic |
| React | UI component framework |
| CSS | Styling and responsive layout |
| HTML | Markup structure |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| TypeScript | Type-safe server logic |
| MongoDB | Database for attendance records |

### DevOps
| Technology | Purpose |
|------------|---------|
| Vercel | Frontend deployment |
| Git & GitHub | Version control |

---

## 📁 Project Structure

```
Attendance-App/
│
├── Fromtend/                  # Frontend (React + TypeScript)
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   ├── App.tsx            # Root component
│   │   └── index.tsx          # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                   # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   └── index.ts           # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v16+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Tanisha-b3/Attendance-App.git
cd Attendance-App
```

**2. Install Backend Dependencies**

```bash
cd backend
npm install
```

**3. Install Frontend Dependencies**

```bash
cd ../Fromtend
npm install
```

### Running the App

**Start the Backend Server**

```bash
cd backend
npm run dev
```

> Backend runs on `http://localhost:5000` by default

**Start the Frontend**

Open a new terminal:

```bash
cd Fromtend
npm start
```

> Frontend runs on `http://localhost:3000`

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Create a `.env` file inside the `Fromtend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

> ⚠️ Never commit `.env` files to version control. Add them to `.gitignore`.

---

## 🌐 Deployment

This app is deployed on **Vercel**. To deploy your own instance:

1. **Fork** this repository
2. Go to [vercel.com](https://vercel.com) and import your forked repo
3. Set up **environment variables** in the Vercel dashboard
4. Deploy the **frontend** (`Fromtend/`) as the main project
5. Deploy the **backend** separately (e.g., on [Render](https://render.com) or [Railway](https://railway.app))
6. Update `REACT_APP_API_URL` to point to your live backend URL

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 🙌

1. **Fork** the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a **Pull Request**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👩‍💻 Author

<div align="center">

**Tanisha Borana**

[![GitHub](https://img.shields.io/badge/GitHub-Tanisha--b3-181717?style=flat-square&logo=github)](https://github.com/Tanisha-b3)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-tanisha--borana-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/tanisha-borana-552797233)
[![LeetCode](https://img.shields.io/badge/LeetCode-tanishaborana970-FFA116?style=flat-square&logo=leetcode&logoColor=black)](https://leetcode.com/tanishaborana970/)
[![GeeksforGeeks](https://img.shields.io/badge/GFG-tanishabw22l-2F8D46?style=flat-square&logo=geeksforgeeks&logoColor=white)](https://auth.geeksforgeeks.org/user/tanishabw22l)

📧 tanishaborana970@gmail.com

*LNCT'25 | Full-Stack Developer | MERN Stack Enthusiast*

</div>

---

<div align="center">

⭐ If you found this project helpful, please consider giving it a **star**!

</div>