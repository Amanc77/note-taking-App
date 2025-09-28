import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOTP = async (
  toName: string,
  toEmail: string,
  otp: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px;">
      <p>Hello ${toName},</p>
      <p>Your verification code is:</p>
      <h2>${otp}</h2>
      <p>This code is valid for 5 minutes. Do not share it with anyone.</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: toEmail,
    subject: "Your verification OTP",
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendOTP;
