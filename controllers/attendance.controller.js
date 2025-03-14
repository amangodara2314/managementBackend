const Attendance = require("../models/attendance.model");
const Student = require("../models/student.model");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const markAttendance = async (req, res) => {
  const { date, students } = req.body;

  try {
    const updates = students.map((s) =>
      Attendance.updateOne(
        { student: s.id, date }, // Ensure uniqueness
        {
          $set: {
            status: s.status,
            holidayReason: s.status === "Holiday" ? s.holidayReason : null,
          },
        },
        { upsert: true } // Create if it doesn't exist
      )
    );

    await Promise.all(updates); // Run all updates in parallel

    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const generatePDF = (res, data, month, year) => {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, `attendance_${month}_${year}.pdf`);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);
  doc
    .fontSize(16)
    .text(`Attendance Report - ${month}/${year}`, { align: "center" });
  doc.moveDown();

  data.forEach((student) => {
    doc.fontSize(12).text(`Student: ${student.name}`);
    student.attendance.forEach((att) => {
      console.log(att);
      doc.text(
        `  - ${att.date.toISOString().split("T")[0]}: ${att.status} ${
          att.status === "Holiday" ? `(${att.holidayReason || ""})` : ""
        }`
      );
    });
    doc.moveDown();
  });

  doc.end();

  stream.on("finish", () => {
    res.download(filePath, `Attendance_${month}_${year}.pdf`, () => {
      fs.unlinkSync(filePath);
    });
  });
};

const generateExcel = async (res, data, month, year) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");

  console.log(data);

  worksheet.columns = [
    { header: "Student Name", key: "name", width: 20 },
    { header: "Date", key: "date", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Holiday Reason", key: "holidayReason", width: 20 },
  ];

  data.forEach((student) => {
    student.attendance.forEach((att) => {
      worksheet.addRow({
        name: student.name,
        date: att.date.toISOString().split("T")[0],
        status: att.status,
        holidayReason: att.status === "Holiday" ? att.holidayReason : "",
      });
    });
  });

  const filePath = path.join(__dirname, `attendance_${month}_${year}.xlsx`);
  await workbook.xlsx.writeFile(filePath);

  res.download(filePath, `Attendance_${month}_${year}.xlsx`, () => {
    fs.unlinkSync(filePath);
  });
};

const downloadAttendance = async (req, res) => {
  try {
    const { month, year, batch, cls, format } = req.query;
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(`${year}-${month}-31`);

    // MongoDB Aggregation Pipeline
    const students = await Student.aggregate([
      {
        $match: { batchYear: batch, class: cls }, // Filter students by batch & class
      },
      {
        $lookup: {
          from: "attendances",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$student", "$$studentId"] },
                    {
                      $gte: ["$date", startDate], // Filter for month range
                    },
                    {
                      $lte: ["$date", endDate],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                date: 1,
                status: 1,
                holidayReason: 1,
                _id: 0,
              },
            },
          ],
          as: "attendance",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          class: 1,
          batchYear: 1,
          attendance: {
            $map: {
              input: "$attendance",
              as: "att",
              in: {
                date: "$$att.date",
                status: "$$att.status",
                holidayReason: {
                  $cond: {
                    if: { $eq: ["$$att.status", "Holiday"] },
                    then: "$$att.holidayReason",
                    else: "",
                  },
                },
              },
            },
          },
        },
      },
    ]);

    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: "No attendance records found for the selected month and year.",
      });
    }

    console.log(students);
    // Handle requested format
    if (format === "pdf") {
      return generatePDF(res, students, month, year);
    }
    if (format === "excel") {
      return generateExcel(res, students, month, year);
    }

    // Default: JSON response
    res.status(200).json({
      success: true,
      month,
      year,
      attendance: students,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { markAttendance, downloadAttendance };
