import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",   // 👈 Gmail SMTP server
  port: 465,                // 👈 dùng cổng 465 cho kết nối SSL
  secure: true,             // 👈 true nếu dùng cổng 465
  auth: {
    user: process.env.SMTP_USER, // Gmail của bạn
    pass: process.env.SMTP_PASS, // App password (16 ký tự)
  },
});

export default transporter;
