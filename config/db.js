const mongoose = require("mongoose");

async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGO_URI,{
        }); // No extra options needed in Mongoose 6+
        console.log("Connected to the database successfully!");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit if unable to connect
    }
}
module.exports = connectDb;
