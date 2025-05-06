const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const connectInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    // console.log("MongoDB connected", connectInstance.connection.host);
    return connectInstance.connection.db;
  } catch (error) {
    console.log("MongoDB connection Error", error);
    process.exit(1);
  }
};
module.exports = connectDB;
