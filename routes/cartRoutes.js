const express = require("express");
const {addToCart,removeFromCart,getCart } = require("../controllers/cartControllers");

 
const router = express.Router();
 
router.post("/add", addToCart);
router.delete("/remove/:productId", removeFromCart);
router.get("/", getCart);
 
module.exports = router;