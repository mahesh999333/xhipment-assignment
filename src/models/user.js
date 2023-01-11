const mongoose = require('mongoose')

let validateEmail = function (email) {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  };

const userSchema = new mongoose.Schema({
    
    name: {
            type: String,
            required: true
    },
    
    phone: {
            type: String,
            required: true,
            unique:true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: "Email address is required",
        validate: [validateEmail, "Please fill a valid email address"],
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Please fill a valid email address",
        ],
    },
    password: {
            type: String,
            required: true,
            minLength: 8,
            
    }
},{timestamps:true})

module.exports = mongoose.model("User", userSchema)