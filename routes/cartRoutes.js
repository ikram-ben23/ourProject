const express = require("express");
const {addToCart,removeFromCart,getCart ,decrementQuantity,incrementQuantity} = require("../controllers/cartControllers");

 
const router = express.Router();
 
router.post("/add", addToCart);
router.delete("/remove/:productId", removeFromCart);
router.get("/get_cart", getCart);
router.delete("/decrement/:productId",decrementQuantity);
router.post('/increment', incrementQuantity);
module.exports = router;