const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const campaignSchema=new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    location:{type:String,required:true},
    date:{type:Date, required:true},
    time:{type:String, required:true },
    maxParticipants:{type:Number,required:true},
    registeredParticipants:{type:Number,default:0,required:true},
    createdAt:{type:Date,default:Date.now}
});

campaignSchema.methods.canRegister=function(){
    return this.registeredParticipants<this.maxParticipants;
};

module.exports=mongoose.model("campaign",campaignSchema);