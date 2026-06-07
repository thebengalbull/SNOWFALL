
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    const { to, subject, message } = JSON.parse(event.body);
    
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        auth: {
            user: 'kawsar2783@gmail.com',
            pass: process.env.BREVO_KEY
        }
    });
    
    try {
        await transporter.sendMail({
            from: 'orders@snowfall.com',
            to: to,
            subject: subject,
            text: message
        });
        
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
