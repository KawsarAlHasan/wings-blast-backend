const nodemailer = require("nodemailer");
require("dotenv").config();
const punycode = require("punycode/");

// Hostinger SMTP credentials
let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NO_REPLY_EMAIL_ADD,
    pass: process.env.NO_REPLY_EMAIL_PASS,
  },
});

const getEmailTemplate = (user, coupon, value) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎉 ${coupon.name} - Special Discount for You!</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            text-align: center;
          }
          .email-container {
            max-width: 600px;
            background: #ffffff;
            margin: 20px auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
          }
          .logo {
            width: 150px;
            margin-bottom: 20px;
          }
          .coupon-image {
            width: 100%;
            height: auto;
            border-radius: 8px;
          }
          .coupon-code {
            font-size: 22px;
            font-weight: bold;
            color: #d9534f;
            padding: 10px;
            background: #ffe6e6;
            display: inline-block;
            border-radius: 5px;
            margin: 10px 0;
          }
          .discount-text {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
          }
          .button {
            display: inline-block;
            padding: 12px 20px;
            margin-top: 15px;
            font-size: 18px;
            color: #ffffff;
            background: #007bff;
            text-decoration: none;
            border-radius: 5px;
          }
          .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
          }
          .social-icons img {
            width: 30px;
            margin: 5px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          
          <img src="https://wingsblast.com/assets/website%20Logo-B9okQQah.png" alt="Company Logo" class="logo" />
          
          <h2>Hi ${user.first_name} ${user.last_name},</h2>
          <p>We have an exclusive **limited-time offer** just for you! Use the ${
            value == "promotion" ? "promotion" : "coupon"
          }  below and save on your next order.</p>
          
          ${
            coupon.image
              ? `<img src="${coupon.image}" alt="Coupon Image" class="coupon-image" />`
              : ""
          }
  
          <p class="coupon-code">${coupon.code}</p>
          
          <p class="discount-text">
            ${
              coupon.is_discount_percentage
                ? `${coupon.discount_percentage}% OFF`
                : `$${coupon.discount_price} Discount`
            }
          </p>
  
          <p>🕒 Hurry! Offer expires on **${new Date(
            coupon.expiration_date
          ).toDateString()}**.</p>
  
  
          <p class="footer">Need help? Contact our support team at <a href="mailto:support@wingsblast.com">support@wingsblast.com</a>.</p>
  
       
          <p class="footer">© ${new Date().getFullYear()} Wingsblast. All Rights Reserved.</p>
        </div>
      </body>
      </html>
    `;
};

exports.sendBulkEmails = async (users, coupon) => {
  try {
    await Promise.all(
      users.map((user) => {
        const mailOptions = {
          from: process.env.NO_REPLY_EMAIL_ADD,
          to: user.email,
          subject: `🎁 Hurry! ${
            coupon.is_discount_percentage
              ? `${coupon.discount_percentage}% OFF`
              : `$${coupon.discount_price} Discount`
          } – Limited Time Only! ⏳`,
          html: getEmailTemplate(user, coupon, "coupon"),
        };

        return transporter.sendMail(mailOptions);
      })
    );

    return true;
  } catch (error) {
    console.error("Error sending emails:", error);
    return false;
  }
};

exports.sendBulkPromotionEmails = async (users, promotion) => {
  try {
    await Promise.all(
      users.map((user) => {
        const mailOptions = {
          from: process.env.NO_REPLY_EMAIL_ADD,
          to: user.email,
          subject: `🎁 Hurry! ${
            promotion.is_discount_percentage
              ? `${promotion.discount_percentage}% OFF`
              : `$${promotion.discount_price} Discount`
          } – Limited Time Only! ⏳`,
          html: getEmailTemplate(user, promotion, "promotion"),
        };

        return transporter.sendMail(mailOptions);
      })
    );

    return true;
  } catch (error) {
    console.error("Error sending emails:", error);
    return false;
  }
};
