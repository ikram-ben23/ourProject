const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const productScheme =  new mongoose.Schema({
    name : { type : String , required : true},
    description : { type : String , required : true},
    price : { type : Number , required : true},
    stock : { type : Number , required : true},
    category: { type: String, required: false }, // Catégorie du produit
    pepiniere :  { type : mongoose.Schema.ObjectId , ref : "User", required : true},
    pepiniereName : { type : String , required : true},
    image : { type : String },
});
  module.exports=mongoose.model("Product",productScheme);