const Cart = require("../models/Cart");
const Product = require("../models/Product");



exports.addToCart = async (req, res) => {
  const { productId } = req.body;
  const sessionId = req.sessionID;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });

    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = new Cart({ sessionId, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      return res.status(400).json({ error: 'Produit déjà dans le panier' });
    }

    cart.items.push({ product: productId }); // Quantity defaults to 1
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 exports.removeFromCart = async (req,res)=>{
    const {productId } = req.params;
    const sessionId= req.sessionID;
    try { 
        const cart = await Cart.findOne({ sessionId});
        if (! cart ) return res.status(404).json({error :"cart not found" });
        cart.items = cart.items.filter(item => item.product.equals(productId));
         await cart.save();
         res.status(200).json({message:"product remove from cart successfully"});


    }
    catch (error ){
        res.status(500).json({error: error.message});
    }
 };
 

 exports.getCart = async (req,res)=>{
    const sessionId = req.sessionID;
    try {
        const cart = await Cart.findOne({sessionId}).populate("items.product");
        if (!cart ) return res.status(404).json({error : "empty cart "});
        res.json(cart);
    } catch (error){
        res.status(500).json({error: error.message});
    }
 };

 exports.decrementQuantity= async (req, res) => {
   const { productId } = req.params; 
   
    const sessionId= req.sessionID;
  
    try {
      const cart = await Cart.findOne({ sessionId});
  
      if (!cart) return res.status(404).json({ error: "Cart not found" });
  
      const itemIndex = cart.items.findIndex(item => item.product.equals(peoductId));
  
      if (itemIndex === -1) {
        return res.status(404).json({ error: "Product not found in cart" });
      }
  
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      } else {
        
        cart.items.splice(itemIndex, 1);
      }
  
      await cart.save();
  
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

exports.incrementQuantity= async(req,res)=>{
  const {productId }=req.body;
  const sessionId=req.sessionID;
  try {
    const cart = await Cart.findOne({sessionId});
    if (!cart) return res.status(404).json({error : "cart not found "});
    const item = cart.items.find(item =>item.product.equals(productId));
    if (!item) return res.status(404).json({error : "product not found in cart"});
    item.quantity+=1;
    await cart.save();
    res.json(cart);
  }catch (error){
    res.status(500).json({error : error.message});
  }

};
  