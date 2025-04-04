const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: Date, required: true },
    maxParticipants: { type: Number, required: true },
    registeredParticipants: { type: Number, default: 0 },
    registrationDeadline: { type: Date, required: true },
    participants: [{
        fullName: { type: String, required: true },
        email: { 
            type: String, 
            required: true, 
            validate: {
                validator: function (v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email!`
            }
        },
        phone: { type: String, required: true }
    }],
}, { timestamps: true });

campaignSchema.methods.canRegister = function () {
    const currentTimeUTC = new Date().toISOString();
    return this.registeredParticipants < this.maxParticipants && this.registrationDeadline.toISOString() > currentTimeUTC;
};

module.exports = mongoose.model("Campaign", campaignSchema);