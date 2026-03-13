import Leave from "../models/Leave.js";
import User from "../models/User.js";
import moment from "moment";

// Apply Leave
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const userId = req.user._id;

    const start = moment(startDate, "YYYY-MM-DD").startOf("day");
    const end = moment(endDate, "YYYY-MM-DD").startOf("day");

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end.isBefore(start)) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    if (start.isBefore(moment().startOf("day"))) {
      return res.status(400).json({
        message: "Cannot apply leave for past dates",
      });
    }

    const daysRequested = end.diff(start, "days") + 1;

    const user = await User.findById(userId);

    if (user.leaveBalance < daysRequested) {
      return res.status(400).json({
        message: "Insufficient leave balance",
      });
    }

    const leave = await Leave.create({
      user: userId,
      leaveType,
      startDate: start.toDate(),
      endDate: end.toDate(),
      totalDays: daysRequested,
      reason,
      status: "Pending",
    });

    res.status(201).json(leave);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Logged-in User Leaves
export const getUserLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      user: req.user._id,
    }).sort({ appliedDate: -1 });

    res.json(leaves);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Admin: Get All Leaves
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("user", "name email")
      .sort({ appliedDate: -1 });

    res.json(leaves);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Admin: Approve or Reject Leave
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    console.log("Current leave status:", leave.status);
    console.log("Requested status update:", status);
    console.log("Leave ID:", leave.user);

    const user = await User.findById(leave.user);

    console.log("User found for leave request:", user ? user.name : "No user found");

    // Approve Leave
    if (status === "Approved" && leave.status === "Pending") {
      if (user.leaveBalance < leave.totalDays) {
        return res.status(400).json({
          message: "Insufficient leave balance",
        });
      }

      user.leaveBalance -= leave.totalDays;
      await user.save();
    }

    // Restore balance if rejected after approval
    if (status === "Rejected" && leave.status === "Approved") {
      user.leaveBalance += leave.totalDays;
      await user.save();
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.comments = comments;

    await leave.save();

    res.json(leave);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Cancel Leave
export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending leaves can be cancelled",
      });
    }

    await leave.deleteOne();

    res.json({
      message: "Leave request cancelled successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Leave Balance
export const getLeaveBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      leaveBalance: user.leaveBalance,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};