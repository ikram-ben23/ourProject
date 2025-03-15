const mongoose=require("mongoose");
const Pepiniere=require("../models/pepiniere");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer=require("multer");
const path = require("path");
const nodemailer=require("nodemailer");
const crypto=require("crypto");
const validator=require("validator");
const pepiniere = require("../models/pepiniere");


//multer storage configuration

const storage=multer.diskStorage({
    destination:function(req,file,cb)
    {
        cb(null,"uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});


// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type, only images are allowed!"), false);
    }
};

// Multer Upload Middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

exports.upload = upload;


exports.registerPepiniere = async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        const { name, ownerName, email, phone, address, description, password} = req.body;
        const profilePicture = req.file ? req.file.filename : null

        // Validate required fields
        if (!name || !ownerName || !email || !phone || !address || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate email format
        if (!validator.isEmail(email.trim())) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Validate strong password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character." 
            });
        }

        // Check if email already exists
        const existingPepiniere = await Pepiniere.findOne({ email: email.trim() });
        if (existingPepiniere) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new Pépinière
        const newPepiniere = new Pepiniere({
            name: name.trim(),
            ownerName: ownerName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            description: description?.trim(),
            password: hashedPassword, // Save hashed password
            profilePicture,
            status: "pending"
        });

        await newPepiniere.save();
        res.status(201).json({ message: "Pépinière registered successfully! Waiting for admin approval." });

    } catch (error) {
        console.error("Error in registerPepiniere:", error);
        res.status(500).json({ error: "Server error" });
    }
};


exports.loginPepiniere = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const pepiniere = await Pepiniere.findOne({ email: email.trim().toLowerCase() });
        if (!pepiniere) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, pepiniere.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        if (pepiniere.status !== "approved") {
            return res.status(403).json({ error: "Your account is not approved yet." });
        }

        const token = jwt.sign({ id: pepiniere._id }, process.env.SECRET_KEY, { expiresIn: "7d" });

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

//nodemailer transporter

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
    
});


//forgot password -send reset email

exports.forgotPassword=async(req,res)=>{
    try{
        const{email}=req.body;
        if(!email) return res.status(400).json({error:" Email is required "});

        const user=await Pepiniere.findOne({email});
        if(!user) return res.status(400).json({error: "User not found"});

        //generate token

        const resetToken=crypto.randomBytes(32).toString("hex");
        const resetTokenHash=crypto.createHash("sha256").update(resetToken).digest("hex");


        user.resetPasswordToken=resetTokenHash;
        user.resetPasswordExpires=Date.now()+3600000;
        await user.save();

        //send email

        const resetURL=`http://localhost:3000/reset-password?token=${resetToken}&email=${user.email}`;//change with frontend url when it is ready
        const mailOptions={
            from:process.env.EMAIL_USER,
            to:user.email,
            subject:"Reset password",
            html:`<p>Click <a href="${resetURL}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
        }

        await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset email sent!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

//reset password verifying token and reset password

exports.resetPasswordPepiniere=async(req,res) => {
    try{
        const{token,newPassword}=req.body;
        if(!token || !newPassword) return res.status(400).json({error:"All fields are required"});

        //validation of password
        const passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!newPassword){
            return res.status(400).json({error:"Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character." });
        }




        //hash the token and find user
        const hashedToken=crypto.createHash("sha256").update(token).digest("hex");

        const user=await Pepiniere.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // Checking if token is not expired
        });

        if(!user) return res.status(400).json({error:"Invalid or expired token"});

        //Hash new password

        const salt=await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        //remove reset token after successful reset
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: "Password reset successful!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
    
};


/*
exports.registerPepiniere = async (req, res) => {
    try {
        const { name, ownerName, email, phone, address, description, password } = req.body;

        if (!name || !ownerName || !email || !phone || !address || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (!validator.isEmail(email.trim())) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        const existingPepiniere = await Pepiniere.findOne({ email: email.trim().toLowerCase() });
        if (existingPepiniere) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        // **Fix: Hash Password Before Saving**
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newPepiniere = new Pepiniere({
            name: name.trim(),
            ownerName: ownerName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            address: address.trim(),
            description: description?.trim(),
            password: hashedPassword,  // **Save hashed password**
            status: "pending"
        });

        await newPepiniere.save();
        res.status(201).json({ message: "Pépinière registered successfully! Waiting for admin approval." });

    } catch (error) {
        console.error("Error in registerPepiniere:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.loginPepiniere = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const pepiniere = await Pepiniere.findOne({ email: email.trim().toLowerCase() });
        if (!pepiniere) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // **Fix: Compare the hashed password**
        const isMatch = await bcrypt.compare(password, pepiniere.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        if (pepiniere.status !== "approved") {
            return res.status(403).json({ error: "Your account is not approved yet." });
        }

        const token = jwt.sign({ id: pepiniere._id }, process.env.SECRET_KEY, { expiresIn: "7d" });

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
*/


/*exports.logoutPepiniere = (req, res) => {
    res.send("Pépinière registered successfully!");
};*/
