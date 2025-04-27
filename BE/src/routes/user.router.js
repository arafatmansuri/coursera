const { Router } = require("express");
const {
  signup,
  signin,
  logout,
  refreshAccessAndRefreshToken,
  getUser,
  getUserPurchases,
} = require("../controllers/user.controller.js");
const { userAuth } = require("../middlewears/user.middlewear.js");

const userRouter = Router();

userRouter.route("/signup").post(signup);
userRouter.route("/sigin").post(signin);

// secured routes - add auth middlewear
userRouter.use(userAuth);
userRouter.route("/logout").get(logout);
userRouter.route("/reftoken").post(refreshAccessAndRefreshToken);
userRouter.route("/getuser").get(getUser);
userRouter.route("/getpurchases").get(getUserPurchases);

module.exports = userRouter;
