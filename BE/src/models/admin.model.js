const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./baseUser.model");
const Schema = mongoose.Schema;
const AdminSchema = new Schema();
/*AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);

  next();
});

AdminSchema.methods.isPasswordCorrect = function (userPasword) {
  return bcrypt.compareSync(userPasword, this.password);
};
*/
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

// const Admin = mongoose.model("Admin", AdminSchema);
const Admin = User.discriminator("Admin", AdminSchema);
module.exports = Admin;
