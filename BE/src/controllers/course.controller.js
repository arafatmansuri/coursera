const Course = require("../models/course.model.js");
const Purchase = require("../models/purchase.model.js");
const User = require("../models/user.model.js");
//User Accessible Controllers
async function previewCourses(req, res) {
  const courses = await Course.find({});
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
    $or: [{ userId: user._id }, { courseId: course._id }],
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
  const admin = req.user;
  const { title, description, imageUrl, price } = req.body;

  const course = await Course.create({
    title,
    description,
    imageUrl,
    price,
    createdId: admin._id,
  });

  return res.status(200).json({ message: "Course added", course });
}
async function displayAdminCourses(req, res) {
  const admin = req.user;
  const courses = await Course.find({ createdId: admin._id });
  return res
    .status(200)
    .json({ message: "Courses fetched successfully", courses });
}
async function updateCourse(req, res) {
  const courseId = req.params.courseId;
  const admin = req.user;
  const { title, description, imageUrl, price } = req.body;
  const course = await Course.findById(courseId);
  if (!course.createdId === admin._id) {
    return res
      .status(401)
      .json({ message: "You don't have access to update this course" });
  }
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      $set: {
        title,
        description,
        imageUrl,
        price,
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

module.exports = {
  previewCourses,
  purchaseCourse,
  addCourse,
  displayAdminCourses,
  updateCourse,
};
