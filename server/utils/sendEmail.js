import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: `"SJM Security" <${user}>`,
    to,
    subject,
    html,
  });

  return info;
};
