const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Present", "Absent", "Late", "Holiday", "Not Marked"],
    required: true,
  },
  remarks: { type: String },
  holidayReason: { type: String },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
