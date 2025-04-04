const express = requier("express");
const router = express.Router();
const compainController = require ("../controllers/compaignControllers");
 
router.post("/: compaignId/register",compainController.registerVolunteer);
 router.get("/:compaignId/participants",compainController.getPartcipants);
 router.post("/send-reminders", sendReminders);
router.delete("/:campaignId/remove/:email", removeParticipant); 
  module.exports= router;