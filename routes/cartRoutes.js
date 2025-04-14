const express = require("express");
const {addToCart,removeFromCart,getCart ,decrementQuantity} = require("../controllers/cartControllers");

 
const router = express.Router();
 
router.post("/add", addToCart);
router.delete("/remove/:productId", removeFromCart);
router.get("/", getCart);
router.delete("/remove/:productId",decrementQuantity);
 
module.exports = router;