import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT ?? 465),
  secure: Number(SMTP_PORT ?? 465) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

export function sendPhotoMail({ to, image, ext }) {
  return transporter.sendMail({
    from: MAIL_FROM ?? SMTP_USER,
    to,
    subject: '[js4cut] 인생네컷이 도착했어요 📸',
    text: '오늘의 인생네컷을 첨부해 보내드려요. 즐거운 추억 되세요!',
    attachments: [{ filename: `js4cut.${ext}`, content: image }],
  });
}
