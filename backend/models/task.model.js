const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
     user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
 
  },

  partyName: {
    type: String,
    required: true,
    trim: true
  },

  type: {
    type: String,
    enum: ["CREDIT", "DEBIT"],
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 1
  },

  description: String,

  category: {
    type: String,
    default: "general"
  },

  paymentMode: {
    type: String,
    enum: ["CASH", "UPI", "BANK"],
    default: "CASH"
  },

  date: {
    type: Date,
    required: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
