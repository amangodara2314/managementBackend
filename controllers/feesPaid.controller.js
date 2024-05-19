const FeesPaid = require("../models/feesPaid.model");
const Student = require("../models/student.model");

class FeesPaidController {
  getFees(batch) {
    return new Promise(async (res, rej) => {
      try {
        const fees = await FeesPaid.find({ batch: batch }).populate([
          "studentId",
          { path: "studentId", populate: "feesPaid" },
        ]);
        res({
          msg: "data found",
          status: 1,
          fees,
        });
      } catch (error) {
        rej({
          msg: "Internal Server Error",
          status: 0,
        });
      }
    });
  }

  addFees({ studentId, amount, type, batch }) {
    return new Promise(async (res, rej) => {
      try {
        const Paid = new FeesPaid({
          studentId: studentId,
          amount: amount,
          type: type,
          batch: batch,
        });
        const student = await Student.findById(studentId);
        student.feesPaid.push(Paid._id);
        await student.save();
        Paid.save()
          .then((success) => res({ msg: "Fees Added", status: 1 }))
          .catch((err) => {
            console.log(err);
            rej({ msg: "Unable to add student", status: 0 });
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
}

module.exports = FeesPaidController;
