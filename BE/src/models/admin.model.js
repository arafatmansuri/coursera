const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./baseUser.model");
const Schema = mongoose.Schema;
const AdminSchema = new Schema();

AdminSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET_ADMIN,
    { expiresIn: "1h" }
  );
};
AdminSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET_ADMIN,
    { expiresIn: "1d" }
  );
};

const Admin = User.discriminator("Admin", AdminSchema);
module.exports = Admin;
