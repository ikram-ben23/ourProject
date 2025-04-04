const Cart = require("../models/Cart");
const Product = require("../models/Product");


exports.addToCart = async (req,res) => {
    const { productId , quantity}=req.body;
    const sessionId = req.sessionID;
try {

const product = await Product.findById(productId);
if (!product ) return res.status(404).json({ error: "Produit introuvable" });
if (product.stock< quantity) return res.status(400).json({error:"Stock insuffisant"});
let cart = await Cart.findOne({sessionId});

if (!cart){
    cart = new Cart({ sessionId , items: [] });
}
    const existingItem = cart.items.find(item => item.product.toString()=== productId);
    if(existingItem){
        existingItem.quantity+= quantity;
    }
    else {
        cart.items.push({product : productId, quantity});
    }
    await cart.save();
    res.json(cart);
}
catch (error){
    res.status(500).json({error : error.message});
}
}
 exports.removeFromCart = async (req,res)=>{
    const {product } = req.params;
    const sessionID = req.sessionID;
    try { 
        const cart = await Cart.findOne({ sessionId});
        if (! cart ) return res.status(404).json({error :"cart not found" });
        cart.items = cart.items.filter(item => item.product.toString !==productId);
         await cart.save();$
         res.json(cart);

    }
    catch (error ){
        res.status(500).json({error: error.message});
    }
 };
 exports.getCart = async (req,res)=>{
    const sessionID = req.sessionID;
    try {
        const cart = await Cart.findOne({sessionID}).populate("items.product");
        if (!cart ) return res.status(404).json({error : "empty cart "});
        res.json(cart);
    } catch (error){
        res.status(500).json({error: error.message});
    }
 };