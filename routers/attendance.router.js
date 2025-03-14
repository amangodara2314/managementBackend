const express = require("express");
const {
  markAttendance,
  getAttendance,
  downloadAttendance,
} = require("../controllers/attendance.controller");

const AttendanceRouter = express.Router();

AttendanceRouter.post("/mark", markAttendance);
AttendanceRouter.get("/download", downloadAttendance);

module.exports = AttendanceRouter;
