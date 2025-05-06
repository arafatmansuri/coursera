const { GridFSBucket } = require("mongodb");
const connectDB = require("../db");
async function uploadFile(req, res, next) {
  const client = await connectDB();
  const bucket = new GridFSBucket(client, {
    bucketName: "courseThumbnail",
  });
  const filename = `${Date.now()}-${req.file.originalname.replace(
    /\s+/g,
    "_"
  )}`;
  const uploadStream = bucket.openUploadStream(filename);
  uploadStream.end(req.file.buffer);

  uploadStream.on("finish", async () => {
    req.imgId = uploadStream.id;
    next();
  });
}
module.exports = { uploadFile };
