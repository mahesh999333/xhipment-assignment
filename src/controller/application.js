const applicationModel = require("../models/application");
const validator = require("../Validator/validations");

const { uploadFile } = require("../upload/upload");


const apply = async (req, res) => {
  try {
    const { name, user_email, job_id, user_id } = req.body;
    
    if (Object.keys(req.body).length === 1) {
      return res.status(400).send({
        status: false,
        message: "Please fill all the mandatory details",
      });
    }

    if(!name) return res.status(400).send({status:false, message:"Please provide name and other details"})
    if (!validator.isValid(name))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid name" });

    if (!validator.isValidMail(user_email))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid email" });

    if (!validator.isValidId(job_id)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid job_id." });
    }
    
    if ( req.files.length < 2) {
      return res.status(400).send({
        status: false,
        message: " Please provide resume and cover letter",
      });
    }

    let resume = req.files[0];
    let cover_letter = req.files[1];

    // resume uploading
    const resumeURL = await uploadFile(resume);
    resume = resumeURL;

    //cover_letter uploading
    const cover_letterURL = await uploadFile(cover_letter);
    cover_letter = cover_letterURL;

    let data = {
      name,
      user_email,
      job_id,
      user_id,
      resume,
      cover_letter,
    };

    let applied = await applicationModel.create(data);

    return res
      .status(201)
      .send({ status: true, message: "Applied successfully", data: applied });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};


const update = async (req, res) => {
  try {
    let { name, user_email, application_id } = req.body;
    let resume, cover_letter;
    if (req.files.length) {
      resume = req.files[0];
      cover_letter = req.files[1];
    }
    let application = await applicationModel.findOne({ _id: application_id, isDeleted:false }).lean();

    if (!application) {
      return res
        .status(404)
        .send({
          status: false,
          message: "Appliactiion for this job is not found.",
        });
    }

    if (name) {
      if (!validator.isValid(name))
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid name" });

      application.name = name;
    }

    if (user_email) {
      if (!validator.isValidMail(user_email))
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid email" });

      application.user_email = user_email;
    }

    if (resume) {
      // resume uploading
      const resumeURL = await uploadFile(resume);
      application.resume = resumeURL;
    }

    if (cover_letter) {
      //cover_letter uploading
      const cover_letterURL = await uploadFile(cover_letter);
      application.cover_letter = cover_letterURL;
    }

    let updatedApplication = await applicationModel.findOneAndUpdate({application_id, isDeleted:false}, application, {new:true}).select({name:1, user_email:1, resume:1, cover_letter:1, user_id:1, job_id:1});

    return res.status(200).send({status:true, message:"Job application updated successfully", data:updatedApplication})
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};


const deleteApplication = async (req, res) => {
  try {
    let { application_id, user_id } = req.body;
    let application = await applicationModel.findOneAndUpdate({_id:application_id, isDeleted:false}, 
    {$set:{isDeleted:true}})

    if(!application){
      return res.status(404).send({status:false, message:"Application doesn't exist."})
    }

    return res.status(200).send({status:true, message:"Application for this job is deleted successfuly."})

  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};



module.exports = {
  apply,
  update,
  deleteApplication
};
