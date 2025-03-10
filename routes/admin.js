const express = require('express');
const router = express.Router();

// Admin Approval Routes pepinieres
router.get('/pending', /* Get all pending registrations */);
router.put('/approve/:id', /* Approve a pépinière */);
router.put('/reject/:id', /* Reject a pépinière */);
router.get('/approved', /* Get all approved pépinières */);
router.get('/:id', /* Get details of a specific pépinière by ID */);

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

// Product Management Routes (Admin Only)
router.post('/products',); // Add a new product
router.get('/products', ); // Get all products
router.get('/products/:id',); // Get product details
router.put('/products/:id', ); // Update a product
router.delete('/products/:id',); // Delete a product

// Admin Dashboard & Statistics
router.get('/dashboard/statistics',);//get admin statistics

module.exports = router;
