const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer=require('nodemailer');
const crypto=require("crypto");
const { findOne } = require("../models/pepiniere");
const pepiniere = require("../models/pepiniere");
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
  
      // ✅ FIX: Save the updated admin document
      await admin.save(); // <-- This line ensures the database is updated
  
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
        const {newPassword}=req.body;

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
        const pendingPepinieres=await findOne({status:"pending"});
        res.json(pendingPepinieres);
    }catch(error){
        res.status(500).json({message:"Srver error",error});
    }
};

exports.approve=async(req,res)=>{
    try{
        const pepinieres=await Pepiniere.findOneAndUpdate(req.params.id,{status:"approved",new:true});

        if(!pepiniere){
            res.status(404).json({message:"Pépinière not found"});
        }

        res.json({ message: "Pépinière approved", pepiniere });
    }catch (error) {
        res.status(500).json({ message: "Server error", error });
}
};

exports.reject=async(req,res)=>{
    try{
        const pepinieres=await Pepiniere.findOneAndUpdate(req.params.id,{status:"rejected",new:true});

        if(!pepiniere){
            res.status(404).json({message:"Pépinière not found"});
        }

        res.json({ message: "Pépinière rejected", pepiniere });
    }catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.allPepinieres=async(req,res)=>{
    try{
        const approvedPepinieres=await Pepiniere.find({status : "approved"});
        if(!approvedPepinieres){
            res.json(approvedPepinieres);
        }
    }catch(error)
    {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.pepiniere=async(req,res)=>{
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


