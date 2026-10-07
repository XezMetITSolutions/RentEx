import nodemailer from 'nodemailer';
import { COMPANY } from './email/layout';
import type { EmailMessage } from './email/templates';

export { emailTemplates, type EmailMessage } from './email/templates';

/** Office inbox: staff notices go here and customer replies land here. */
export const COMPANY_EMAIL = COMPANY.EMAIL;

const FROM = process.env.EMAIL_FROM || `Rent-Ex <${COMPANY_EMAIL}>`;

/** Sends one e-mail (HTML + plain text). Never throws; returns false on failure. */
export async function sendEmail(to: string, message: EmailMessage): Promise<boolean> {
    const mail = {
        from: FROM,
        to,
        replyTo: COMPANY_EMAIL,
        subject: message.subject,
        text: message.body,
        html: message.html,
    };
    try {
        if (!process.env.SMTP_HOST) throw new Error('SMTP_HOST is not configured');
        const port = parseInt(process.env.SMTP_PORT || '465', 10);
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure: port === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            connectionTimeout: 15_000,
            greetingTimeout: 15_000,
            socketTimeout: 20_000,
        });
        await transporter.sendMail(mail);
        return true;
    } catch (err) {
        console.error(`[sendEmail] Failed (${message.subject}):`, err);
        return false;
    }
}
