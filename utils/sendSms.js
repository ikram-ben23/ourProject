const twilio = require('twilio');

// Twilio credentials (you should store these in a safe place, like environment variables)
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Use your Twilio Account SID here
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Use your Twilio Auth Token here
const client = twilio(accountSid, authToken);

// Function to send SMS
const sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Use your Twilio phone number here
      to: to
    });
    console.log('Message sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

module.exports = sendSMS;