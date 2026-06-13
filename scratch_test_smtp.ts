const nodemailer = require('nodemailer');

async function test() {
    const host = process.env.SMTP_HOST || 'w01dc0ea.kasserver.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER || 'rentex@metechnik.at';
    const pass = process.env.SMTP_PASS || '01528797Mb##';

    console.log(`Connecting to ${host}:${port} as ${user}...`);

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
        // We can add logger and debug to see detailed SMTP communication!
        logger: true,
        debug: true
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection verified successfully!');

        const info = await transporter.sendMail({
            from: `"RentEx Test" <${user}>`,
            to: 'gsgmete68@gmail.com',
            subject: 'RentEx SMTP Test',
            text: 'Hello from RentEx SMTP Test Script!'
        });

        console.log('✅ Email sent successfully:', info.messageId);
    } catch (err) {
        console.error('❌ SMTP Error encountered:', err);
    }
}

test();
