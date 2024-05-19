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
          Rollnumber: data?.rollnumber,
          name: data?.name,
          dateOfBirth: data?.dateOfBirth,
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
