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

  addSalary({ staffId, amount, batch, method, date, remarks }) {
    return new Promise(async (res, rej) => {
      try {
        const Paid = new Salary({
          staffId: staffId,
          amount: amount,
          batch: batch,
          remarks: remarks,
          method: method,
          date: date,
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
  updateSalary({ salaryId, amount, batch, method, date, remarks }) {
    return new Promise(async (res, rej) => {
      try {
        const salary = await Salary.findById(salaryId);
        if (!salary) {
          return rej({ msg: "Salary record not found", status: 0 });
        }
        if (amount !== undefined) salary.amount = amount;
        if (batch !== undefined) salary.batch = batch;
        if (method !== undefined) salary.method = method;
        if (date !== undefined) salary.date = date;
        if (remarks !== undefined) salary.remarks = remarks;

        await salary.save();
        res({ msg: "Salary Updated Successfully", status: 1, salary });
      } catch (error) {
        console.log(error);
        rej({ msg: "Internal Server Error", status: 0 });
      }
    });
  }

  deleteSalary(salaryId) {
    return new Promise(async (res, rej) => {
      try {
        const salary = await Salary.findById(salaryId);
        if (!salary) {
          return rej({ msg: "Salary record not found", status: 0 });
        }
        await Salary.findByIdAndDelete(salaryId);
        res({ msg: "Salary Deleted Successfully", status: 1 });
      } catch (error) {
        console.log(error);
        rej({ msg: "Internal Server Error", status: 0 });
      }
    });
  }
}

module.exports = SalaryController;
