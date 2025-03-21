const express = require('express');
const router = express.Router();
const adminController=require('../controllers/admin');

//Admin authentication
router.post('/adminLogin',adminController.adminLogin);
router.post('/admin-forgotpassword',adminController.forgotPassword);
router.post('/adminreset-password/:token',adminController.resetPassword);

// Admin Approval Routes pepinieres
router.get('/pending', adminController.pendingPepinieres);
router.put('/approve/:id', adminController.approve);
router.put('/reject/:id',adminController.reject);
router.get('/approved', adminController.allPepinieres);
router.get('/approved/:id', adminController.onePepiniere);
router.delete('/delete/:id',adminController.deletePepiniere);//delete only for approved pepiniere

// Campaign Management Routes
router.post('/createCampaign', adminController.createCampaign);
router.get('/campaigns', adminController.allCampaigns);
router.get('/getCampaign/:id',adminController.oneCampaign);
router.put('/editCampaign/:id', adminController.editCampaign);
router.delete('/deleteCampaign/:id', adminController.deleteCampaign);

// Volunteer Management Routes 
//router.get('/campaigns/:id/volunteers',/*get all volunteers*/);
//router.put('/campaigns/:campaignId/approve-volunteer/:volunteerId', /*approve vulunteer */);

// Admin Dashboard & Statistics
router.get('/dashboard/statistics',);//get admin statistics

module.exports = router;
