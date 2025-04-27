const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
async function userAuth(req, res, next) {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ message: "Unathorized" });
    }
    const decodedToken = jwt.verify(accessToken, process.env.accessToken);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unathorized" });
    }
    const user = await User.findById(decodedToken._id);
    if (!user) {
      return res.status(401).json({ message: "Unathorized" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message || "Unathorized" });
  }
}
module.exports = { userAuth };
