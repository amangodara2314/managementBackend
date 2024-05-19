const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StaffSchema = new Schema({
  aadhar: { type: String },
  pan: { type: String },
  name: { type: String },
  category: { type: String },
  contactPhone: { type: String },
  batchYear: { type: String },
  fatherName: { type: String },
  salary: { type: Number },
  image: { type: String },
  salaryPaid: [{ type: mongoose.Schema.ObjectId, ref: "Salary" }],
});

const Staff = mongoose.model("Staff", StaffSchema);

module.exports = Staff;
