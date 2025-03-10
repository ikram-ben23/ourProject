const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const pepiniereSchema = new mongoose.Schema({
    name: { type: String, required: true ,unique:true,},
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true ,lowerCase:true,},
    phone: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String },
    password: { type: String, required: true },
    profilePicture:{type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

pepiniereSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});



module.exports = mongoose.model('Pepiniere', pepiniereSchema);
