import User from "../models/User.js";
import bcrypt from "bcryptjs";


// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Get User By ID
export const getUserById = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Update Leave Balance (Admin)
export const updateLeaveBalance = async (req, res) => {
  try {

    const { leaveBalance } = req.body;

    if (leaveBalance < 0) {
      return res.status(400).json({
        message: "Leave balance cannot be negative",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.leaveBalance = leaveBalance;

    await user.save();

    res.json({
      message: "Leave balance updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        leaveBalance: user.leaveBalance,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Create Default Admin
export const createAdmin = async (req, res) => {
  try {

    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@hrsystem.com",
      password: hashedPassword,
      role: "admin",
      dateOfJoining: new Date(),
      leaveBalance: 0,
    });

    res.status(201).json({
      message: "Admin created successfully",
      email: admin.email,
      password: "admin123",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};