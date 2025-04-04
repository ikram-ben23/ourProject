const express = require("express");
const {createOrder, getOrderForPepiniere,deleteOrder } = require("../controllers/orderController");
const { authMiddleware } = require("../middlewares/authMiddleware");

 
const router = express.Router();
 router.post("/create",createOrder)
router.get("/my-orders",authMiddleware,getOrderForPepiniere);
router.delete("/delete/:id",authMiddleware,deleteOrder);
module.exports=router;