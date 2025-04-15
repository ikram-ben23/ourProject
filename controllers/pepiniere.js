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
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const Product=require("../models/Product");


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
        

        // generate jwt
        const token = jwt.sign(
            { id: newPepiniere._id, role: "pepiniere", status: newPepiniere.status },
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        );
        // 1. Send welcome email
await sendEmail(email, "Welcome to GreenPlatform 🌿", `
    <h2>Welcome, ${ownerName}!</h2>
    <p>You have successfully registered your pépinière. Please wait while our admin reviews and approves your account.</p>
`);

// 2. Generate a token and send email confirmation link
const emailToken = crypto.randomBytes(32).toString("hex");
newPepiniere.emailToken = emailToken;
newPepiniere.isVerified = false;
await newPepiniere.save();

const confirmationLink = `http://localhost:5000/api/pepiniere/verify-email?token=${emailToken}&email=${email}`;

await sendEmail(email, "Please confirm your email ✉️", `
    <h3>Hello ${ownerName},</h3>
    <p>Please confirm your email by clicking the link below:</p>
    <a href="${confirmationLink}">Confirm Email</a>
`);


        res.status(201).json({ 
            message: "Pépinière registered successfully! Waiting for admin approval.", 
            token,
            user: {
                id: newPepiniere._id,
                name: newPepiniere.name,
                ownerName: newPepiniere.ownerName,
                email: newPepiniere.email,
                phone: newPepiniere.phone,
                profilePicture: newPepiniere.profilePicture,
                status: newPepiniere.status
            }
        });


    } catch (error) {
        console.error("Error in registerPepiniere:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, token } = req.query;
        const pep = await Pepiniere.findOne({ email, emailToken: token });

        if (!pep) {
            return res.status(400).send("Invalid token or email");
        }

        pep.isVerified = true;
        pep.emailToken = null;
        await pep.save();

        res.send("Email verified successfully! ✅");
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).send("Server error");
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
            return res.status(200).json({ message: "Your account is not approved yet.Please wait for admin approval" });
        }

          // Generate JWT Token
          const token = jwt.sign(
            { id: pepiniere._id, role: "pepiniere", status: pepiniere.status },
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token,
            user: {
                id: pepiniere._id,
                name: pepiniere.name,
                ownerName: pepiniere.ownerName,
                email: pepiniere.email,
                phone: pepiniere.phone,
                profilePicture: pepiniere.profilePicture,
                status: pepiniere.status
            }
        });

        console.log("Generated Token:", token);

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};


//this is the new one
/*
exports.loginPepiniere = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find the Pépinière by email (ignore case sensitivity)
        const pepiniere = await Pepiniere.findOne({ email: email.trim().toLowerCase() });
        if (!pepiniere) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare password with the stored hashed password
        const isMatch = await bcrypt.compare(password, pepiniere.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT Token (always generate token)
        const token = jwt.sign(
            { id: pepiniere._id, role: "pepiniere", status: pepiniere.status },
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        );

        // Prepare the response message
        let message = "Login successful";
        if (pepiniere.status !== "approved") {
            message = "Your account is not approved yet. Please wait for admin approval.";
        }


        // Return the response with the token, message, and user info
        return res.status(200).json({
            message,
            token, // Send the token to the client
            user: {
                id: pepiniere._id,
                name: pepiniere.name,
                ownerName: pepiniere.ownerName,
                email: pepiniere.email,
                phone: pepiniere.phone,
                profilePicture: pepiniere.profilePicture,
                status: pepiniere.status
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
*/

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

exports.resetPasswordPepiniere = async (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      
      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }
  
      // Check if passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
  
      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
        });
      }
  
      // Hash the token and find the user
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const user = await Pepiniere.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
      });
  
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
  
      // Remove the reset token after successful reset
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
  
      await user.save();
  
      res.json({ message: "Password reset successful!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };
  
/*exports.resetPasswordPepiniere=async(req,res) => {
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
    
};*/


/*exports.updatePepiniere=async(req,res)=>{
    try{
        const pepiniereId=req.pepiniere.id;
        const updates=req.body;

        const updatedPepiniere=await Pepiniere.findByIdAndUpdate(pepiniereId,updates,{
            new: true,
            runValidators: true
        });
    

        return res.status(200).json(updatedPepiniere);
    }catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};*/


/*exports.updatePepiniere = async (req, res) => {
    try {
        const pepiniereId = req.pepiniere.id;
        const updates = req.body;

        // Allowed fields to update
        const allowedUpdates = ['location', 'phone', 'ownerName', 'name', 'email', 'password'];

        // Check for invalid fields in the request body
        const invalidFields = Object.keys(updates).filter((field) => !allowedUpdates.includes(field));
        if (invalidFields.length) {
            return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(', ')}` });
        }

        // Handle Email Update Flow
        if (updates.email) {
            // Step 1: Authenticate current email (optional step for double-check)
            if (!req.pepiniere.email) {
                return res.status(400).json({ error: "Please provide a valid current email" });
            }

            // Step 2: Validate new email format
            if (!validator.isEmail(updates.email)) {
                return res.status(400).json({ error: "Invalid email format" });
            }

            // Step 3: Send verification email (Assume a sendVerificationEmail function exists)
            const verificationCode = crypto.randomBytes(20).toString('hex');
            await sendVerificationEmail(updates.email, verificationCode);

            // Step 4: Verify code provided by the user
            if (!updates.verificationCode || updates.verificationCode !== verificationCode) {
                return res.status(400).json({ error: "Invalid or expired verification code" });
            }

            // Step 5: If verification is successful, update the email in the database
            const updatedPepiniere = await Pepiniere.findByIdAndUpdate(pepiniereId, { email: updates.email }, { new: true });
            return res.status(200).json({ message: "Email updated successfully", updatedPepiniere });
        }

        // Handle Password Update Flow
        if (updates.password) {
            // Step 1: Authenticate current password
            const isMatch = await bcrypt.compare(updates.currentPassword, req.pepiniere.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }

            // Step 2: Validate new password strength
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(updates.password)) {
                return res.status(400).json({
                    error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
                });
            }

            // Step 3: Hash the new password and update
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);

            const updatedPepiniere = await Pepiniere.findByIdAndUpdate(pepiniereId, { password: updates.password }, { new: true });
            return res.status(200).json({ message: "Password updated successfully", updatedPepiniere });
        }

        // Update other fields (location, phone, ownerName, name)
        const updatedPepiniere = await Pepiniere.findByIdAndUpdate(pepiniereId, updates, { new: true, runValidators: true });
        if (!updatedPepiniere) {
            return res.status(404).json({ error: "Pépinière not found" });
        }

        return res.status(200).json(updatedPepiniere);

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Helper function to send verification email
async function sendVerificationEmail(email, verificationCode) {
    // Simulating sending email
    console.log(`Sending verification code ${verificationCode} to email: ${email}`);
    // Implement actual email sending logic here (e.g., using nodemailer)
}
*/


exports.getMyProducts = async (req, res) => {
  try {
    const pepiniereId = req.user.id; // assuming you're using auth middleware that adds `req.user`

    const products = await Product.find({ pepiniere: pepiniereId });

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.updateBasicInfo = async (req, res) => {
    try {
        const pepiniereId = req.pepiniere.id; // Assuming you're using auth middleware that sets req.pepiniere
        const { ownerName, name, address } = req.body;

        const pepiniere = await Pepiniere.findById(pepiniereId);
        if (!pepiniere) {
            return res.status(404).json({ error: "Pépinière not found" });
        }

        if (ownerName) pepiniere.ownerName = ownerName;
        if (name) pepiniere.name = name;
        if (address) pepiniere.address = address;

        await pepiniere.save();

        res.status(200).json({ message: "Profile info updated successfully", pepiniere });
    } catch (error) {
        console.error("Error updating basic info:", error);
        res.status(500).json({ error: "Server error" });
    }
};


exports.updatePhoneNumber = async (req, res) => {
    try {
      const { pepiniereId } = req.params;
      const { newPhone } = req.body;
  
      // Validate phone number (simple validation)
      if (!/^\d{8,15}$/.test(newPhone)) {
        return res.status(400).json({ message: "Invalid phone number." });
      }
  
      // Check if Pepiniere exists
      const pepiniere = await Pepiniere.findById(pepiniereId);
      if (!pepiniere) {
        return res.status(404).json({ message: "Pepiniere not found." });
      }
  
      // Update phone number
      pepiniere.phone = newPhone;
      await pepiniere.save();
  
      // Send a confirmation email
      await sendEmail({
        to: pepiniere.email,
        subject: "📱 Phone number updated",
        html: `
          <h2>Hi ${pepiniere.ownerName},</h2>
          <p>Your phone number has been successfully updated.</p>
          <p><strong>New Phone Number:</strong> ${newPhone}</p>
          <p>If you didn't make this change, please contact us immediately.</p>
          <p>🌿 The Pepiniere Team</p>
        `,
      });
  
      // Send SMS confirmation
      const smsMessage = `Your phone number has been successfully updated to ${newPhone}. If this wasn't you, please contact us immediately. 🌿`;
      await sendSMS(newPhone, smsMessage);
  
      res.status(200).json({ message: "Phone number updated successfully." });
    } catch (error) {
      console.error("Error updating phone number:", error);
      res.status(500).json({ message: "Server error." });
    }
  };


  exports.updateEmail = async (req, res) => {
      try {
          const pepiniereId = req.pepiniere.id;
          const { email } = req.body;
  
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
              return res.status(400).json({ error: "Adresse e-mail invalide" });
          }
  
          const pepiniere = await Pepiniere.findById(pepiniereId);
          if (!pepiniere) {
              return res.status(404).json({ error: "Pépinière non trouvée" });
          }
  
          if (email.toLowerCase() === pepiniere.email) {
              return res.status(400).json({ error: "Cette adresse e-mail est déjà utilisée" });
          }
  
          const emailExist = await Pepiniere.findOne({ email: email.toLowerCase() });
          if (emailExist) {
              return res.status(400).json({ error: "Cette adresse e-mail est déjà utilisée par une autre pépinière" });
          }
  
          // Générer un token de vérification
          const verificationToken = crypto.randomBytes(32).toString("hex");
  
          pepiniere.email = email.toLowerCase();
          pepiniere.verified = false;
          pepiniere.verificationToken = verificationToken;
          await pepiniere.save();
  
          const verificationLink = `http://localhost:3000/verify-email/${verificationToken}`;
  
          await sendEmail({
              to: pepiniere.email,
              subject: "Vérifiez votre nouvelle adresse e-mail",
              html: `
                  <p>Bonjour ${pepiniere.ownerName},</p>
                  <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre nouvelle adresse e-mail :</p>
                  <a href="${verificationLink}">Vérifier mon adresse</a>
                  <p>Merci 🌱</p>
              `,
          });
  
          res.status(200).json({
              message: "Adresse e-mail mise à jour. Un lien de vérification a été envoyé.",
          });
  
      } catch (error) {
          console.error("Erreur updateEmail:", error);
          res.status(500).json({ error: "Erreur serveur" });
      }
  };
  exports.updatePassword = async (req, res) => {
      const { currentPassword, newPassword } = req.body;
    
      // Check if both currentPassword and newPassword are provided
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
    
      try {
        // Find the user (pepinière) based on the logged-in user or their token
        const pepiniere = await Pepiniere.findById(req.user.id); // Assuming `req.user` contains authenticated user data
    
        if (!pepiniere) {
          return res.status(404).json({ message: 'Pepiniere not found' });
        }
    
        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, pepiniere.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
    
        // Validate new password (you can add additional checks, e.g., length, complexity)
        if (newPassword.length < 6) {
          return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }
    
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
    
        // Update the password in the database
        pepiniere.password = hashedPassword;
        await pepiniere.save();
    
        // Optionally, send a confirmation email (you can modify the email body)
        const confirmationMessage = 'Your password has been successfully updated.';
        await sendEmail(
          pepiniere.email,
          'Password Update Confirmation',
          confirmationMessage
        );
    
        // Respond with success message
        res.status(200).json({ message: 'Password updated successfully' });
    
      } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
      }
    };

exports.deletePepiniere=async(req,res)=>{
    try{
        const pepiniereId=req.pepiniere.id;
        const deletedPepiniere=await Pepiniere.findByIdAndDelete(pepiniereId);

        if(!deletedPepiniere){
            return res.status(404).json({message:"Pépinière not found"});    
        }
        await Product.deleteMany({ pepiniere: pepiniereId });
            res.status(200).json({ message: "Pépinière deleted successfully" });
    } catch (error) {
            res.status(500).json({ message: "Server error", error });
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
