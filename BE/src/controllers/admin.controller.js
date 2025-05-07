const Admin = require("../models/admin.model");
const OTP = require("../models/otp.model");
const z = require("zod");
const jwt = require("jsonwebtoken");
async function generateAccessAndRefreshToken(adminId) {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    const accessToken = await admin.generateAccessToken();
    const refreshToken = await admin.generateRefreshToken();
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function signup(req, res) {
  try {
    const reqSchema = z.object({
      username: z.string().min(3, { message: "username is too short" }).trim(),
      email: z.string().email({ message: "Invalid email address" }),
      password: z
        .string()
        .regex(/[A-Z]/, {
          message: "Pasword should include atlist 1 uppercase",
        })
        .regex(/[a-z]/, {
          message: "Pasword should include atlist 1 lowercase",
        })
        .regex(/[0-9]/, {
          message: "Pasword should include atlist 1 number",
        })
        .regex(/[^A-Za-z0-9]/, {
          message: "Pasword should include atlist 1 special charcter",
        })
        .min(8, { message: "Password length shouldn't be less than 8" }),
    });
    const safeParse = reqSchema.safeParse(req.body);
    if (!safeParse.success) {
      return res
        .status(400)
        .json({ message: safeParse.error.errors[0].message });
    }
    const admin = await Admin.findOne({
      $or: [{ username: safeParse.data.username, email: safeParse.data.email }],
    });
    if (admin) {
      return res
        .status(409)
        .json({ message: "User already exists with this username or email" });
    }
    const newAdmin = await Admin.create({
      username: safeParse.data.username,
      email: safeParse.data.email,
      password: safeParse.data.password,
    });

    const createdAdmin = await Admin.findById(newAdmin._id).select(
      "-password -refreshToken"
    );

    if (!createdAdmin) {
      return res
        .status(500)
        .json({ message: "Something went wrong from our side." });
    }

    return res
      .status(200)
      .json({ message: "Admin created successfully", admin: createdAdmin });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function signupOTPGeneration(req, res) {
  try {
    const reqSchema = z.object({
      email: z.string().email({ message: "Invalid email address" }),
    });
    const safeParse = reqSchema.safeParse(req.body);
    if (!safeParse.success) {
      return res
        .status(400)
        .json({ message: safeParse.error.errors[0].message });
    }
    const admin = await Admin.findOne({ email: safeParse.data.email });
    if (admin) {
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }
    const IsOtpExists = await OTP.find({ email: safeParse.data.email })
      .sort({ createdAt: -1 })
      .limit(1);
    if (IsOtpExists.length === 1) {
      const otpCreatedTime = new Date(IsOtpExists[0]?.createdAt).getMinutes();
      if (new Date().getMinutes() - otpCreatedTime <= 2) {
        return res
          .status(403)
          .json({ message: "Wait 2 minutes before sending new OTP" });
      }
    }
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const newOtp = await OTP.create({
      email: safeParse.data.email,
      otp,
      subject: "OTP for admin signup",
    });
    if (!newOtp) {
      return res.status(500).json({ message: "OTP not generated" });
    }
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 10 * 60000, // 10 minutes
    };
    return res
      .cookie("signup_id", { email: newOtp.email }, cookieOptions)
      .status(200)
      .json({ message: "OTP sent successfully", newOtp });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function forgetPasswordOTPGeneration(req, res) {
  try {
    let user;
    let inputType;
    if (
      req.body.input.match(/^[a-zA-z0-9._%+-]+@[a-zA-z0-9.-]+\.[a-zA-z]{2,}$/)
    ) {
      inputType = "email";
      user = await Admin.findOne({ email: req.body.input });
    } else {
      inputType = "username";
      user = await Admin.findOne({ username: req.body.input });
    }
    if (!user) {
      return res
        .status(409)
        .json({ message: `User doesn't exists with this ${inputType}` });
    }
    const IsOtpExists = await OTP.find({
      $and: [{ email: req.body.input, type: "forget" }],
    })
      .sort({ createdAt: -1 })
      .limit(1);
    if (IsOtpExists.length === 1) {
      const otpCreatedTime = new Date(IsOtpExists[0]?.createdAt).getMinutes();
      if (new Date().getMinutes() - otpCreatedTime <= 2) {
        return res
          .status(403)
          .json({ message: "Wait 2 minutes before sending new OTP" });
      }
    }
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const newOtp = await OTP.create({
      email: user.email,
      otp,
      subject: "OTP for forget password",
      type: "forget",
    });
    if (!newOtp) {
      return res.status(500).json({ message: "OTP not generated" });
    }
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 10 * 60000, // 10 minutes
    };
    return res
      .cookie("signup_id", { email: newOtp.email }, cookieOptions)
      .status(200)
      .json({ message: "OTP sent successfully", newOtp });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function signupOTPVerification(req, res) {
  try {
    const reqSchema = z.object({
      username: z.string().min(3, { message: "username is too short" }).trim(),
      password: z
        .string()
        .regex(/[A-Z]/, {
          message: "Password should include atlist 1 uppercase",
        })
        .regex(/[a-z]/, {
          message: "Password should include atlist 1 lowercase",
        })
        .regex(/[0-9]/, {
          message: "Password should include atlist 1 number",
        })
        .regex(/[^A-Za-z0-9]/, {
          message: "Password should include atlist 1 special charcter",
        })
        .min(8, { message: "Password length shouldn't be less than 8" }),
      otp: z.number(),
    });
    const safeParse = reqSchema.safeParse(req.body);
    if (!safeParse.success) {
      return res
        .status(400)
        .json({ message: safeParse.error.errors[0].message });
    }
    const { email } = req.cookies.signup_id;
    const IsOtpExists = await OTP.find({ email: email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (
      IsOtpExists.length === 0 ||
      safeParse.data.otp !== IsOtpExists[0]?.otp
    ) {
      return res.status(400).json({
        message: "The OTP is not valid",
      });
    }
    const admin = await Admin.findOne({ username: safeParse.data.username });
    if (admin)
      return res
        .status(409)
        .json({ message: "this username is not available" });

    const newAdmin = await Admin.create({
      username: safeParse.data.username,
      email,
      password: safeParse.data.password,
    });

    const createdAdmin = await Admin.findById(newAdmin._id).select(
      "-password -refreshToken"
    );

    if (!createdAdmin) {
      return res
        .status(500)
        .json({ message: "Something went wrong from our side." });
    }
    await OTP.deleteMany({ email });
    return res
      .status(200)
      .json({ message: "User signup successfull", createdAdmin });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function forgetPasswordOTPVerification(req, res) {
  try {
    const reqSchema = z.object({
      otp: z.string((val) => Number(val), z.number()).length(6),
      password: z
        .string()
        .regex(/[A-Z]/, {
          message: "Password should include atlist 1 uppercase",
        })
        .regex(/[a-z]/, {
          message: "Password should include atlist 1 lowercase",
        })
        .regex(/[0-9]/, {
          message: "Password should include atlist 1 number",
        })
        .regex(/[^A-Za-z0-9]/, {
          message: "Password should include atlist 1 special charcter",
        })
        .min(8, { message: "Password length shouldn't be less than 8" }),
    });
    const safeParse = reqSchema.safeParse(req.body);
    if (!safeParse.success) {
      return res
        .status(400)
        .json({ message: safeParse.error.errors[0].message });
    }
    const { email } = req.cookies.signup_id;
    const IsOtpExists = await OTP.find({
      $and: [{ email: email, type: "forget" }],
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (
      IsOtpExists.length === 0 ||
      safeParse.data.otp !== IsOtpExists[0]?.otp
    ) {
      return res.status(400).json({
        message: "The OTP is not valid",
      });
    }
    const user = await Admin.findOne({ email: email });
    if (!user)
      return res
        .status(500)
        .json({ message: "Something went wrong from our side" });

    user.password = safeParse.data.password;
    await user.save({ validateBeforeSave: false });
    await OTP.deleteMany({ $and: [{ email: email, type: "forget" }] });
    return res
      .status(200)
      .json({ message: "Password forgetted successfully", createdUser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function signin(req, res) {
  try {
    const reqSchema = z.object({
      username: z.string().min(3, { message: "username is too short" }).trim(),
      password: z.string(),
    });
    const safeParse = reqSchema.safeParse(req.body);
    if (!safeParse.success) {
      return res
        .status(400)
        .json({ message: safeParse.error.errors[0].message });
    }
    const admin = await Admin.findOne({ username: safeParse.data.username });
    if (!admin) {
      return res
        .status(404)
        .json({ message: "User already doesn't exists with this username" });
    }
    if (!admin.isPasswordCorrect(safeParse.data.password)) {
      return res.status(404).json({ message: "Invalid password" });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      admin._id
    );
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({ message: "User logged in successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function refreshAccessAndRefreshToken(req, res) {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decodedToken = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET_ADMIN
    );
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await Admin.findById(decodedToken._id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({ message: "Access token refreshed successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function logout(req, res) {
  return res
    .clearCookie("accessToken", { path: "/" })
    .clearCookie("refreshToken", { path: "/" })
    .end();
}
async function getAdmin(req, res) {
  const admin = req.user;
  return res
    .status(200)
    .json({ message: "Admin data fecthed successfully", admin });
}
async function changeCurrentPassword(req, res) {
  try {
    const admin = req.user;
    const { oldPassword, newPassword } = req.body;
    const user = await Admin.findById(admin._id);
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Incorrect password" });
    const PasswordValidation = z
      .string()
      .regex(/[A-Z]/, {
        message: "Password must contain at list one upperCase",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at list one lowerCase",
      })
      .regex(/[0-9]/, { message: "Password must contain at list one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contains at list one special char",
      })
      .min(8, { message: "Password is to short" });
    const validatePassword = PasswordValidation.safeParse(newPassword);
    if (!validatePassword.success)
      return res
        .status(400)
        .json({ message: validatePassword.error.errors[0].message });
    user.password = validatePassword.data;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "something went wrong from our side" });
  }
}
async function changeCurrentUsername(req, res) {
  try {
    const admin = req.user;
    const { newUsername, password } = req.body;
    const user = await Admin.findById(admin._id);
    const isPasswordCorrect = user.isPasswordCorrect(password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Incorrect password" });
    const usernameValidation = z
      .string()
      .min(3, { message: "Password is to short" });
    const validateUsername = usernameValidation.safeParse(newUsername);
    if (!validateUsername.success)
      return res
        .status(400)
        .json({ message: validateUsername.error.errors[0].message });
    const isUsernameExists = await Admin.findOne({
      username: validateUsername.data,
    });
    if (isUsernameExists)
      return res.status(400).json({ message: "Username unavailable" });
    user.username = validateUsername.data;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ message: "Username changed successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "something went wrong from our side" });
  }
}
module.exports = {
  signup,
  signupOTPGeneration,
  signupOTPVerification,
  signin,
  refreshAccessAndRefreshToken,
  logout,
  getAdmin,
  changeCurrentPassword,
  changeCurrentUsername,
};
