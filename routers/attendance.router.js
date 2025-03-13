const express = require("express");
const {
  markAttendance,
  getAttendance,
} = require("../controllers/attendance.controller");

const AttendanceRouter = express.Router();

AttendanceRouter.post("/mark", markAttendance);
AttendanceRouter.get("/:studentId", getAttendance);

module.exports = AttendanceRouter;
