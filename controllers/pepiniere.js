const mongoose=require("mongoose");
const Pepiniere=require("../models/pepiniere");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer=require("multer");
const path = require("path");
const nodemailer=require("nodemailer");
const crypto=require("crypto");
const validator=require("validator");



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
        const { name, ownerName, email, phone, address, description, password, profilePicture } = req.body;

        // 🔹 Validate required fields
        if (!name || !ownerName || !email || !phone || !address || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // 🔹 Validate email format
        if (!validator.isEmail(email.trim())) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // 🔹 Validate strong password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character." 
            });
        }

        // 🔹 Check if email already exists
        const existingPepiniere = await Pepiniere.findOne({ email: email.trim() });
        if (existingPepiniere) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        // 🔹 Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 🔹 Create a new Pépinière
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

        const pepiniere = await Pepiniere.findOne({ email });
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

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Pepiniere.findOne({ email });

        if (!user) return res.status(404).json({ error: "No user found with this email" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // Send email with reset link
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD }
        });

        let mailOptions = {
            to: user.email,
            subject: "Password Reset Request",
            text: `Use this token to reset your password: ${resetToken}`
        };

        transporter.sendMail(mailOptions);

        res.json({ message: "Password reset token sent!" });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
// Reset Password
exports.resetPasswordPepiniere= async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await Pepiniere.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ error: "Invalid or expired token" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: "Password reset successful!" });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};



/*exports.logoutPepiniere = (req, res) => {
    res.send("Pépinière registered successfully!");
};*/
