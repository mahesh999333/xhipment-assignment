const jobPostModel = require("../models/jobPost");
const applicationModel = require('../models/application')
const validator = require('../Validator/validations')


let pageSize = 10 // keeping 10 items per page


const jobPost = async (req, res) => {
  try {
    let { user_id, title, description, skills, experience, manager_email } =
      req.body;

    //console.log(Object.keys(req.body))
    if (Object.keys(req.body).length === 1) {
      return res.status(400).send({
        status: false,
        message: "Please fill all the mandatory details",
      });
    }

    
    // Title validation
    if(title){
      if ( !validator.isValid(title)) {
        return res
          .status(400)
          .send({ staus: false, message: "Title is invalid" });
      }
      title.trim();
    }else{
      return res
        .status(400)
        .send({ staus: false, message: "Title is manadatory" });
    }

    
    if(description){
      if (!validator.isValidDescription(description)) {
        return res.status(400).send({
          staus: false,
          message: "Description cannot contain any random character",
        });
      }
      description.trim();
    }else{
      return res
        .status(400)
        .send({ staus: false, message: "description is manadatory" });
    }
    

    if(!skills){
      return res
        .status(400)
        .send({ staus: false, message: "Skills are manadatory" });
    }

    
    if(experience >= 0){
      if (!validator.isValidExperience(experience)) {
        return res
          .status(400)
          .send({ staus: false, message: "Please provide valid experince" });
      } else if (experience < 0) {
        return res
          .status(400)
          .send({ staus: false, message: "Please provide valid experince" });
      }
    
    }else{
      return res
        .status(400)
        .send({ staus: false, message: "Experience are manadatory" });
    }
    
    

    if (!validator.isValidMail(manager_email)) {
      return res
        .status(400)
        .send({ staus: false, message: "Please provide valid manager_email" });
    }

    skills = skills.split(",");
    console.log(skills);
    let manager_id = user_id;
    let data = {
      manager_id,
      title,
      description,
      skills,
      experience,
      manager_email,
    };

    let jobPosted = await jobPostModel.create(data);

    return res.status(201).send({
      status: true,
      message: "Job posted successfuly",
      data: jobPosted,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



const getAllJobs = async (req, res) => {
  try {
    let page = req.body.page || 1;
    let skip = (page - 1) * pageSize;

    let jobs = await jobPostModel.find({isDeleted:false}).skip(skip).limit(pageSize);

    return res.status(200).send({
      status: true,
      message: "Following jobs are available",
      data: jobs,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



const getFilteredJobs = async (req, res) => {
  try {
    let { skills, experience } = req.query;
    let page = req.query.page || 1;
    let skip = (page - 1) * pageSize;

    let filterCondition = { isDeleted: false };

    if (skills) {
      if (skills.trim().length) {
        const skillsArr = skills.split(",").map((skill) => skill.trim());
        console.log("skillsArr", skillsArr)
        filterCondition.skills = { $in: skillsArr };
      } else {
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid subcategory" });
      }
    }

    if (experience) {
      if (experience < 0) {
        return res
          .status(400)
          .send({ status: false, message: "Experience cannot be negative" });
      }
      filterCondition.experience = experience;
    }

    let jobs = await jobPostModel.find(filterCondition).skip(skip).limit(pageSize);

    return res.status(200).send({
      status: true,
      message: "Following jobs are available",
      data: jobs,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



const updateJob = async (req, res) => {
  try {
    let { job_id, title, description, skills, experience, manager_email } =
      req.body;

    if (!Object.keys(req.body).lnegth === 0) {
      return res.status(400).send({
        status: false,
        message: "Please fill all the mandatory details",
      });
    }

    let dbJob = await jobPostModel.findById({job_id, isDeleted:false}).lean();

    if (title) {
      title = title.trim();
      if (!validator.isValid(title)) {
        return res
          .status(400)
          .send({ staus: false, message: "Title is invalid" });
      }
      dbJob.title = title;
    }

    if (description) {
      description = description.trim();
      if (!validator.isValidDescription(description)) {
        return res.status(400).send({
          staus: false,
          message: "Description cannot contain any random character",
        });
      }
      dbJob.description = description;
    }

    if (skills) {
      skills = skills.trim();
      skills.split(",").forEach((skill) => {
        dbJob.skills.push(skill);
      });
    }

    if (experience) {
      if (!validator.isValidExperience(experience)) {
        return res
          .status(400)
          .send({ staus: false, message: "Please provide valid experince" });
      } else if (experience < 0) {
        return res
          .status(400)
          .send({ staus: false, message: "Please provide valid experince" });
      }
      dbJob.experience = experience;
    }

    if (manager_email) {
      if (!validator.isValidMail(manager_email)) {
        return res
          .status(400)
          .send({
            staus: false,
            message: "Please provide valid manager_email",
          });
      }
      dbJob.manager_email = manager_email;
    }

    let updatedJob = await jobPostModel.findByIdAndUpdate(job_id, dbJob, {new:true})

    return res.status(200).send({status:true, message:"Job is updated successfully", data:updatedJob});
    
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



const getApplicationForJob = async (req, res) =>{
  try {
    let {job_id, user_id} = req.body;
    let page = req.body.page || 1;
    let skip = (page - 1) * pageSize;

    let job = await jobPostModel.findById({_id:job_id, isDeleted:false}).select({_id:0, title:1, description:1}).lean();

    let applications = await applicationModel.find({manager_id:user_id, isDeleted:false}).select({_id:0, name:1, user_email:1, cover_letter:1}).skip(skip).limit(pageSize);

    if(!applications.length){
      return res.status(400).send({status:false, message:"No application for this job"})
    }
    job["applications"] = applications
    return res.status(200).send({status:true, data:job});
    
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



const jobSearch = async (req, res) => {
  try {
    let title = req.params.title;
    let page = req.body.page || 1;
    let skip = (page - 1) * pageSize;



    let jobs = await jobPostModel.find({title, isDeleted:false}).select({title:1,description:1, skills:1, experience:1, manager_email:1}).skip(skip).limit(pageSize);

    if(jobs.length == 0){
      return res.status(400).send({status:false, message:"Sorry, we don't have jobs for your search"});
    }

    return res.status(200).send({status:true, message:"Following are the jobs for your seach", data:jobs})
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



const deleteJobPost = async (req, res) => {
  try {
    let { job_id, user_id } = req.body;

    if (job_id) {
      if (!validator.isValidId(job_id)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid job_id." });
      }
    } else {
      return res.status(400).send({
        status: false,
        message: "Please provide job_id to delete job.",
      });
    }

    
    await jobPostModel.findById(job_id);

    await jobPostModel.findByIdAndUpdate({job_id, isDeleted:false}, { $set: { isDeleted: true } });

    return res
      .status(200)
      .send({ status: true, message: "Job is deleted successfully." });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



module.exports = {
  jobPost,
  getAllJobs,
  getFilteredJobs,
  updateJob,
  deleteJobPost,
  getApplicationForJob,
  jobSearch
};
