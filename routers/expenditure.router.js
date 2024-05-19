const { Router } = require("express");
const ExpenditureController = require("../controllers/expenditure.controller");
const ExpenditureRouter = Router();

ExpenditureRouter.get("/get/:batch", (req, res) => {
  new ExpenditureController()
    .getExpenditure(req.params.batch)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

ExpenditureRouter.post("/add", (req, res) => {
  new ExpenditureController()
    .addExpenditure(req.body)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

module.exports = ExpenditureRouter;
