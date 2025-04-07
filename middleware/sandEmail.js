const nodemailer = require("nodemailer");
require("dotenv").config();
const punycode = require("punycode/");

// Hostinger SMTP credentials
let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ORDER_EMAIL_ADD,
    pass: process.env.ORDER_EMAIL_PASS,
  },
});

async function sendMail(data) {
  try {
    const {
      first_name,
      last_name,
      order_id,
      phone,
      email,
      delivery_type,
      delevery_address,
      sub_total,
      tax,
      fees,
      delivery_fee,
      tips,
      coupon_discount,
      total_price,
      later_date,
      later_slot,
      foods,
    } = data;

    const emailAddress = punycode.toASCII(email);

    const subject = `Your Order Confirmation - Pending`;

    const htmlContent = ` <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
            }
            .order-summary {
              border: 1px solid #ccc;
              padding: 15px;
              margin-top: 20px;
              background-color: #f9f9f9;
            }
            .order-summary h2 {
              color: #007BFF;
            }
            .order-item {
              margin-top: 10px;
            }
            .order-item img {
              width: 50px;
              height: 50px;
              object-fit: cover;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <h1>Hi ${first_name} ${last_name},</h1>
          <p>Thank you for your order! We have received your order and it is currently pending.</p>
          
          <div class="order-summary">
            <h2>Order Summary:</h2>
            <p><strong>Order ID:</strong> ${order_id}</p>
            <p><strong>Name:</strong> ${first_name} ${last_name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Delivery Type:</strong> ${delivery_type}</p>
            <p><strong>Delivery Address:</strong> ${delevery_address}</p>

            ${foods
              .map(
                (food) => `<div class="order-item">
                            <p><strong>Item:</strong> ${food.name}</p>
                            <img src="${food.image}" alt="${food.name} Image">
                            <p><strong>Description:</strong> ${food.description}</p>
                            <p><strong>Price:</strong> $${food.price}</p>
                            <p><strong>Quantity:</strong> ${food.quantity}</p>
                          </div>`
              )
              .join("")}

            <p><strong>Subtotal:</strong> $${sub_total}</p>
            ${fees > 0 ? `<p><strong>Tax & Fees:</strong> $${fees}</p>` : ""}
            ${fees < 0 ? `<p><strong>Tax:</strong> $${tax}</p>` : ""}
            ${
              delivery_fee > 0
                ? `<p><strong>Delivery Fee:</strong> $${delivery_fee}</p>`
                : ""
            }
            ${tips > 0 ? `<p><strong>Tips:</strong> $${tips}</p>` : ""}
            ${
              coupon_discount > 0
                ? `<p><strong>Coupon Discount:</strong> -$${coupon_discount}</p>`
                : ""
            }     
            <p><strong>Total:</strong> $${total_price}</p>
            <p><strong>Scheduled for:</strong> ${later_slot}</p>
          </div>
          
          <p>If this order was not placed by you, please contact our customer support team immediately.</p>
  
          <div class="footer">
            <p>&copy; 2024 WingsBlast. All Rights Reserved.</p>
          </div>
        </body>
      </html>`;

    const mailOptions = {
      from: process.env.ORDER_EMAIL_ADD,
      to: emailAddress,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

module.exports = { sendMail };
