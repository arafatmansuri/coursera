const express = require("express");
const userRouter = require("./src/routes/user.router.js");
const app = express();

app.get("/", (req, res) => {
  return res.json({ message: "Backend running perfectly" });
});

app.use("/api/v1/user", userRouter);

module.exports = app;
