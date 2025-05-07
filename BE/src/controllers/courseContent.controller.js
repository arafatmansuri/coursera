const z = require("zod");
const Course = require("../models/course.model.js");
const CourseContent = require("../models/courseContent.model.js");
const { deleteFile } = require("../utils/fileUploader.js");
const mongoose = require("mongoose");

async function addContent(req, res) {
  try {
    const admin = req.user;
    const courseId = req.params.courseId;
    const isValidCreator = await Course.findOne({
      $and: [{ createrId: admin._id, _id: courseId }],
    });
    if (!isValidCreator) {
      await deleteFile(req.imgId);
      return res.status(404).json({
        message: "You don't have permission to add content in this course",
      });
    }
    const reqBody = z.object({
      title: z.string().min(5, { message: "title length is too short" }).trim(),
      description: z.string().trim(),
      assignments: z.array(z.string()),
    });
    const assignments = Array.isArray(req.body.assignments)
      ? req.body.assignments
      : JSON.parse(req.body.assignments);
    const safeParse = reqBody.safeParse({
      title: req.body.title,
      description: req.body.description,
      assignments: assignments,
    });
    if (!safeParse.success) {
      await deleteFile(req.imgId);
      return res
        .status(400)
        .json({ message: safeParse.error.errors[0].message });
    }
    const videoNo = (await CourseContent.countDocuments({ courseId })) + 1;
    const newContent = await CourseContent.create({
      title: safeParse.data.title,
      description: safeParse.data.description,
      assignments: safeParse.data.assignments,
      url: req.imgId,
      videoNo,
      courseId,
    });
    return res
      .status(200)
      .json({ message: "Video Added Successfully", newContent });
  } catch (err) {
    await deleteFile(req.imgId);
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function updateContent(req, res) {
  try {
    const admin = req.user;
    const contentId = req.params.contentId;
    const reqBody = z.object({
      title: z.string().min(5, { message: "title length is too short" }).trim(),
      description: z.string().trim(),
      assignments: z.array(),
    });
    const safeParse = reqBody.safeParse(req.body);
    if (!safeParse.success) {
      await deleteFile(req.imgId);
      return res
        .status(400)
        .json({ message: safeParse.error.errors[0].message });
    }
    const isContentPresent = await Course.aggregate([
      {
        $lookup: {
          from: "coursecontents",
          localField: "_id",
          foreignField: "courseId",
          as: "content",
        },
      },
      {
        $unwind: "$content",
      },
      {
        $match: {
          $and: [
            {
              createrId: admin._id,
              "content._id": new mongoose.Types.ObjectId(contentId),
            },
          ],
        },
      },
      {
        $project: {
          createrId: 1,
          contentId: "$content._id",
          contentTitle: "$content.title",
          fileId: "$content.url",
        },
      },
    ]);
    if (isContentPresent.length <= 0) {
      await deleteFile(req.imgId);
      return res.status(404).json({
        message: "You don't have access to make changes in this content",
      });
    }
    await deleteFile(isContentPresent[0].fileId);
    const updatedCourseContent = await CourseContent.findByIdAndUpdate(
      contentId,
      {
        $set: {
          title: safeParse.data.title,
          description: safeParse.data.description,
          assignments: safeParse.data.assignments,
          url: req.imgId,
        },
      },
      { new: true }
    );
    if (!updatedCourseContent) {
      await deleteFile(req.imgId);
      return res.status(404).json({ message: "Content not found" });
    }
    return res
      .status(200)
      .json({ message: "Content updated successfully", updatedCourseContent });
  } catch (err) {
    await deleteFile(req.imgId);
    return res
      .status(500)
      .json({ message: err.message || "something went wrong from our side" });
  }
}
async function deleteContent(req, res) {
  try {
    const admin = req.user;
    const contentId = req.params.contentId;
    const isContentPresent = await Course.aggregate([
      {
        $lookup: {
          from: "coursecontents",
          localField: "_id",
          foreignField: "courseId",
          as: "content",
        },
      },
      {
        $unwind: "$content",
      },
      {
        $match: {
          $and: [
            {
              createrId: admin._id,
              "content._id": new mongoose.Types.ObjectId(contentId),
            },
          ],
        },
      },
      {
        $project: {
          createrId: 1,
          contentId: "$content._id",
          contentTitle: "$content.title",
          fileId: "$content.url",
        },
      },
    ]);
    if (isContentPresent.length <= 0)
      return res.status(404).json({
        message: "No courses found",
      });
    await deleteFile(isContentPresent[0].fileId);
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
