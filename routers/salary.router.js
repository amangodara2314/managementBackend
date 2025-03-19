const { Router } = require("express");
const SalaryController = require("../controllers/salary.controller");
const SalaryRouter = Router();

SalaryRouter.get("/get/:batch", (req, res) => {
  new SalaryController()
    .getSalary(req.params.batch)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

SalaryRouter.post("/add", (req, res) => {
  new SalaryController()
    .addSalary(req.body)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

SalaryRouter.put("/update", (req, res) => {
  new SalaryController()
    .updateSalary(req.body)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

SalaryRouter.delete("/delete/:id", (req, res) => {
  new SalaryController()
    .deleteSalary(req.params.id)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

module.exports = SalaryRouter;
