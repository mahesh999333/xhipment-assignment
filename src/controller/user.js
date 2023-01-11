const validator = require("../Validator/validations");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

const isValidPhone = function (phone) {
  return /^((\+91(-| )+)|0)?[6-9][0-9]{9}$/.test(phone);
};

const register = async (req, res) => {
  try {
    let { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone)
      return res
        .status(400)
        .send({ status: false, message: "Please provide all the details" });

    if (!validator.isValid(name))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid name" });

    if (!validator.isValidMail(email))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid email" });

    if (!isValidPhone(phone) || phone.length !== 10)
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid phone" });

    if (!validator.isValidPassword(password))
      return res.status(400).send({
        status: false,
        message:
          "password must be strong (minLength = 8, minLowercase = 1, minUppercase = 1, minNumbers = 1, minSymbols = 1)",
      });

    // checking for email duplicasy
    const dbEmail = await userModel.findOne({ email: email });
    if (dbEmail)
      return res
        .status(400)
        .send({ status: false, message: "Email is already register" });



      const dbPhone = await userModel.findOne({phone});
      if(dbPhone){
        return res.status(400).send({status:false, message:"Phone is already registered."})
      }
      

    // Password hashing and salting
    const salt = 10;
    const hashedpassword = bcrypt.hashSync(password, salt);

    let data = {
      name,
      email,
      password: hashedpassword,
      phone,
    };

    const user = await userModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "User created successfully", data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide the credentials" });
    }

    if (!validator.isValidMail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid email" });
    }

    let user = await userModel.findOne({ email: email }).lean();
    if (!user)
      return res
        .status(400)
        .send({ status: false, message: "user does not exist" });

    let hashedpassword = user.password;

    let compare = bcrypt.compareSync(password, hashedpassword);

    if (!compare)
      return res
        .status(400)
        .send({ status: false, message: "Incorrect Password" });

    let token = jwt.sign(
      {
        id: user._id.toString(),
      },
      "maheshXhipment",
      { expiresIn: "24h" }
    );

    let response = { ...user };
    delete response.password;

    res.setHeader("x-api-key", token);

    res.status(200).send({
      status: true,
      message: "User logged in successfully",
      token
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


module.exports = {
  register,
  login
};
