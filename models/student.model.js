const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  studentId: { type: String },
  Rollnumber: { type: String },
  aadhar: { type: String },
  janAadhar: { type: String },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
  },

  name: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  category: { type: String, enum: ["SC", "OBC", "ST", "GENERAL", "SBC"] },
  contactPhone: { type: String },
  contactEmail: { type: String },
  address: { type: String },
  batchYear: { type: String },
  class: { type: String },
  subject: { type: String },
  fatherName: { type: String },
  motherName: { type: String },
  guardianContact: { type: String },
  admissionFees: { type: Number },
  transportFees: { type: Number },
  other: { type: Number },
  feesPaid: [{ type: Schema.Types.ObjectId, ref: "FeesPaid" }],
  fees: { type: Number },
  lastYearDueFees: { type: Number, default: 0 },
  feesStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  totalFees: { type: Number },
});

const Student = mongoose.model("Student", studentSchema);

studentSchema.pre("findOneAndDelete", async function (next) {
  const student = await this.model.findOne(this.getFilter()); // Get the student being deleted
  if (student) {
    await Attendance.deleteMany({ student: student._id }); // Delete related attendance records
  }
  next();
});

module.exports = Student;
