import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./Routes/authRoutes.js";
import leaveRoutes from "./Routes/leaveRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import userRoutes from "./Routes/UserRoutes.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/", (req, res) => {
  res.send("Welcome to the Attendance Management System API");
});

app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);

export default app;