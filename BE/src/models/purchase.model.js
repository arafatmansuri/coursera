const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PurchaseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
});

const Purchase = mongoose.model("Purchase",PurchaseSchema);

module.exports = Purchase;