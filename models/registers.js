const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique:true
    },
    phone : {
        type : String,
        required : true,
        unique:true
    },
    address : {
        type : String,
        required : true
    },
    image : {
        type : Buffer,
        required : true
    },
    isRegistered:{
        type : Boolean,
        required : true
    },
    createdDate:{
        type : Number,
        required : true
    },
    pin:{
        type:String,
        required:true
    },
    plan:{
        type:String,
        required:true
    }
});
const Register = new mongoose.model("Pass",userSchema);
module.exports = Register;