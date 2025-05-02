const CourseContent = require("../models/courseContent.model.js");

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
async function updateContent() {
  try {
    const contentId = req.params.contentId;
    const { title, description, assignmentsStr, video } = req.body;
    const assigments = assignmentsStr.split(" ");
    const updatedCourseContent = await CourseContent.findByIdAndUpdate(
      contentId,
      {
        $set: {
          title,
          description,
          assigments,
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
async function deleteContent() {
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
async function getContent() {
  try {
    const courseId = req.params.courseId;
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
