const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer=require('nodemailer');
const crypto=require("crypto");
const { findOne } = require("../models/pepiniere");
const Pepiniere = require("../models/pepiniere");
const Campaign=require('../models/campaign');
const Product = require("../models/Product");
require("dotenv").config();

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email is provided
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find admin in database
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/*exports.forgotPassword=async(req,res)=>{
    try{
        const {email}=req.body;
        const admin=await Admin.findOne({email});

        if(!admin){
            return res.status(404).json({message:"Admin not found"});
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
        await admin.save();


        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
      
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: admin.email,
            subject: "Password Reset",
            text: `Click this link to reset your password: ${process.env.CLIENT_URL}/reset-password/${resetToken}`,
          };
      
          await transporter.sendMail(mailOptions);
          res.json({ message: "Password reset email sent" });
    } catch (error) {
          res.status(500).json({ message: "Server error", error });
    }
};*/
exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const admin = await Admin.findOne({ email });
  
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      admin.resetPasswordToken = resetToken;
      admin.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
  
      
      await admin.save(); //to update a database
  
      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: admin.email,
        subject: "Password Reset",
        text: `Click this link to reset your password: ${process.env.CLIENT_URL}/reset-password/${resetToken}`,
      };
  
      await transporter.sendMail(mailOptions);
      res.json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  

exports.resetPassword=async(req,res)=>{
    try{
        const {token}=req.params;
        const {newPassword,confirmPassword}=req.body;

        if (!newPassword || !confirmPassword) {
          return res.status(400).json({ message: "Both password fields are required" });
        }

         // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                message: "Password must be at least 8 characters long, contain at least one letter, one number, and one special character (@$!%*?&)"
        });
        }

        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
          });
      
          if (!admin) {
            return res.status(400).json({ message: "Invalid or expired token" });
          }
      
          // Hash new password
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          admin.password = hashedPassword;
          admin.resetPasswordToken = undefined;
          admin.resetPasswordExpires = undefined;
          await admin.save();
      
          res.json({ message: "Password reset successful" });
    } catch (error) {
          res.status(500).json({ message: "Server error", error });
        }
};

exports.pendingPepinieres=async(req,res)=>{
    try{
        const pendingPepinieres=await Pepiniere.find({status:"pending"});
        res.json(pendingPepinieres);
    }catch(error){
        res.status(500).json({message:"Server error",error});
    }
};

exports.approve=async(req,res)=>{
    try{
       const pepiniere = await Pepiniere.findOneAndUpdate(
        { _id: req.params.id },
        { status: "approved" },  
        { new: true }            
      );

        if(!pepiniere){
            return res.status(404).json({message:"Pépinière not found"});
        }

        res.json({ message: "Pépinière approved", pepiniere });
    }catch (error) {
        res.status(500).json({ message: "Server error", error });
}
};

exports.reject=async(req,res)=>{
    try{
        const pepiniere=await Pepiniere.findOneAndUpdate({ _id: req.params.id },{ status: "rejected" },{ new: true } );

        if(!pepiniere){
            return res.status(404).json({message:"Pépinière not found"});
        }

        res.json({ message: "Pépinière rejected", pepiniere });
    }catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.allPepinieres=async(req,res)=>{
    try{
        const approvedPepinieres=await Pepiniere.find({status : "approved"});
        res.json({ success: true, data: approvedPepinieres });
    }catch(error)
    {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.onePepiniere=async(req,res)=>{
    try{
        const pepiniere=await Pepiniere.findById(req.params.id);

        if(!pepiniere){
            return res.status(404).json({ message: "Pépinière not found" });
        }

        res.json(pepiniere);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.deletePepiniere=async(req,res)=>{
    try{
        const pepiniere=await Pepiniere.findByIdAndDelete(req.params.id);

        if(!pepiniere){
            res.status(400).json({message:"Pepiniere not found"});
        }

        res.json({ message: "Pépinière deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// creation and management of a campaign 

exports.createCampaign=async(req,res)=>{
  try{
    const {title,description,location,date,time,maxParticipants}=req.body;

    if(!title || !description || !location || !date || !time || !maxParticipants){
      return res.status(400).json({message:"All fields are required"});
    }

    const campaign=new Campaign({
      title,description,location,date,time,maxParticipants,
    });



    await campaign.save();
    res.status(201).json({ message: "Campaign created successfully", campaign });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/*exports.allCampaigns=async(req,res)=>{
  try{
    const campaigns=await Campaign.find().sort({date:-1});//fetch campaign from data base
    if (campaigns.length === 0) {
      return res.status(404).json({ message: "No campaigns found" });
    }

    return res.status(200).json(campaigns); 
  }catch(error){
    res.status(500).json({ message: "Server error", error });
  }
};*/

exports.allCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ date: -1 });

    if (!campaigns || campaigns.length === 0) {
      return res.status(404).json({ message: "No campaigns found" });
    }

    return res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.oneCampaign=async(req,res)=>{
  try{
    const campaign=await Campaign.findById(req.params.id);
    if(!campaign){
      return res.status(404).json({message:"Campaign not found"});
    }
    return res.status(200).json(campaign);
  }catch(error){
    res.status(500).json({message:"Server error",error});
  }
};

exports.editCampaign=async(req,res)=>{
  try{
    const id=req.params.id;
    const updates=req.body;


    const updatedCampaign=await Campaign.findByIdAndUpdate(id, updates,{
      new:true,
      runValidators:true
    });

    if(!updatedCampaign){
      return res.status(404).json({message:"Campaign not found"});
    }

    return res.status(200).json({message:"Campaign updated successfully",updatedCampaign});
  }catch(error){
    res.status(500).json({message:"Server error",error});
  }
};

exports.deleteCampaign=async(req,res)=>{
  try{
    const campaign=await Campaign.findByIdAndDelete(req.params.id);
    if(!campaign){
      return res.status(404).json({message:"Campaign not found"});
    }

    return res.status(200).json({message:"Campaign deleted"});
  }catch(error){
    return res.status(500).json({message:"Server error",error});
  }
}



//not tested yet 
exports.getAdminDashboardStats = async (req, res) => {
    try {
        // Total number of campaigns
        const totalCampaigns = await Campaign.countDocuments();

        // Total number of approved pépinières
        const approvedPepinieres = await Pepiniere.countDocuments({ isApproved: true });

        // Total number of products
        const totalProducts = await Product.countDocuments();

        // Total number of volunteers (participants in campaigns)
        const totalVolunteers = await Campaign.aggregate([
            { $unwind: "$participants" },
            { $count: "totalVolunteers" }
        ]);

        // Pie Chart Data: Count of approved, pending, rejected
        const pepiniereStatusCounts = await Pepiniere.aggregate([
            {
                $group: {
                    _id: "$status", // assuming status: 'approved' | 'pending' | 'rejected'
                    count: { $sum: 1 }
                }
            }
        ]);

        // Bar Graph: Campaigns with the highest number of registered participants (Top 5)
        const topCampaigns = await Campaign.find({})
            .sort({ registeredParticipants: -1 })
            .limit(5)
            .select("title registeredParticipants");

        res.json({
            totalCampaigns,
            approvedPepinieres,
            totalProducts,
            totalVolunteers: totalVolunteers.length ? totalVolunteers[0].totalVolunteers : 0,
            pepiniereStatusChart: pepiniereStatusCounts,
            topCampaignsBarChart: topCampaigns
        });
    } catch (err) {
        console.error("Error in admin stats:", err);
        res.status(500).json({ message: "Failed to load dashboard statistics." });
    }
};






