const cron = require("node-cron");
const Campaign = require("../models/Compaign");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
    try {
        const now = new Date();
        const result = await Campaign.deleteMany({ date: { $lt: now } });
        console.log(`[${new Date().toISOString()}] Deleted ${result.deletedCount} expired campaigns.`);
    } catch (err) {
        console.error("Failed to delete expired campaigns:", err);
    }
});
