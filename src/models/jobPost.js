const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;




const jobPostSchema = new mongoose.Schema(
  {
    manager_id: {
      type: objectId,
      ref: "User",
    },
    title: {
      type: String,
      trim: true,
      require: "Title is mandatory.",
    },
    description: {
      type: String,
      require: "Please provide some description.",
    },
    skills: {
      type: [String],
      require: "Provide reuired skills.",
    },
    experience: {
      type: Number,
      require: "Provide experience for this job.",
    },
    manager_email: {
      type: String,
      trim: true,
      lowercase: true,
      required: "Email address is required",
    },
    isDeleted : {
        type:Boolean,
        default:false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job Post", jobPostSchema);
