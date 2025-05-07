const { Router } = require("express");
const {
  signup,
  signin,
  logout,
  refreshAccessAndRefreshToken,
  getAdmin,
  signupOTPVerification,
  signupOTPGeneration,
  changeCurrentPassword,
} = require("../controllers/admin.controller.js");
const { adminAuth } = require("../middlewears/admin.middlewear.js");

const adminRouter = Router();

adminRouter.route("/signup").post(signup);
adminRouter.route("/signin").post(signin);
adminRouter.route("/signup/gen").post(signupOTPGeneration);
adminRouter.route("/signup/verify").post(signupOTPVerification);
//secured routes
adminRouter.use(adminAuth);

adminRouter.route("/logout").get(logout);
adminRouter.route("/reftoken").post(refreshAccessAndRefreshToken);
adminRouter.route("/getadmin").get(getAdmin);
adminRouter.route("/changepassword").post(changeCurrentPassword);

module.exports = adminRouter;
