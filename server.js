require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const pepiniereRoutes = require("./routes/pepiniere");
const connectDB = require("./config/db");


connectDB();
const app = express(); 
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => {
    res.send("Hello, World! Welcome to the Pépinière API.");
});

app.use("/pepiniere", pepiniereRoutes); 

// Start the server
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});

module.exports = app; 

