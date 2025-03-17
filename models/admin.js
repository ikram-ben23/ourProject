const mongoose=require('mongoose');
const bcrypt=require('bcrypt');


const adminSchema=new mongoose.Schema({
    name:{required:true,type:String,default:"super admin"},
    email:{type: String,unique:true,required:true},
    password:{type:String,required:true},
    //profilePicture:{type:String},
    role:{type:String,default:"admin"},
    createdAt:{type:Date,default:Date.now},
    resetPasswordToken: { type: String }, 
    resetPasswordExpires: { type: Date } 

}, { collection: "admin" });

module.exports=mongoose.model('Admin',adminSchema);