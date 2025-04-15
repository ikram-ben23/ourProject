
const Campaign = require("../models/campaign");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "your-email@gmail.com",
        pass: "your-password",
    },
});

// Register a volunteer
const registerVolunteer = async (req, res) => {
    try {
        const { fullName, email, phone } = req.body;
        const { campaignId } = req.params;

        // Prevent spamming (only 1 registration per 5 seconds per user)
        if (req.session.lastRegistration && (Date.now() - req.session.lastRegistration) < 5000) {
            return res.status(429).json({ message: "Too many requests. Please wait before registering again." });
        }
        req.session.lastRegistration = Date.now();

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        if (!campaign.canRegister()) {
            return res.status(400).json({ message: "Registration is closed or full" });
        }

        // Check for duplicate registration
        if (campaign.participants.some((p) => p.email === email)) {
            return res.status(400).json({ message: "You are already registered" });
        }

        // Register participant
        campaign.participants.push({ fullName, email, phone });
        campaign.registeredParticipants += 1;
        await campaign.save();

        return res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all participants for a campaign
const getAllParticipants = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        return res.status(200).json({ participants: campaign.participants });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Send reminder emails 24 hours before the event
const sendReminders = async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        const now = new Date();

        for (const campaign of campaigns) {
            const eventTime = new Date(campaign.date);
            const timeDiff = eventTime - now;
            const hoursUntilEvent = timeDiff / (1000 * 60 * 60);

            if (hoursUntilEvent <= 24 && hoursUntilEvent > 23) {
                for (const participant of campaign.participants) {
                    await transporter.sendMail({
                        from: "your-email@gmail.com",
                        to: participant.email,
                        subject: "Reminder: Upcoming Campaign",
                        text: `Hello ${participant.fullName},\n\nThis is a reminder that your campaign "${campaign.title}" is happening in less than 24 hours.\n\nThank you!`,
                    });
                }
            }
        }

        return res.status(200).json({ message: "Reminders sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error sending reminders", error: error.message });
    }
};

// Remove a participant manually (Admin)
const removeParticipant = async (req, res) => {
    try {
        const { campaignId, email } = req.params;

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        const participantIndex = campaign.participants.findIndex((p) => p.email === email);
        if (participantIndex === -1) {
            return res.status(404).json({ message: "Participant not found" });
        }

        // Remove participant
        campaign.participants.splice(participantIndex, 1);
        campaign.registeredParticipants -= 1;
        await campaign.save();

        return res.status(200).json({ message: "Participant removed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { registerVolunteer, getAllParticipants, sendReminders, removeParticipant };