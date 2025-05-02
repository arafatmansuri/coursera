const Course = require("../models/course.model.js");
const CourseContent = require("../models/courseContent.model.js");

async function addContent(req, res) {
  try {
    const admin = req.user;
    const courseId = req.params.courseId;
    const isValidCreator = await Course.findOne({
      $and: [{ createrId: admin._id, _id: courseId }],
    });
    if (!isValidCreator)
      return res.status(404).json({
        message: "You don't have permission to add content in this course",
      });
    const { title, description, assignments, video } = req.body;

    const videoNo = (await CourseContent.countDocuments({ courseId })) + 1;
    // const assigments = assignmentsStr.split(",");
    const newContent = await CourseContent.create({
      title,
      description,
      assignments,
      url: video,
      videoNo,
      courseId,
    });

    return res
      .status(200)
      .json({ message: "Video Added Successfully", newContent });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function updateContent(req, res) {
  try {
    const contentId = req.params.contentId;
    const { title, description, assignments, video } = req.body;
    const updatedCourseContent = await CourseContent.findByIdAndUpdate(
      contentId,
      {
        $set: {
          title,
          description,
          assignments,
          url: video,
        },
      },
      { new: true }
    );
    if (!updatedCourseContent)
      return res.status(404).json({ message: "Content not found" });
    return res
      .status(200)
      .json({ message: "Content updated successfully", updatedCourseContent });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "something went wrong from our side" });
  }
}
async function deleteContent(req, res) {
  try {
    const contentId = req.params.contentId;
    const contentToBeDeleted = await CourseContent.findByIdAndDelete(contentId);
    if (!contentToBeDeleted) {
      return res.status(404).json({ message: "content not found" });
    }
    return res.status(200).json({ message: "Content deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "something went wrong from our side" });
  }
}
async function getContent(req, res) {
  try {
    const admin = req.user;
    const courseId = req.params.courseId;
    const isValidCreator = await Course.findOne({
      $and: [{ createrId: admin._id, _id: courseId }],
    });
    if (!isValidCreator)
      return res.status(404).json({
        message: "You don't have permission to add content in this course",
      });
    const content = await CourseContent.find({ courseId });
    return res
      .status(200)
      .json({ message: "course content fetched successfully", content });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "something went wrong from our side" });
  }
}

module.exports = {
  addContent,
  updateContent,
  deleteContent,
  getContent,
};
