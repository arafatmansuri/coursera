const z = require("zod");
const Course = require("../models/course.model.js");
const Purchase = require("../models/purchase.model.js");
const User = require("../models/user.model.js");
const Admin = require("../models/admin.model.js");
const { deleteFile } = require("../utils/fileUploader.js");
//User Accessible Controllers
async function previewCourses(req, res) {
  // const courses = await Course.find({});
  const courses = await Admin.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "createrId",
        as: "courses",
      },
    },
    {
      $unwind: "$courses",
    },
    {
      $project: {
        courseId: "$courses._id",
        _id: 0,
        username: 1,
        courseTitle: "$courses.title",
        courseDesc: "$courses.description",
        coursePrice: "$courses.price",
        courseImg: "$courses.imageUrl",
      },
    },
  ]);
  return res
    .status(200)
    .json({ message: "Courses fetched successfully", courses });
}
async function purchaseCourse(req, res) {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });
  const ruser = req.user;
  const user = await User.findById(ruser._id);
  const purchase = await Purchase.findOne({
    $and: [{ userId: user._id }, { courseId: course._id }],
  });
  if (purchase)
    return res.status(404).json({ message: "Course already purchased" });
  const newPurchase = await Purchase.create({
    userId: user._id,
    courseId: course._id,
  });
  return res.status(200).json({ message: "Course purchased successfully" });
}

//Admin Accessible Controllers
async function addCourse(req, res) {
  try {
    const admin = req.user;
    const reqBody = z.object({
      title: z.string().min(5, { message: "title length is too short" }).trim(),
      description: z.string().trim(),
      price: z.string(),
    });
    const safeParse = reqBody.safeParse(req.body);
    if (!safeParse.success) {
      deleteFile(req.imgId);
      return res.status(400).json({
        message: safeParse.error.errors[0].message,
      });
    }
    const course = await Course.create({
      title: safeParse.data.title,
      description: safeParse.data.description,
      imageUrl: req.imgId,
      price: Number(safeParse.data.price),
      createrId: admin._id,
    });

    return res.status(200).json({ message: "Course added", course });
  } catch (err) {
    deleteFile(req.imgId);
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function displayAdminCourses(req, res) {
  const admin = req.user;
  const courses = await Admin.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "createrId",
        as: "courses",
      },
    },
    {
      $unwind: "$courses",
    },
    {
      $match: {
        $and: [{ _id: admin._id, role: "Admin" }],
      },
    },
    {
      $project: {
        _id: 0,
        courseId: "$courses._id",
        courseTitle: "$courses.title",
        courseDesc: "$courses.description",
        coursePrice: "$courses.price",
        courseImg: "$courses.imageUrl",
      },
    },
  ]);
  return res
    .status(200)
    .json({ message: "Courses fetched successfully", courses });
}
async function updateCourse(req, res) {
  const courseId = req.params.courseId;
  const admin = req.user;
  const reqBody = z.object({
    title: z.string().min(5, { message: "title length is too short" }).trim(),
    description: z.string().trim(),
    imageUrl: z.string(),
    price: z.number(),
  });
  const safeParse = reqBody.safeParse(req.body);
  if (!safeParse.success) {
    return res.status(400).json({ message: safeParse.error.errors[0].message });
  }
  const course = await Course.findById(courseId);
  if (!course.createrId.equals(admin._id)) {
    return res
      .status(401)
      .json({ message: "You don't have access to update this course" });
  }
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      $set: {
        title: safeParse.data.title,
        description: safeParse.data.description,
        imageUrl: safeParse.data.imageUrl,
        price: safeParse.data.price,
      },
    },
    { new: true }
  );
  if (!updatedCourse)
    return res.status(404).json({ message: "Course not found" });

  return res
    .status(200)
    .json({ message: "Course updated successfully", updatedCourse });
}
async function deleteCourse(req, res) {
  try {
    const admin = req.user;
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course.createrId.equals(admin._id)) {
      return res
        .status(401)
        .json({ message: "You don't have access to update this course" });
    }
    const courseToBeDeleted = await Course.findByIdAndDelete(courseId);
    if (!courseToBeDeleted) {
      return res.status(404).json({ message: "course not found" });
    }
    return res.status(200).json({ message: "course deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "something went wrong from our side" });
  }
}
module.exports = {
  previewCourses,
  purchaseCourse,
  addCourse,
  displayAdminCourses,
  updateCourse,
  deleteCourse,
};
