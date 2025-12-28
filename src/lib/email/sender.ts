import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger/pino';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST!,
    port: parseInt(process.env.MAIL_PORT!),
    secure: false,
});

/**
 * メールを送信する
 * @param to 宛先
 * @param subject 件名
 * @param text 本文
 * @returns 成否(True or False)
 */
export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM!,
            to,
            subject,
            text,
        });
        logger.info('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        logger.error('Error sending email:' + error);
        return false;
    }
};
