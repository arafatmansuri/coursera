const CourseContent = require("../models/courseContent.model");

async function addContent() {
  try {
    const courseId = req.params.courseId;
    const { title, description, assignmentsStr, video } = req.body;
    const videoNo = (await CourseContent.countDocuments({ courseId })) + 1;
    console.log(videoNo);
    const assigments = assignmentsStr.split(" ");
    const newContent = await CourseContent.create({
      title,
      description,
      assigments,
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
async function updateContent() {}
async function deleteContent() {}
async function getContent() {}

module.exports = {
  addContent,
  updateContent,
  deleteContent,
  getContent,
};
