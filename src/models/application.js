const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

let validateEmail = function (email) {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  };



const applicationSchema = new mongoose.Schema(
  {
    user_id:{
      type: objectId,
      require: true,
    },
    job_id: {
      type: objectId,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    user_email: {
      type: String,
      trim: true,
      lowercase: true,
      required: "Email address is required",
      validate: [validateEmail, "Please fill a valid email address"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    resume: {
      type: String,
      require: true,
    },
    cover_letter: {
      type: String,
      require: true,
    },
    isDeleted : {
        type:Boolean,
        default:false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Applications", applicationSchema);
