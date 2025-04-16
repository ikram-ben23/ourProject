const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    sessionId:{type : String},
    items : [ {
        product : { type : mongoose.Schema.Types.ObjectId , ref: "Product", required: true},
        quantity : { type : Number , required : true , min : 1}

}],
totalPrice : { type :  Number ,required : true , default : 0},
shippingInfo: { 
    name :{ type : String , required : true },
    address : { type : String , required : true },
    phone : { type : Number ,required: true}
},
status: { type : String , default: "Pending "},
createdAt : { type : Date , default: Date.now},
pepinier : {type:  mongoose.Schema.Types.ObjectId, ref: "User", required: true }

});
module.exports = mongoose.model("Order",orderSchema);

