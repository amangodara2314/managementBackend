const { Router } = require("express");
const StudentRouter = Router();
const StudentController = require("../controllers/student.controller");

StudentRouter.get("/get-students/:batch", (req, res) => {
  new StudentController()
    .getStudents(req.params.batch)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

StudentRouter.put("/update/:studentId", (req, res) => {
  new StudentController()
    .updateStudent(req.params.studentId, req.body)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

StudentRouter.post("/add", (req, res) => {
  new StudentController()
    .addStudent(req.body)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

StudentRouter.post("/promote", (req, res) => {
  new StudentController()
    .addStudent(req.body)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

StudentRouter.delete("/delete/:id", (req, res) => {
  new StudentController()
    .deleteStudent(req.params.id)
    .then((success) => res.send(success))
    .catch((err) => res.send(err));
});

module.exports = StudentRouter;
