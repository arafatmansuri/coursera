const { Router } = require("express");
const { adminAuth } = require("../middlewears/admin.middlewear");
const {
  addContent,
  updateContent,
  deleteContent,
  getContent,
} = require("../controllers/courseContent.controller");

const courseContentRouter = Router();

courseContentRouter.use(adminAuth);

courseContentRouter.route("/add/:courseId").post(addContent);
courseContentRouter.route("/update/:contentId").put(updateContent);
courseContentRouter.route("/delete/:contentId").delete(deleteContent);
courseContentRouter.route("/display/:courseId").get(getContent);

module.exports = courseContentRouter;
