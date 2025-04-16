const Product = require("../models/Product");
const { StatusCodes} = require("http-status-codes");
const User = require ("../models/User");

const addProduct = async(req,res) =>{
try {
    const {name , description , price, stock,pepiniereName,category  }= req.body;
    if (!name || !description || !price || !stock || !pepiniereName|| !category ){
         return res.status(StatusCodes.BAD_REQUEST).json({error: "All fields are required"});   
    }
    if (price <= 0 || stock <0){
        return res.status(StatusCodes.BAD_REQUEST).json({error: "Invalid price or stock" });
    }
   /* const  pepiniere = await User.findById(req.user.id);
    if(!pepiniere){
        return res.status(StatusCodes.FORBIDDEN).json({error :"Only pepiniere can add products"});
 }*/
 let product = await Product.findOne({name, pepiniere: req.user.id});
 if (product ){
    product.stock+=stock;
    await product.save();
    return res.status(StatusCodes.OK).json({message: "stock updated"});
 }
  const image = req.file ? req.file.filename : null ;
   product = new Product ({
    name,
    description,
    price,
    stock,
    pepiniere : req.user.id,
    pepiniereName,
    category,
    image
   });
await product.save();
res.status(StatusCodes.CREATED).json({ message : "product added successfully"});
} catch (error){
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });

    }

};

    const deleteProduct = async (req,res) =>{
try { 
    const productId=req.params.id;
    const userId=req.user.id;
    const product =await Product.findById(productId);
    if (!product){
        return res.status(StatusCodes.NOT_FOUND).json({error: "product not found "});
    }
if (product.pepiniere.toString() !== userId){
return res.status(StatusCodes.FORBIDDEN).json({error: "you are not authorized to delete this product "});
}
await Product.findByIdAndDelete(productId);
res.status(StatusCodes.OK).json({message : "Product deleted successfully"});
} catch (error){
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: error.message});

}
    }; 
    const updateProduct = async (req, res) => {
        try {
            const productId = req.params.id;
            const userId = req.user.id;
            const { name, description, price, stock, pepiniereName ,category} = req.body;
    
            
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: "Produit non trouvé" });
            }
    
            
            if (product.pepiniere.toString() !== userId) {
                return res.status(StatusCodes.FORBIDDEN).json({ error: "Non autorisé à modifier ce produit" });
            }
    
        
            if (name) product.name = name;
            if (description) product.description = description;
            if (  price !== undefined) {
                if (price <= 0) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Le prix doit être supérieur à 0" });
                }
                product.price = price;
            }
            if (stock  !== undefined) {
                if (stock < 0) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Le stock ne peut pas être négatif" });
                }
                product.stock = stock;
            }
            if (pepiniereName) product.pepiniereName = pepiniereName;
            if (category) product.category = category;
            
            if (req.file) {
                product.image = req.file.filename;
            }
    
            await product.save();
            res.status(StatusCodes.OK).json({ message: "Produit mis à jour avec succès", product });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };
    const getProductsByCategory = async (req, res) => {
        
        
        try {
            
            const { category } = req.query;
            const validCategories = ["fleurs", "arbres", "plantes d'intérieur"];  
        if (category && !validCategories.includes(category)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid category" });
        }
            let filter = {};
    
            if (category) {
                filter.category = category;
            }
    
            const products = await Product.find(filter);
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    
    const getMyProducts = async (req, res) =>{
    try {
const myProduct = await Product.find({pepiniere : req.user.id});
res.json(myProduct);

    }catch(error){
        res.status(500).json({error : error.message});
    }  
 };
    const getAllProducts = async(req,res)=>{
        try{
            const AllProduct =await Product.find();
            res.json(AllProduct);
        }
        catch(error){
            res.status(500).json({error : error.message});
        }
    };
 const searchByName = async (req,res)=>{
    const {name} =req.query;
    try {
    const products = await Product.find({
        name: { $regex: name, $options: "i" } // "i" makes it case-insensitive
    });

   res.json(products); }
   catch(error){
    res.status(500).json({error : error.message});
   }
 };

module.exports = { deleteProduct, addProduct, updateProduct, getProductsByCategory,getMyProducts,getAllProducts,searchByName} ;