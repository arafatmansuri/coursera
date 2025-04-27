const { Router } = require("express");
const {
  signup,
  signin,
  logout,
  refreshAccessAndRefreshToken,
  getAdmin,
} = require("../controllers/admin.controller.js");
const { adminAuth } = require("../middlewears/admin.middlewear.js");

const adminRouter = Router();

adminRouter.route("/signup").post(signup);
adminRouter.route("/signin").post(signin);

//secured routes
adminRouter.use(adminAuth);

adminRouter.route("/logout").get(logout);
adminRouter.route("/reftoken").post(refreshAccessAndRefreshToken);
adminRouter.route("/getadmin").get(getAdmin);

module.exports = adminRouter;