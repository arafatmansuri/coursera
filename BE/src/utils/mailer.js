require("dotenv").config();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});
console.log({
  user: process.env.MAILER_USER,
  pass: process.env.MAILER_PASS,
});
async function sendMail(email, subject, user, otp) {
  try {
    let mailOptions = {
      from: "corsify.co.in <noreply>",
      to: email,
      subject: subject,
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: #0073e6;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 20px;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            color: #333333;
            line-height: 1.6;
            text-align: center;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            background: #f8f9fa;
            display: inline-block;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            padding: 10px;
            border-top: 1px solid #ddd;
        }
        .button {
            display: inline-block;
            background: #0073e6;
            color: white;
            text-align: center;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }
        @media (max-width: 600px) {
            .container {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">OTP Verification</div>
        <div class="content">
            <p>Hello ${user},</p>
            <p>Your One-Time Password (OTP) for verification is:</p>
            <div class="otp">${otp}</div>
            <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
        </div>
        <div class="footer">© 2025 Coursify | All Rights Reserved</div>
    </div>
</body>
</html>
`,
    };
    let info = await transporter.sendMail(mailOptions);
  } catch (err) {
    throw new Error(err || "Something went wrong while generating otp");
  }
}

module.exports = sendMail;
