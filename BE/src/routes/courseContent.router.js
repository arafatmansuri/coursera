const { Router } = require("express");
const { adminAuth } = require("../middlewears/admin.middlewear");
const {
  addContent,
  updateContent,
  deleteContent,
  getContent,
} = require("../controllers/courseContent.controller");
const multer = require("multer");
const { uploadFile } = require("../utils/fileUploader");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const courseContentRouter = Router();

courseContentRouter.use(adminAuth);

courseContentRouter
  .route("/add/:courseId")
  .post(upload.single("video"), uploadFile, addContent);
courseContentRouter
  .route("/update/:contentId")
  .put(upload.single("video"), uploadFile, updateContent);
courseContentRouter.route("/delete/:contentId").delete(deleteContent);
courseContentRouter.route("/display/:courseId").get(getContent);

module.exports = courseContentRouter;
