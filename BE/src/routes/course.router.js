const { Router } = require("express");
const {
  previewCourses,
  purchaseCourse,
  addCourse,
  updateCourse,
  displayAdminCourses,
} = require("../controllers/course.controller.js");
const { userAuth } = require("../middlewears/user.middlewear.js");
const { adminAuth } = require("../middlewears/admin.middlewear.js");

const courseRouter = Router();

courseRouter.route("/preview").get(previewCourses);

courseRouter.route("/purchase/:courseId").post(userAuth, purchaseCourse);

//Only Admins Accessible routes
courseRouter.use(adminAuth);
courseRouter.route("/add").post(addCourse);
courseRouter.route("/update/:courseId").put(updateCourse);
courseRouter.route("/getpubcourses").get(displayAdminCourses);

module.exports = courseRouter;
