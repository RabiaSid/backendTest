const { SendResponse } = require("../helpers/helpers");
const CourseModel = require("../models/coursemodel");


const CourseController = {
  add: async (req, res) => {
    try {
      let { name, shortName, fee } = req.body;
      let obj = { name, shortName, fee };

      let errArr = [];

      if (!obj.name) {
        errArr.push("Required Name");
      }
      if (!obj.shortName) {
        errArr.push("Required Short Name");
      }

      if (errArr.length > 0) {
        res.status(400).send(SendResponse(false, "Validation Error !", errArr));
      } else {
        let Course = new CourseModel(obj);
        let result = await Course.save();
        res
          .status(200)
          .send(SendResponse(true, "Data Added Successfully", result));
      }
    } catch (e) {
      res.status(500).send(SendResponse(false, "Internal Server Error", e));
    }
  },
  edit: () => {},
  get: async (req, res) => {
    try {
      let { pageNo, pageSize } = req.query;
      console.log(pageNo, pageSize);
      let skipCount = (pageNo - 1) * pageSize;
      let result = await CourseModel.find().limit(pageSize).skip(skipCount);
      res.status(200).send(SendResponse(true, "", result));
    } catch (e) {
      res.status(500).send(SendResponse(false, "Internal Server Error", e));
    }
  },
  getById: async (req, res) => {
    try {
      let id = req.params.id;
      let result = await CourseModel.findById(id);
      res.status(200).send(SendResponse(true, "", result));
    } catch (e) {
      res.status(500).send(SendResponse(false, "Internal Server Error", e));
    }
  },
  del: (req, res) => {
    try {
      let id = req.params.id;
      CourseModel.findByIdAndDelete(id)
        .then(() => {
          res.status(200).send(SendResponse(true, "Data Deleted Successfully"));
        })
        .catch((err) => {
          res
            .status(400)
            .send(SendResponse(false, "Internal Server Error", err));
        });
    } catch (error) {
      res.status(500).send(SendResponse(false, "Internal Server Error", error));
    }
  },
};

module.exports = CourseController;
