const Admin = require("../models/admin.model");
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
async function logout(req, res) {}
async function getAdmin(req, res) {}

module.exports = {
  signup,
  signin,
  refreshAccessAndRefreshToken,
  logout,
  getAdmin,
};
