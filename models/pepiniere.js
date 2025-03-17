const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const pepiniereSchema = new mongoose.Schema({
    name: { type: String, required: true ,unique:true,},
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true ,lowercase:true,},
    phone: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String },
    password: { type: String, required: true },
    profilePicture:{type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    rejection:{type:String,default:null},//modify it apres
    resetPasswordToken: { type: String }, // Stores the hashed reset token
    resetPasswordExpires: { type: Date } 
});

module.exports = mongoose.model('Pepiniere', pepiniereSchema);
