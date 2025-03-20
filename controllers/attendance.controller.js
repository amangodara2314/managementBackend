const Attendance = require("../models/attendance.model");
const Student = require("../models/student.model");
const PDFDocument = require("pdfkit-table");
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

const generateExcel = async (res, data, month, year) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");

  const headerRow = ["Sr.", "Student Name"];
  const allDates = [
    ...new Set(
      data.flatMap((student) => student.attendance.map((att) => att.date))
    ),
  ];
  headerRow.push(...allDates);
  worksheet.addRow(headerRow);

  data.forEach((student, index) => {
    const row = [index + 1, student.name];
    allDates.forEach((date) => {
      const record = student.attendance.find((att) => att.date === date);
      row.push(record ? record.status : "Not Marked");
    });
    worksheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Attendance_${month}_${year}.xlsx`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buffer);
};

const generatePDF = async (res, data, month, year, cls, batch) => {
  try {
    // Set smaller margins and use more space
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 15, // Reduce margins further
    });

    const filePath = path.join(__dirname, `attendance_${month}_${year}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Get all dates from the data
    const allDates = Array.from(
      new Set(
        data.flatMap((student) =>
          student.attendance.map((att) =>
            new Date(att.date).getDate().toString().padStart(2, "0")
          )
        )
      )
    ).sort((a, b) => parseInt(a) - parseInt(b));

    // Increase dates per page to maximize space usage
    const DATES_PER_PAGE = 16; // Show full month if possible
    const dateChunks = [];
    for (let i = 0; i < allDates.length; i += DATES_PER_PAGE) {
      dateChunks.push(allDates.slice(i, i + DATES_PER_PAGE));
    }

    // Calculate page dimensions
    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const pageHeight =
      doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

    // Process each chunk of dates (each page)
    for (let pageIndex = 0; pageIndex < dateChunks.length; pageIndex++) {
      if (pageIndex > 0) {
        doc.addPage({ margin: 15 });
      }

      // Compact header with minimal spacing
      doc
        .fontSize(10)
        .text(
          `Attendance Report - ${month}/${year} (${cls.toUpperCase()} ${batch})`,
          {
            align: "center",
          }
        )
        .moveDown(0.1);

      doc
        .fontSize(7)
        .text(`Page ${pageIndex + 1} of ${dateChunks.length}`, {
          align: "right",
        })
        .moveDown(0.1);

      const currentDates = dateChunks[pageIndex];

      // Calculate optimal row height based on data length
      const rowHeight = Math.min(
        20,
        Math.floor((pageHeight - 40) / (data.length + 1))
      );

      // Prepare table data with compact layout
      const tableData = {
        headers: ["Sr.", "Student Name", ...currentDates],
        rows: data.map((student, index) => {
          const attendanceData = currentDates.map((date) => {
            const record = student.attendance.find(
              (att) =>
                new Date(att.date).getDate().toString().padStart(2, "0") ===
                date
            );

            if (!record) return "N/A";
            switch (record.status) {
              case "Present":
                return "P";
              case "Absent":
                return "A";
              case "Holiday":
                return "H";
              default:
                return "N/A";
            }
          });

          return [(index + 1).toString(), student.name, ...attendanceData];
        }),
      };

      // Calculate optimized column widths
      const srWidth = 20;
      const nameWidth = 100;
      const dateWidth = Math.floor(
        (pageWidth - srWidth - nameWidth) / currentDates.length
      );

      // Draw table with minimal spacing
      await doc.table(tableData, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(7),
        prepareRow: () => doc.font("Helvetica").fontSize(7),
        padding: 2,
        columnSpacing: 1,
        width: pageWidth,
        x: doc.page.margins.left,
        columnsSize: [
          srWidth,
          nameWidth,
          ...Array(currentDates.length).fill(dateWidth),
        ],
        divider: {
          header: { disabled: false, width: 0.5, opacity: 1 },
          horizontal: { disabled: false, width: 0.2, opacity: 0.5 },
        },
        minRowHeight: rowHeight,
        maxRowHeight: rowHeight,
      });
    }

    doc.end();

    writeStream.on("finish", () => {
      res.download(filePath, `Attendance_${month}_${year}.pdf`, (err) => {
        if (err) {
          console.error("Error during download:", err);
          return res.status(500).json({ success: false, error: err.message });
        }
        fs.unlinkSync(filePath);
      });
    });

    writeStream.on("error", (err) => {
      console.error("Write stream error:", err);
      res.status(500).json({ success: false, error: err.message });
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

const downloadAttendance = async (req, res) => {
  try {
    const { month, year, batch, cls, format } = req.query;
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(
      `${year}-${month}-${new Date(year, month, 0).getDate()}`
    );

    // Generate all dates in the month
    const allDates = Array.from(
      { length: (endDate - startDate) / (1000 * 60 * 60 * 24) + 1 },
      (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
      }
    );

    const students = await Student.aggregate([
      {
        $match: { batchYear: batch, class: cls },
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
                    { $gte: ["$date", startDate] },
                    { $lte: ["$date", endDate] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // Convert to YYYY-MM-DD
                status: 1,
                holidayReason: 1,
              },
            },
          ],
          as: "attendance",
        },
      },
      {
        $addFields: {
          attendance: {
            $map: {
              input: allDates, // Loop through all dates
              as: "date",
              in: {
                date: "$$date",
                status: {
                  $let: {
                    vars: {
                      matchedAttendance: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$attendance",
                              as: "att",
                              cond: { $eq: ["$$att.date", "$$date"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      $ifNull: ["$$matchedAttendance.status", "Not Marked"],
                    },
                  },
                },
                holidayReason: {
                  $let: {
                    vars: {
                      matchedAttendance: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$attendance",
                              as: "att",
                              cond: { $eq: ["$$att.date", "$$date"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      $ifNull: ["$$matchedAttendance.holidayReason", ""],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          class: 1,
          batchYear: 1,
          attendance: 1,
        },
      },
    ]);

    if (students.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "No Students found" });
    }

    console.log(students);

    if (format === "pdf") {
      return generatePDF(res, students, month, year, cls, batch);
    }
    if (format === "excel") {
      return generateExcel(res, students, month, year);
    }

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
