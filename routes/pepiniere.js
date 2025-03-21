const express = require('express');
const router = express.Router();
const pepiniereController=require("../controllers/pepiniere");

//  Authentification

router.post('/register',pepiniereController.upload.single("profilePicture"), pepiniereController.registerPepiniere/* Register a new pépinière */);
router.post('/login', pepiniereController.loginPepiniere/* Login and get token */);
router.post('/forgotpassword',pepiniereController.forgotPassword );
//router.post('/logout',pepiniereController.logoutPepiniere /* Logout */);
router.post('/resetPasswordPepiniere',pepiniereController.resetPasswordPepiniere/* Send reset password link */);


// Pépinière Dashboard & Statistics
//router.get('/my-products', /* Get all products posted by the logged-in pépinière */);
//router.get('/statistics', /* Get pépinière-related statistics */);

// Pépinière Profile managment
router.put('/update-pepiniere',pepiniereController.updatePepiniere );
//router.put('/update-picture',/*modify profile picture of pepiniere*/ );
router.delete('/delete-profile',pepiniereController.deletePepiniere);


module.exports = router;
