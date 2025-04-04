const mongoose = require("mongoose");
const Product = require("./Product");
const cartSchema = new mongoose.Schema({
    sessionId: { type: String, required: false },
    user : { type :mongoose.Schema.Types.ObjectId , ref :"user",required : false},
    items : [ {
        product : { type : mongoose.Schema.Types.ObjectId , ref: "Product", required: true},
        quantity : { type : Number , required : true , min : 1}
}],
totalPrice : { type :  Number , required : true , default : 0}
});
cartSchema.pre("save", async function (next) {
    let total = 0;
  
    for (let item of this.items) {
      const product = await mongoose.model("Product").findById(item.product);
      if (product) {
        total += product.price * item.quantity;
      }
    }
  
    this.totalPrice = total;
    next();
  });
module.exports = mongoose.model("Cart",cartSchema);