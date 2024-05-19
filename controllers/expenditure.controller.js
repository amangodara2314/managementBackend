const Expenditure = require("../models/expenditure.model");

class ExpenditureController {
  getExpenditure(batch) {
    return new Promise(async (res, rej) => {
      try {
        const expenditure = await Expenditure.find({ batch: batch });
        res({
          msg: "Data Found",
          expenditure,
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
  addExpenditure({ category, amount, comment, batch }) {
    return new Promise(async (res, rej) => {
      try {
        const expenditure = new Expenditure({
          category: category,
          amount: amount,
          comment: comment,
          batch: batch,
        });
        expenditure
          .save()
          .then(
            res({
              msg: "Added Successfully",
              status: 1,
            })
          )
          .catch((err) => {
            rej({ msg: "Unable To Add" });
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

module.exports = ExpenditureController;
