const StaffController = require("../controllers/staff.controller");
const { Router } = require("express");
const fileUpload = require("express-fileupload");

const StaffRouter = Router();

StaffRouter.post("/add", fileUpload({ createParentPath: true }), (req, res) => {
  new StaffController()
    .addStaff(req.body, req.files?.image)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

StaffRouter.get("/get/:batch", (req, res) => {
  new StaffController()
    .getStaff(req.params.batch)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

StaffRouter.put(
  "/update/:id",
  fileUpload({ createParentPath: true }),
  (req, res) => {
    new StaffController()
      .updateStaff(req.params.id, req.body, req.files?.image)
      .then((success) => res.send(success))
      .catch((err) => res.send(err));
  }
);

StaffRouter.delete(
  "/delete/:id",
  fileUpload({ createParentPath: true }),
  (req, res) => {
    new StaffController()
      .deleteStaff(req.params.id, req.body, req.files?.image)
      .then((success) => res.send(success))
      .catch((err) => res.send(err));
  }
);

module.exports = StaffRouter;
