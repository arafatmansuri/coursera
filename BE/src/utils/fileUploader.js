const { GridFSBucket } = require("mongodb");
const connectDB = require("../db");
async function uploadFile(req, res, next) {
  try {
    const client = await connectDB();
    const bucket = new GridFSBucket(client, {
      bucketName: "courseContents",
    });
    const filename = `${Date.now()}-${req.file.originalname.replace(
      /\s+/g,
      "_"
    )}`;
    const uploadStream = bucket.openUploadStream(filename);
    uploadStream.end(req.file.buffer);
    uploadStream.on("finish", async () => {
      req.imgId = uploadStream.id;
      return next();
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Something went wrong from our side" });
  }
}
async function deleteFile(id) {
  try {
    const client = await connectDB();
    const bucket = new GridFSBucket(client, {
      bucketName: "courseContents",
    });
    await bucket.delete(id);
  } catch (err) {
    throw new Error(err.message || "Error while deleting file");
  }
}
module.exports = { uploadFile, deleteFile };
