import Attendance from '../models/Attendance.js';
import mongoose from 'mongoose';
import moment from 'moment';

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private
export const markAttendance = async (req, res) => {
  try {
    const { status, date } = req.body;
    
    // Check if user exists in request (from auth middleware)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user._id;

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Check if date is in future
    if (moment(date).isAfter(moment(), 'day')) {
      return res.status(400).json({ message: 'Cannot mark attendance for future dates' });
    }

    // Validate date format
    if (!date || !moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Check if attendance already marked for this date
    const existingAttendance = await Attendance.findOne({
      user: userId,
      date: date
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      user: userId,
      date,
      status
    });

    // Populate user data for response
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('user', 'name email');

    res.status(201).json(populatedAttendance);
  } catch (error) {
    console.error('Error marking attendance:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's attendance
// @route   GET /api/attendance/my-attendance
// @access  Private
export const getUserAttendance = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { month, year } = req.query;
    let query = { user: req.user._id };

    if (month && year) {
      const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
      const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'name email')
      .sort({ date: -1 });
      
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance records (admin only)
// @route   GET /api/attendance/all
// @access  Private/Admin
export const getAllAttendance = async (req, res) => {
  try {
    const { date, userId } = req.query;
    let query = {};

    if (date) {
      query.date = date;
    }

    if (userId && userId !== 'all' && userId !== '') {
      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }
      query.user = userId;
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'name email')
      .sort({ date: -1 });
      
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance summary
// @route   GET /api/attendance/summary/:userId?
// @access  Private
export const getAttendanceSummary = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { month, year } = req.query;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    const attendance = await Attendance.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalDays = moment(endDate).date();
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;

    res.json({
      month,
      year,
      totalDays,
      presentDays,
      absentDays,
      attendance
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: error.message });
  }
};