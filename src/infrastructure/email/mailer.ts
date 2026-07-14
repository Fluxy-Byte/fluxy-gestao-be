import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.PASSWORD_GOOGLE,
    },
});

export async function sendMail(to: string, subject: string, html: string) {
    const info = await transporter.sendMail({
        from: `Fluxy Gestão <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
    });
    console.log("[mail] sent", { to, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response });
}
