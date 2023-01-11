const jwt = require("jsonwebtoken");
const jobModel = require('../models/jobPost');
const applicationModel = require('../models/application')
const validator = require("../Validator/validations");


// Authentication
const authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"] || req.headers["X-API-KEY"];
    // checking token
    if (!token)
      return res
        .status(401)
        .send({ status: false, message: "token must be present" });

    // validating the token
    let decoded = jwt.verify(token, "maheshXhipment") 
      if (!decoded){
        return res.status(401).send({ status: false, message: "token is invalid" });
      }
      else {
        req.body['user_id'] = decoded.id;
        console.log("authentication done")
        next();
      }

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//Authorization
const manager_authorization = async function (req, res, next) {
  try {
    let job_id = req.body.job_id;
    let userLoggedIn = req.body.user_id;
    
    if (!validator.isValidId(job_id))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid job_id" });
    
    let job = await jobModel.findOne({
      _id: job_id, isDeleted:false
    });

    if (!job) {
      return res
        .status(404)
        .send({ status: false, message: "No job found" });
    }
    // token validation
    //console.log(userLoggedIn, job.manager_id.toString())
    if (userLoggedIn != job.manager_id)
      return res.status(403).send({
        status: false,
        message: "You are not authorized to perform this task",
      });

    console.log("authorization done")
    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const applicant_authorization = async function (req, res, next) {
  try {
    let application_id = req.body.application_id;
    let userLoggedIn = req.body.user_id;
    
    if (!validator.isValidId(application_id))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid bookId" });
    
    let application = await applicationModel.findOne({
      _id:application_id, isDeleted:false
    });

    if (!application) {
      return res
        .status(404)
        .send({ status: false, message: "No application found" });
    }
    // token validation
    if (userLoggedIn != application.user_id)
      return res.status(403).send({
        status: false,
        message: "You are not authorized to perform this task",
      });

      console.log("authorization done")
    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


module.exports = {
  authentication,
  manager_authorization,
  applicant_authorization
};