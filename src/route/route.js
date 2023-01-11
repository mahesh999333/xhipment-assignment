const express = require("express");
const router = express.Router();

const { register, login } = require("../controller/user");

const {
  jobPost,
  getAllJobs,
  getFilteredJobs,
  updateJob,
  deleteJobPost,
  getApplicationForJob,
  jobSearch,
} = require("../controller/jobPosting");

const {
  apply,
  update,
  deleteApplication,
} = require("../controller/application");

const {
  authentication,
  manager_authorization,
  applicant_authorization,
} = require("../Middleware/auth");




// User
router.post("/register", register);
router.post("/login", login);

//Job
router.post("/job/post", authentication, jobPost);
router.get("/jobs", getAllJobs);
router.get("/jobsbyfilter", getFilteredJobs);
router.put("/job/update", authentication, manager_authorization, updateJob);
router.delete(
  "/job/delete",
  authentication,
  manager_authorization,
  deleteJobPost
);
router.get("/job/applications", authentication,
manager_authorization, getApplicationForJob);
router.get('/job/search/:title', jobSearch)

//Application
router.post("/apply", authentication, apply);
router.put(
  "/application/update",
  authentication,
  applicant_authorization,
  update
);
router.delete(
  "/application/delete",
  authentication,
  applicant_authorization,
  deleteApplication
);

module.exports = router;
