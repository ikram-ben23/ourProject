const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
    // Configure le transporteur SMTP
    const transporter = nodemailer.createTransport({
        service: "Gmail", // Ou "Outlook", "Yahoo", etc.
        auth: {
            user: process.env.EMAIL_USER, // Ton adresse email (ex: pepiniere@gmail.com)
            pass: process.env.EMAIL_PASS, // Mot de passe ou App Password
        },
    });

    // Paramètres de l'email
    const mailOptions = {
        from: `"Plateforme Pépinières 🌱" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;