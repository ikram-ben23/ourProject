const express = require('express');
const router = express.Router();
const pepiniereController=require("../controllers/pepiniere");
const { authMiddleware } = require('../middlewares/authMiddleware');

//  Authentification

router.post('/register',pepiniereController.upload.single("profilePicture"), pepiniereController.registerPepiniere);
router.get("/verifyEmail",pepiniereController.verifyEmail);
router.post('/login', pepiniereController.loginPepiniere);
router.post('/forgotpassword',pepiniereController.forgotPassword );
router.post('/resetPassword',pepiniereController.resetPasswordPepiniere);

// Pépinière Dashboard & Statistics
router.get("/myProducts", pepiniereController.getMyProducts);


// Pépinière Profile managment
//router.put('/update-picture',/*modify profile picture of pepiniere*/ );
router.delete('/delete-profile',pepiniereController.deletePepiniere);
router.put("/updateBasicInfo",pepiniereController.updateBasicInfo);
router.put("/updatePhone/:pepiniereId", pepiniereController.updatePhoneNumber);
router.put("/updateEmail/:pepiniereId", pepiniereController.updateEmail);
router.put("/updatePassword/:pepiniereId",pepiniereController.updatePassword);


module.exports = router;
