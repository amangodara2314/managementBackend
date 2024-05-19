const Staff = require("../models/staff.model");

class StaffController {
  addStaff(data, image) {
    return new Promise(async (res, rej) => {
      try {
        const dbData = {
          aadhar: data.aadhar,
          pan: data.pan,
          name: data.name,
          category: data.category,
          contactPhone: data.contactPhone,
          batchYear: data.batchYear,
          fatherName: data.fatherName,
          salary: data.salary,
        };
        if (image) {
          const imageName = Date.now() + "." + image.name.split(".").pop();
          const destination = "./uploads/staff/" + imageName;

          image.mv(destination, (err) => {
            if (err) {
              reject({ msg: "Unable to upload image", status: 0 });
              return;
            }
          });
          dbData.image = imageName;
        }
        const staff = new Staff(dbData);
        await staff.save();
        res({
          msg: "Added Successfully",
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
  updateStaff(id, data, image) {
    return new Promise(async (res, rej) => {
      try {
        const dbData = {
          aadhar: data.aadhar,
          pan: data.pan,
          name: data.name,
          category: data.category,
          contactPhone: data.contactPhone,
          batchYear: data.batchYear,
          fatherName: data.fatherName,
          salary: data.salary,
        };
        if (image) {
          const imageName = Date.now() + "." + image.name.split(".").pop();
          const destination = "./uploads/staff/" + imageName;

          image.mv(destination, (err) => {
            if (err) {
              reject({ msg: "Unable to upload image", status: 0 });
              return;
            }
          });
          dbData.image = imageName;
        }
        const staff = await Staff.findByIdAndUpdate(id, dbData, { new: true });
        await staff.save();
        res({
          msg: "Added Successfully",
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
  deleteStaff(id) {
    return new Promise(async (res, rej) => {
      try {
        await Staff.deleteOne({ _id: id });
        res({
          msg: "Removed Successfully",
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
  getStaff(batch) {
    return new Promise(async (res, rej) => {
      try {
        const staff = await Staff.find({ batchYear: batch }).populate(
          "salaryPaid"
        );
        res({
          msg: "data found",
          status: 1,
          staff,
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

module.exports = StaffController;
