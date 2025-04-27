const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./src/routes/user.router.js");
const adminRouter = require("./src/routes/admin.router.js");
const courseRouter = require("./src/routes/course.router.js");
const app = express();
mongoose.connect(process.env.MONGODB_URI);
app.get("/", (req, res) => {
  return res.json({ message: "Backend running perfectly" });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);
module.exports = app;
