const mongoose = require("mongoose");
const { Schema } = mongoose;

const SalarySchema = new Schema({
  staffId: { type: Schema.Types.ObjectId, ref: "Staff" },
  amount: { type: Number, required: true, default: 0 },
  method: { type: String },
  date: { type: Date, default: Date.now },
  batch: { type: String },
  remarks: { type: String },
});

const Salary = mongoose.model("Salary", SalarySchema);

module.exports = Salary;
