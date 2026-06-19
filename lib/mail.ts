import nodemailer from "nodemailer";
import { getEnv } from "./env";
import { createQrPngBuffer } from "./qr";
import type { RegistrationRecord } from "./registration";
import { durationMs, maskEmail } from "./debug";

export async function sendConfirmationEmail(registration: RegistrationRecord) {
  const startedAt = Date.now();
  const smtpHost = getEnv("SMTP_HOST");
  const smtpPassword = getEnv("SMTP_PASSWORD");

  console.info("[smtp] send start", {
    id: registration.id,
    host: smtpHost,
    port: getEnv("SMTP_PORT"),
    secure: process.env.SMTP_SECURE === "true",
    to: maskEmail(registration.email),
  });

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(getEnv("SMTP_PORT")),
    secure: process.env.SMTP_SECURE === "true",
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: getEnv("SMTP_USER"),
      pass: smtpHost.includes("gmail.com")
        ? smtpPassword.replace(/\s+/g, "")
        : smtpPassword,
    },
  });

  const qrPng = await createQrPngBuffer(registration.id);

  const info = await transporter.sendMail({
    from: getEnv("MAIL_FROM"),
    replyTo: getEnv("MAIL_REPLY_TO") || undefined,
    to: registration.email,
    subject: "Xác nhận đăng ký tham gia Bách Thiện Hiếu Vi Tiên",
    html: `
      <div style="text-align:center;font-family:'Segoe UI', Roboto, sans-serif;margin:0 auto;padding:10px;color:#333333;line-height:1.4;">
        <h2 style="color:#c0392b;font-size:22px;font-weight:bold;margin:5px 0 2px 0;">Đăng Ký Thành Công!</h2>
        <p style="font-size:13px;color:#555555;margin:0 0 12px 0;">Cảm ơn quý phụ huynh và học sinh đã đăng ký tham gia chương trình.</p>
        <div style="background-color:#fff9f4;border:1px solid #f3d1c1;padding:12px 15px;text-align:left;margin-bottom:12px;">
          <h3 style="color:#d35400;font-size:15px;margin:0 0 8px 0;border-bottom:1px solid #f3d1c1;padding-bottom:3px;">📌 Thông Tin Sự Kiện</h3>
          <p style="font-size:13px;margin:3px 0;"><strong>Sự kiện:</strong> Bách Thiện Hiếu Vi Tiên – Lễ Tri Ân Cha Mẹ 2026</p>
          <p style="font-size:13px;margin:3px 0;"><strong>Thời gian:</strong> 19h00 - 21h00, Ngày 04/07/2026</p>
          <p style="font-size:13px;margin:3px 0;"><strong>Địa điểm:</strong> Vòng Bán Nguyệt, Phố đi bộ Bạch Đằng, Hải Châu, Đà Nẵng.</p>
        </div>
        <div style="margin:5px 0;">
          <p style="font-size:12px;color:#2c3e50;font-weight:bold;margin:0 0 5px 0;">📲 Vui lòng chụp màn hình Mã QR bên dưới để Check-in:</p>
          <img src="cid:registration-qr" alt="QR check-in" width="220" height="220" style="display:block;margin:0 auto;border:0;" />
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `bach-thien-hieu-vi-tien-${registration.id}.png`,
        content: qrPng,
        cid: "registration-qr",
      },
    ],
  });

  console.info("[smtp] send success", {
    id: registration.id,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    duration: durationMs(startedAt),
  });
}
