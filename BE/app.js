const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./src/routes/user.router.js");
const adminRouter = require("./src/routes/admin.router.js");
const courseRouter = require("./src/routes/course.router.js");
require("dotenv").config();
const app = express();
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connected!"))
  .catch((err) => console.error("Error connecting to Mongo", err));
app.get("/", (req, res) => {
  return res.json({ message: "Backend running perfectly" });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);
module.exports = app;
