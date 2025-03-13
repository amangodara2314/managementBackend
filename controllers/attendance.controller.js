const Attendance = require("../models/attendance.model");
const Student = require("../models/student.model");

const markAttendance = async (req, res) => {
  try {
    const { date, students } = req.body;

    if (!date || !students || !Array.isArray(students)) {
      return res.status(400).json({ msg: "Invalid request data" });
    }

    await Promise.all(
      students.map(async ({ id, status }) => {
        await Attendance.findOneAndUpdate(
          { student: id, date },
          { $set: { status } },
          { upsert: true, new: true }
        );
      })
    );

    res.json({ msg: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attendanceRecords = await Attendance.find({
      student: studentId,
    }).populate("student", "name Rollnumber");

    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance", error });
  }
};

module.exports = { markAttendance, getAttendance };
