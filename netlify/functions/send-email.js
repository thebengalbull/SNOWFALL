const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { to, subject, message } = JSON.parse(event.body);

        // Create transporter with Brevo SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            auth: {
                user: 'kawsar2783@gmail.com',
                pass: process.env.BREVO_KEY
            }
        });

        // Send email
        await transporter.sendMail({
            from: '"SNOWFALL" <orders@snowfall.com>',
            to: to,
            subject: subject,
            text: message
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Email sent successfully' })
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
