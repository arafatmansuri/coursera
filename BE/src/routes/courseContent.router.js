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

courseContentRouter.route("/add").post(addContent);
courseContentRouter.route("/update").put(updateContent);
courseContentRouter.route("/delete").delete(deleteContent);
courseContentRouter.route("/display").get(getContent);

module.exports = courseContentRouter;
