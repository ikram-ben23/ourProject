const express = require("express");
const multer = require("multer");
const path = require("path");
const { addProduct } = require("../controllers/productController"); 
const {authMiddleware}= require("../middlewares/authMiddleware");
const {deleteProduct} =require("../controllers/productController");
const { updateProduct } = require("../controllers/productController");
const {getProductsByCategory}=require("../controllers/productController");
const {getMyProducts}=require("../controllers/productController");
const {getAllProducts}=require("../controllers/productController");
const {searchByName}=require("../controllers/productController");
const  router = express.Router();
// pour stoker l 'image
const storage = multer.diskStorage({
    destination :  (req,file,cb)=> {
        cb(null, "uploads/" )},
    filename : (req, file , cb)=> {
        cb (null , Date.now()+ path.extname(file.originalname));
    }
});
const upload = multer({storage});
router.post("/add",authMiddleware,upload.single("image"),addProduct);
router.delete("/:id", authMiddleware,deleteProduct);
router.put("/:id", authMiddleware, upload.single("image"), updateProduct);
router.get("/category",getProductsByCategory);
router.get("/my-product",authMiddleware,getMyProducts);
router.get("/AllProduct",authMiddleware,getAllProducts);
router.get("/search",searchByName);
module.exports=router;

/* const { addProduct } = require("../controllers/productController"); */
// ajoutrt la date de modificaton et ajouter un produit 
// ajouter un table association entre le pepinier et produit et entre la sortie en un volontaire
/*🌿 Plantes d’intérieur
🌳 Arbres fruitiers
🌾 Plantes médicinales
🌹 Fleurs et arbustes
🌵 Cactus et succulentes 

 fonction getAllProduct / ok
 Fonction search by name /ok
 Fonction decrementer la quantity dans l'achat / ok
statistic in admin profile :
   - events
   - best 5 product 
   - product/per month 
get all category 
modifier l 'ajout pour category 

*/