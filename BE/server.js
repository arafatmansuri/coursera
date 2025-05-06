const app = require("./app");
const connectDB = require("./src/db");
require("dotenv").config();
const port = process.env.PORT || 3001;
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => console.error("Error connecting to Mongo", err));
