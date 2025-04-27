const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;
const AdminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
AdminSchema.pre("save", async (next) => {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);

  return next();
});

AdminSchema.methods.isPasswordCorrect = async (userPasword) => {
  return bcrypt.compareSync(userPasword, this.password);
};

AdminSchema.methods.generateAccessToken = async () => {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "1h" }
  );
};
AdminSchema.methods.generateRefreshToken = async () => {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN,
    { expiresIn: "1d" }
  );
};

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;
