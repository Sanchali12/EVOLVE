const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type : String,
    default : "general",
  },
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},
  completed: {
    type: Boolean,
    default: false
  },
  streak : {
    type : Number,
    default : 0,
  },
  lastCompleted : {
    type:  Date,
    default : null,
  },
  lastResetDate: {
    type : Date,
    default : Date.now,
  },
  history:{
    type : [Date],
    default : []
  },
  longestStreak: {
    type : Number,
    default: 0,
  },
},
  {timestamps : true}
);

module.exports = mongoose.model("Habit", habitSchema);