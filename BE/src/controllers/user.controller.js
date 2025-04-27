const User = require("../models/user.model");

async function generateAccessAndRefreshToken(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function signup(req, res) {}
async function signin(req, res) {}
async function refreshAccessAndRefreshToken(req, res) {}
async function logout(req, res) {}
async function getUser(req, res) {}
async function getUserPurchases(req, res) {}

module.exports = {
  signup,
  signin,
  refreshAccessAndRefreshToken,
  logout,
  getUser,
  getUserPurchases,
};
