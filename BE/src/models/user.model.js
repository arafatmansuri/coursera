const mongoose = require("mongoose");
const BaseUser = require("./baseUser.model.js");

const UserSchema = new mongoose.Schema();

const User = BaseUser.discriminator("User", UserSchema);
module.exports = User;
