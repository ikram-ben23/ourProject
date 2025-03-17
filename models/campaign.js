const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const campaignSchema=new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    date:{type:Date, required:true},
    time:{type:String, required:true },
    maxParticipants:{type:Number,required:true},
    createdAt:{type:Date,default:Date.now}
});

module.exports=mongoose.model("campaign",campaignSchema);