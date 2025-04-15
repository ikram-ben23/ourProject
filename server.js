require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const pepiniereRoutes = require("./routes/pepiniere");
const connectDB = require("./config/db");
const adminRoutes=require('./routes/admin');
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const session = require("express-session");
const productRoutes = require("./routes/productRoutes");


require("./jobs/deleteExpiredCampaigns");


connectDB();
const app = express(); 
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Configuration de la session
app.use(session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettre true si HTTPS
}));

// Routes
app.get("/", (req, res) => {
    res.send("Hello, World! Welcome to the Pépinière API.");
});




app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/pepiniere", pepiniereRoutes); 
app.use("/api/admin",adminRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});

module.exports = app; 

