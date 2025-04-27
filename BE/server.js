const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();
const port = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("DB connected!");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => console.error("Error connecting to Mongo", err));
