const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema({
  videoNo: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  assigments: [
    {
      type: String,
      trim: true,
    },
  ],
  url: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});

const CourseContent = new mongoose.model("CourseContent", ContentSchema);

module.exports = CourseContent;
