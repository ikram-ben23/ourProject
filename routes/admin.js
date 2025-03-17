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
router.get('/:id', adminController.pepiniere);
router.delete('/delete/:id',adminController.deletePepiniere);

// Campaign Management Routes
router.post('/campaigns', /*create compaign */);
router.get('/campaigns', /*get all compaigns */);
router.get('/campaigns/:id', /*get all compaigns by id */);
router.put('/campaigns/:id', /*update compaign */);
router.delete('/campaigns/:id', /*delete comapign */);

// Volunteer Management Routes 
router.get('/campaigns/:id/volunteers',/*get all volunteers*/);
router.put('/campaigns/:campaignId/approve-volunteer/:volunteerId', /*approve vulunteer */);
router.put('/campaigns/:campaignId/reject-volunteer/:volunteerId', /*reject volunteer*/);

// Admin Dashboard & Statistics
router.get('/dashboard/statistics',);//get admin statistics

module.exports = router;
