const { Router } = require("express");
const FeesPaidController = require("../controllers/feesPaid.controller");
const FeesPaidRouter = Router();

FeesPaidRouter.get("/get/:batch", (req, res) => {
  new FeesPaidController()
    .getFees(req.params.batch)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

FeesPaidRouter.post("/add", (req, res) => {
  new FeesPaidController()
    .addFees(req.body)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

module.exports = FeesPaidRouter;
