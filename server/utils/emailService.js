import nodemailer from "nodemailer";

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send invoice email
export const sendInvoiceEmail = async ({
  to,
  subject,
  message,
  invoiceHtml,
  invoiceNumber,
}) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"BabyShop" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin: 0;">BabyShop - Invoice</h2>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            ${invoiceHtml}
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Thank you for choosing BabyShop!<br>
              If you have any questions, please contact us at support@babyshop.com
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// Send general email
export const sendEmail = async ({ to, subject, message, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"BabyShop" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text: message,
      html:
        html ||
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin: 0;">BabyShop</h2>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="color: #374151; line-height: 1.6;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Thank you for choosing BabyShop!<br>
              If you have any questions, please contact us at support@babyshop.com
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export default {
  sendInvoiceEmail,
  sendEmail,
};
