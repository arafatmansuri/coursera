const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model.js");

async function adminAuth(req, res, next) {
  try {
    const accessToken = req.cookies.accessToken || req.headers("accessToken");
    if (!accessToken) {
      return res.status(401).json({ message: "Unathorized" });
    }
    const decodedToken = jwt.verify(accessToken, process.env.accessToken);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unathorized" });
    }
    const user = await Admin.findById(decodedToken._id);
    if (!user) {
      return res.status(401).json({ message: "Unathorized" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message || "Unathorized" });
  }
}
module.exports = { adminAuth };
