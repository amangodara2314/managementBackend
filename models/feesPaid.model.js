const mongoose = require("mongoose");
const { Schema } = mongoose;

const feesPaidSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "Student" },
  amount: { type: Number, required: true },
  type: { type: String },
  batch: { type: String },
  date: { type: Date, default: Date.now },
});

const FeesPaid = mongoose.model("FeesPaid", feesPaidSchema);

module.exports = FeesPaid;
