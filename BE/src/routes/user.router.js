const { Router } = require("express");
const { signup } = require("../controllers/user.controller.js");

const userRouter = Router();

userRouter.route("/signup", signup);

module.exports = userRouter;
