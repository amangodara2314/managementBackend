const Salary = require("../models/salary.model");
const Staff = require("../models/staff.model");

class SalaryController {
  getSalary(batch) {
    return new Promise(async (res, rej) => {
      try {
        const salary = await Salary.find({ batch }).populate([
          "staffId",
          { path: "staffId", populate: "salaryPaid" },
        ]);
        res({
          msg: "data found",
          status: 1,
          salary,
        });
      } catch (error) {
        rej({
          msg: "Internal Server Error",
          status: 0,
        });
      }
    });
  }

  addSalary({ staffId, amount, batch }) {
    return new Promise(async (res, rej) => {
      try {
        const Paid = new Salary({
          staffId: staffId,
          amount: amount,
          batch: batch,
        });
        const staff = await Staff.findById(staffId);
        staff.salaryPaid.push(Paid._id);
        await staff.save();
        Paid.save()
          .then((success) => res({ msg: "Salary Paid", status: 1 }))
          .catch((err) => {
            console.log(err);
            rej({ msg: "Unable to Pay Salary", status: 0 });
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

module.exports = SalaryController;
