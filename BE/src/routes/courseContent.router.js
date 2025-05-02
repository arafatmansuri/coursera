const { Router } = require("express");
const { adminAuth } = require("../middlewears/admin.middlewear");

const courseContentRouter = Router();

courseContentRouter.use(adminAuth);

courseContentRouter.route("/add").post();
courseContentRouter.route("/update").put();
courseContentRouter.route("/delete").delete();
courseContentRouter.route("/display").get();

module.exports = courseContentRouter;
