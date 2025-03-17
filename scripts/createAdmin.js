/*const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/admin"); // Adjust path based on your structure
require("dotenv").config(); // Load environment variables

// Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: process.env.EMAIL_USER });
    if (existingAdmin) {
      console.log("Admin already exists. No need to create another.");
      return mongoose.connection.close();
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10); // Change password

    // Create new admin
    const admin = new Admin({
      email:process.env.EMAIL_USER,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin account created successfully!");
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createAdmin();*/
