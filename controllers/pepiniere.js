const mongoose=require("mongoose");
const Pepiniere=require("../models/pepiniere");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer=require("multer");
const path = require("path");
const nodemailer=require("nodemailer");
const crypto=require("crypto");



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

// Register Pépinière Function
exports.registerPepiniere = async (req, res) => {
    try {
        const { name, ownerName, email, phone, address, password, description } = req.body;
        const profilePicture = req.file ? req.file.path : null; // Get the uploaded file path

        // Check if email already exists
        const existingPepiniere = await Pepiniere.findOne({ email });
        if (existingPepiniere) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        // Validate password (min 8 characters, must contain letters & numbers)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and contain both letters and numbers." });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new Pépinière
        const newPepiniere = new Pepiniere({
            name: name.trim(),
            ownerName: ownerName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            description: description?.trim(),
            password: hashedPassword,
            profilePicture, // Save the image path
            status: "pending"
        });

        // Save to Database
        await newPepiniere.save();

        res.status(201).json({ message: "Pépinière registered successfully!", data: newPepiniere });

    } catch (error) {
        console.error("Error in registerPepiniere:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.upload = upload;



exports.loginPepiniere = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find Pépinière by email
        const existingPepiniere = await Pepiniere.findOne({ email });
        if (!existingPepiniere) {
            return res.status(404).json({ message: "Pépinière not found!" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, existingPepiniere.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // Check if Pépinière is approved
        if (existingPepiniere.status !== "approved") {
            return res.status(403).json({ message: "Your account is pending approval!" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: existingPepiniere._id }, process.env.SECRET_KEY, { expiresIn: "1h" });

        res.status(200).json({
            message: "Login successful!",
            token,
            pepiniere: {
                id: existingPepiniere._id,
                name: existingPepiniere.name,
                email: existingPepiniere.email,
                phone: existingPepiniere.phone,
                address: existingPepiniere.address
            }
        });

    } catch (error) {
        console.error("Error in loginPepiniere:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};


exports.logoutPepiniere = (req, res) => {
    res.send("Pépinière registered successfully!");
};

exports.resetPasswordPepiniere = (req, res) => {
    res.send("Pépinière registered successfully!");
};

exports.tokenResetPswdPepiniere = (req, res) => {
    res.send("Pépinière registered successfully!");
};