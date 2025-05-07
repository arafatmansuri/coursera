const mongoose = require("mongoose");
const sendMail = require("../utils/mailer");

const OtpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BaseUser",
  },
  username: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 10,
  },
  subject: {
    type: String,
    required: true,
  },
  type:{
    type:String,
    enum:["forget","signup"],
  }
});

OtpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendMail(this.email, this.subject, this.username, this.otp);
  }
  next();
});
const OTP = new mongoose.model("OTP", OtpSchema);

module.exports = OTP;
