const db = require("../config/db");
const paypal = require("paypal-rest-sdk");
require("dotenv").config();

// PayPal SDK Configuration
paypal.configure({
  mode: "sandbox", // "sandbox" or "live"
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

// API: Create Payment
exports.createPayment = async (req, res) => {
  const { total, orderId } = req.body;

  const createPaymentJson = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: `Order #${orderId}`,
              sku: orderId,
              price: total,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: total,
        },
        description: `Payment for Order #${orderId}`,
      },
    ],
  };

  paypal.payment.create(createPaymentJson, (error, payment) => {
    if (error) {
      res.status(500).json({ error: error.response });
    } else {
      const approvalUrl = payment.links.find(
        (link) => link.rel === "approval_url"
      );
      res.status(200).json({ approval_url: approvalUrl.href });
    }
  });
};

// API: Execute Payment
exports.executePayment = async (req, res) => {
  const { paymentId, payerId } = req.body;

  const executePaymentJson = {
    payer_id: payerId,
  };

  paypal.payment.execute(paymentId, executePaymentJson, (error, payment) => {
    if (error) {
      res.status(500).json({ error: error.response });
    } else {
      const { id: payment_id, payer, transactions } = payment;
      const orderId = transactions[0].item_list.items[0].sku;
      const amount = transactions[0].amount.total;
      const status = payment.state;

      const query =
        "INSERT INTO payments (payment_id, payer_id, amount, status, order_id) VALUES (?, ?, ?, ?, ?)";
      db.execute(query, [
        payment_id,
        payer.payer_info.payer_id,
        amount,
        status,
        orderId,
      ]);

      res.status(200).json({ success: true, payment });
    }
  });
};
