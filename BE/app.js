const express = require("express");
const userRouter = require("./src/routes/user.router.js");
const adminRouter = require("./src/routes/admin.router.js");
const courseRouter = require("./src/routes/course.router.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ["http://localhost:5500", "http://127.0.0.1:5500"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
  })
);
app.get("/", (req, res) => {
  return res.json({ message: "Backend running perfectly" });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);
module.exports = app;
