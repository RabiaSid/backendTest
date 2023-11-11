const { SendResponse } = require("../helpers/helpers");
const UserModel = require("../models/authmodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AuthController = {
  signUp: async (req, res) => {
    try {
      let { userName, password, contact } = req.body;
      let obj = { userName, password, contact };
      let errArr = [];

      if (!obj.userName) {
        errArr.push("User Name is Required");
      }
      if (!obj.password) {
        errArr.push("Password is Required");
      }

      if (errArr.length > 0) {
        res.status(400).send(SendResponse(false, "Validation Error", errArr));
        return;
      }

      let userExist = await UserModel.findOne({ userName: obj.userName });

      if (userExist) {
        res
          .status(400)
          .send(SendResponse(false, "User Already Exist with this User Name"));
        return;
      }

      obj.password = await bcrypt.hash(obj.password, 10);

      let User = new UserModel(obj);
      let result = await User.save();

      if (result) {
        res
          .status(200)
          .send(SendResponse(true, "User Created Successfully", result));
      }
    } catch (error) {
      res.status(500).send(SendResponse(false, "Internal Server Error", error));
    }
  },
  login: async (req, res) => {
    try {
      let { userName, password } = req.body;
      let obj = { userName, password };
      let existingUser = await UserModel.findOne({ userName: obj.userName });

      if (existingUser) {
        let corerctPassword = await bcrypt.compare(
          obj.password,
          existingUser.password
        );

        if (corerctPassword) {
          let token = jwt.sign({ ...existingUser }, process.env.SECRET_KEY);

          res.send(
            SendResponse(true, "Login Successfully", {
              token: token,
              user: existingUser,
            })
          );
        } else {
          res.send(SendResponse(false, "Password Not Match"));
        }
      } else {
        res.send(SendResponse(false, "User Not Found with this User Name"));
      }
    } catch (error) {}
  },
  protected: async (req, res, next) => {
    // 'Bearer jdflsdlfsjhlkdfjslkdfjhshfdkjshfdkjshdfkshdfkj'
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).send(SendResponse(false, "Un Authorized"));
      return;
    } else {
      jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          res.status(401).send(SendResponse(false, "Un Authorized"));
          return;
        } else {
          next();
          return;
        }
      });
    }
  },
  adminProtected: async (req, res, next) => {
    // 'Bearer jdflsdlfsjhlkdfjslkdfjhshfdkjshfdkjshdfkshdfkj'
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).send(SendResponse(false, "Un Authorized"));
      return;
    } else {
      jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          res.status(401).send(SendResponse(false, "Un Authorized"));
          return;
        } else {
          if (decoded._doc.role == "admin") {
            next();
            return;
          }
        }
      });
    }
  },
};

module.exports = AuthController;
