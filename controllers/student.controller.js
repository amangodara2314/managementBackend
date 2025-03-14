const Student = require("../models/student.model");

class StudentController {
  getStudents(batch) {
    return new Promise(async (res, rej) => {
      try {
        const students = await Student.find({ batchYear: batch }).populate(
          "feesPaid"
        );
        res({
          msg: "data found",
          status: 1,
          students,
        });
      } catch (error) {
        console.log(error);
        rej({
          msg: "Internal Server Error",
          status: 0,
        });
      }
    });
  }

  getClassStudents = async (cls, batch, date) => {
    return new Promise(async (res, rej) => {
      try {
        if (!cls || !batch || !date) {
          return rej({ msg: "Missing required parameters", status: 0 });
        }

        const attendanceDate = new Date(date);
        if (isNaN(attendanceDate)) {
          return rej({ msg: "Invalid date format", status: 0 });
        }

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
                        {
                          $eq: [
                            {
                              $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date",
                              },
                            },
                            attendanceDate.toISOString().split("T")[0], // Convert date for matching
                          ],
                        },
                      ],
                    },
                  },
                },
                {
                  $project: { status: 1, holidayReason: 1, _id: 0 }, // Include holidayReason
                },
              ],
              as: "attendance",
            },
          },
          {
            $addFields: {
              attendanceStatus: {
                $cond: {
                  if: { $gt: [{ $size: "$attendance" }, 0] },
                  then: { $arrayElemAt: ["$attendance.status", 0] },
                  else: "Not Marked",
                },
              },
              holidayReason: {
                $cond: {
                  if: {
                    $and: [
                      { $gt: [{ $size: "$attendance" }, 0] },
                      {
                        $eq: [
                          { $arrayElemAt: ["$attendance.status", 0] },
                          "Holiday",
                        ],
                      },
                    ],
                  },
                  then: { $arrayElemAt: ["$attendance.holidayReason", 0] },
                  else: null,
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
              attendanceStatus: 1,
              holidayReason: 1, // Include in the response
            },
          },
        ]);

        res({
          msg: "Data found",
          status: 1,
          students,
        });
      } catch (error) {
        console.error("Error fetching students with attendance:", error);
        rej({
          msg: "Internal Server Error",
          status: 0,
        });
      }
    });
  };

  deleteStudent(id) {
    return new Promise(async (res, rej) => {
      try {
        await Student.deleteOne({ _id: id });
        res({
          msg: "Removed Successfully",
          status: 1,
        });
      } catch (error) {
        console.log(error);
        rej({
          msg: "Internal Server Error",
          status: 0,
        });
      }
    });
  }
  updateStudent(id, data) {
    return new Promise(async (res, rej) => {
      try {
        const student = await Student.findByIdAndUpdate(id, data);
        res({
          msg: "Student Data Updated",
          status: 1,
        });
      } catch (error) {
        rej({
          msg: "Internal Server Error",
          status: 0,
        });
      }
    });
  }
  addStudent(data) {
    return new Promise((res, rej) => {
      try {
        const student = new Student({
          studentId: data?.studentId,
          aadhar: data?.aadhar,
          Rollnumber: data?.Rollnumber,
          name: data?.name,
          dateOfBirth: data?.dateOfBirth,
          janAadhar: data?.janAadhar,
          gender: data?.gender,
          category: data?.category,
          contactPhone: data?.contactPhone,
          contactEmail: data?.contactEmail,
          address: data?.address,
          batchYear: data?.batchYear,
          class: data?.class,
          subject: data?.subject,
          fatherName: data?.fatherName,
          motherName: data?.motherName,
          guardianContact: data?.guardianContact,
          admissionFees: data?.admissionFees,
          transportFees: data?.transportFees,
          other: data?.other,
          fees: data?.fees,
          totalFees: data?.totalFees,
          lastYearDueFees: data?.lastYearDueFees,
          bankDetails: data?.bankDetails,
        });
        student
          .save()
          .then((success) => res({ msg: "Student Added", status: 1 }))
          .catch((err) => {
            console.log(err);
            rej({ msg: "Unable to add student", status: 0 });
          });
      } catch (error) {
        rej({
          msg: "Internal Server Error",
          status: 0,
        });
      }
    });
  }
}

module.exports = StudentController;
