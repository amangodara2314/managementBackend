const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const StudentRouter = require("./routers/student.router");
const FeesPaidRouter = require("./routers/feesPaid.router");
const StaffRouter = require("./routers/staff.router");
const SalaryRouter = require("./routers/salary.router");
const ExpenditureRouter = require("./routers/expenditure.router");
const AttendanceRouter = require("./routers/attendance.router");
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URL = "mongodb://localhost:27017";
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

app.use("/students", StudentRouter);
app.use("/fees", FeesPaidRouter);
app.use("/staff", StaffRouter);
app.use("/salary", SalaryRouter);
app.use("/expenditure", ExpenditureRouter);
app.use("/attendance", AttendanceRouter);

mongoose
  .connect(MONGODB_URL, { dbName: "FGC-MANAGEMENT" })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
