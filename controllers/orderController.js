const Order = require("../models/Order");
 const Cart = require("../models/Cart");
const Product = require("../models/Product");
const nodemailer = require ("nodemailer");
const { StatusCodes} = require("http-status-codes");
 exports.createOrder = async (req, res)=> {
    const { name, address, phone}= req.body;
    const sessionId = req.sessionID;
    try {
        const cart = await Cart.findOne( { sessionId  }).populate("items.product");
   if (! cart || cart.items.length === 0){
    return res.status(400).json({error : "your cart is empty "});
} 
const orderByPepiniere = {};
for (const item of cart.items){
    const pepiniereId = item.product.pepiniere.toString();
if (!orderByPepiniere [pepiniereId]){
    orderByPepiniere[pepiniereId]= [];
} 
orderByPepiniere[pepiniereId].push({
    product : item.product._id,
    quantity: item.quantity
});
}
const createOrders = [];
for (const pepiniereId in orderByPepiniere){
    const items = orderByPepiniere[pepiniereId];
    const totalPrice = items.reduce((total, item)=> {
        const product = cart.items.find(p=> p.product._id.toString()=== item.product.toString()).product;
        return total + product.price * item.quantity;
    
},0);
const order = new Order ({
    items ,
    totalPrice,
    shippingInfo: {name , address, phone},
    pepiniere: pepiniereId
});
await order.save();
createOrders.push(order);

sendOrderEmail(pepiniereId, order);
}
await Cart.deleteOne({ _id: cart._id });
res.status(StatusCodes.CREATED).json({ message: "Order placed successfully.", orders: createdOrders });
}catch (error ){
    res.status(500).json({error: error.message});
}
};
 const sendOrderEmail = async (pepiniereId,order)=>{
    const pepiniere = await pepiniere.findById(pepinierId);
    if (!pepiniere || ! pepiniere.email) return;
    const transporter = nodemailer.createTransport({
        service : "gmail",
        auth :  {  user: process.env.EMAIL, pass : process.env.EMAIL_PASSWORD}
      });
      const mailOptions = {
        from: process.env.EMAIL,
        to: pepinier.email,
        subject: "New Order Received",
        text: `A new order has been placed. ID: ${order._id}, Total Amount: ${order.totalPrice}.`
    };
    

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Erreur lors de l'envoi de l'e-mail:", error);
        } else {
            console.log("E-mail envoyé: ", info.response);
        }
    });
};


 exports.getOrderForPepiniere = async (req, res )=>{
    try {
        const orders = await  Order.find({pepinier : req.user.id}).populate("items.product");
        res.json(orders);
    
    }catch (error){
        res.status(500).json({error : error.message});
    }
 };
 exports.deleteOrder = async (req,res)=>{
 try {
    const orderId = req.params.id ;
    const order = await Order.findById(orderId);
    if (! order){
        return res.status(404).json({error : "order not found "});
    }
    if (order.pepiniere.toString() !== req.user.id){
        return res.status(403).json({error : "you are not authorized to delete this order"});
    }
    await Order.deleteOne({_id : orderId});
    res.status(200).json({message : "order deleted successfully"});
 } catch(error){
    res.status(500).json({error : error.message});
 }

 };
