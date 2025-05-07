const { Router } = require("express");
const {
  signup,
  signin,
  logout,
  refreshAccessAndRefreshToken,
  getUser,
  getUserPurchases,
  signupOTPGeneration,
  signupOTPVerification,
  changeCurrentPassword,
  changeCurrentUsername,
  forgetPasswordOTPGeneration,
  forgetPasswordOTPVerification,
} = require("../controllers/user.controller.js");
const { userAuth } = require("../middlewears/user.middlewear.js");

const userRouter = Router();

userRouter.route("/signup").post(signup);
userRouter.route("/signup/gen").post(signupOTPGeneration);
userRouter.route("/signup/verify").post(signupOTPVerification);
userRouter.route("/forgetpassword/gen").post(forgetPasswordOTPGeneration);
userRouter.route("/forgetpassword/verify").post(forgetPasswordOTPVerification);
userRouter.route("/signin").post(signin);

// secured routes - add auth middlewear
userRouter.use(userAuth);
userRouter.route("/logout").get(logout);
userRouter.route("/reftoken").post(refreshAccessAndRefreshToken);
userRouter.route("/getuser").get(getUser);
userRouter.route("/getpurchases").get(getUserPurchases);
userRouter.route("/changepassword").post(changeCurrentPassword);
userRouter.route("/changeusername").post(changeCurrentUsername);

module.exports = userRouter;
