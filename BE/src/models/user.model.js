const mongoose = require("mongoose");
const BaseUser = require("./baseUser.model");

const UserSchema = new mongoose.Schema();

const User = BaseUser.discriminator("User", UserSchema);
module.exports = User;
