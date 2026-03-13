import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["employee", "admin"],
      default: "employee",
    },
    dateOfJoining: Date,
    leaveBalance: {
      type: Number,
      default: 20,
    },
     isActive: {
    type: Boolean,
    default: true,
  },
  },
 
  { timestamps: true }
);



export default mongoose.model("User", userSchema);