const schedule = require("node-schedule");
const db = require("../config/db");
const { birthdayEmail } = require("../middleware/promotionEmail");

// Email template function
const getBirthdayEmailTemplate = (user, voucherData, valid_until) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Happy Birthday from Wingsblast!</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #ff6f61;
          color: #ffffff;
          text-align: center;
          padding: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 20px;
          color: #333333;
        }
        .content h2 {
          font-size: 24px;
          color: #ff6f61;
        }
        .voucher-code {
          background-color: #fff3f2;
          padding: 15px;
          text-align: center;
          border-radius: 5px;
          margin: 20px 0;
        }
        .voucher-code span {
          font-size: 22px;
          font-weight: bold;
          color: #ff6f61;
        }
        .cta-button {
          display: inline-block;
          background-color: #ff6f61;
          color: #ffffff;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-size: 18px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 15px;
          background-color: #f4f4f4;
          font-size: 14px;
          color: #666666;
        }
        @media (max-width: 600px) {
          .header h1 {
            font-size: 24px;
          }
          .content h2 {
            font-size: 20px;
          }
          .cta-button {
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🎉 Happy Birthday, ${user.first_name} ${user.last_name}! 🎉</h1>
        </div>
        <img src="${voucherData[0]?.image}" alt="birthday" />
        <div class="content">
          <h2>Your Special Gift from Wingsblast</h2>
          <p>Hi ${user.first_name} ${user.last_name},</p>
          <p>To celebrate your special day, we’re excited to give you an <strong>exclusive birthday voucher</strong>! Use it to enjoy amazing discounts on your favorite products at Wingsblast.</p>
          <div class="voucher-code">
           
            <p>Enjoy <strong>${
              voucherData[0]?.is_discount_percentage == 1
                ? `${voucherData[0]?.discount_percentage}%`
                : `$${voucherData[0]?.discount_amount}`
            } off</strong> on any product!</p>
            <p>Valid until: <strong>${valid_until}</strong></p>
          </div>
          <a href="https://wingsblast.com/foodmenu" class="cta-button">Shop Now</a>
          <p>We hope your birthday is filled with joy, love, and unforgettable moments. Thank you for being a part of the Wingsblast family!</p>
          <p>Warm regards,<br><strong>The Wingsblast Team</strong></p>
        </div>
        <div class="footer">
          <p>If you have any questions, feel free to contact us at <a href="mailto:support@wingsblast.com">support@wingsblast.com</a>.</p>
          <p>Wingsblast | +880-XXXX-XXXXXX</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getThreeDayAwayBirthdayEmailTemplate = (
  user,
  voucherData,
  laterDay,
  valid_until
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Birthday is Coming Soon! | Wingsblast</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #ff6f61;
          color: #ffffff;
          text-align: center;
          padding: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 20px;
          color: #333333;
        }
        .content h2 {
          font-size: 24px;
          color: #ff6f61;
        }
        .voucher-code {
          background-color: #fff3f2;
          padding: 15px;
          text-align: center;
          border-radius: 5px;
          margin: 20px 0;
        }
        .voucher-code span {
          font-size: 22px;
          font-weight: bold;
          color: #ff6f61;
        }
        .cta-button {
          display: inline-block;
          background-color: #ff6f61;
          color: #ffffff;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-size: 18px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 15px;
          background-color: #f4f4f4;
          font-size: 14px;
          color: #666666;
        }
        @media (max-width: 600px) {
          .header h1 {
            font-size: 24px;
          }
          .content h2 {
            font-size: 20px;
          }
          .cta-button {
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🎉 Your Birthday is Just ${laterDay} ${
    laterDay == 1 ? "Day" : "Days"
  } Away! 🎉</h1>
        </div>
        <div class="content">
          <h2>Get Ready to Celebrate with Wingsblast!</h2>
          <p>Hi ${user.first_name} ${user.last_name},</p>
          <p>We noticed that your special day is just around the corner! 🎂 To make your birthday even more memorable, we’re thrilled to offer you an <strong>exclusive birthday voucher</strong>. Use it to enjoy amazing discounts on your favorite products at Wingsblast.</p>
          <div class="voucher-code">
           <p>Enjoy <strong>${
             voucherData[0]?.is_discount_percentage == 1
               ? `${voucherData[0]?.discount_percentage}%`
               : `$${voucherData[0]?.discount_amount}`
           } off</strong> on any product!</p>
            <p>Valid until: <strong>${valid_until}</strong></p>
          </div>
          <a href="https://wingsblast.com/foodmenu" class="cta-button">Shop Now</a>
          <p>We can’t wait to help you celebrate your birthday in style. Thank you for being a part of the Wingsblast family!</p>
          <p>Warm regards,<br><strong>The Wingsblast Team</strong></p>
        </div>
        <div class="footer">
          <p>If you have any questions, feel free to contact us at <a href="mailto:support@wingsblast.com">support@wingsblast.com</a>.</p>
          <p>Wingsblast | 718-313-9199</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Service function to fetch users with birthdays
const getUsersWithBirthday = async (month, day) => {
  const query = `
    SELECT * FROM users 
    WHERE 
      MONTH(birth_day) = ? 
      AND DAY(birth_day) = ?;
  `;
  const [data] = await db.query(query, [month, day]);
  return data;
};

// Service function to fetch voucher data
const getVoucherData = async () => {
  const [voucherData] = await db.query(
    "SELECT * FROM vouchers WHERE vouchers_name = 'birthday'"
  );
  return voucherData;
};

// Function to calculate the date 3 days from now
const getDateAfterDays = (day) => {
  const today = new Date();
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + day); // Add 3 days to the current date
  return threeDaysLater;
};

// Main function to check and send birthday emails
const birthdayScheduleChecker = async () => {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    const oneDaysLater = getDateAfterDays(1);
    const oneDaysLaterDay = oneDaysLater.getDate();
    const oneDaysLaterMonth = oneDaysLater.getMonth() + 1;

    const twoDaysLater = getDateAfterDays(2);
    const twoDaysLaterDay = twoDaysLater.getDate();
    const twoDaysLaterMonth = twoDaysLater.getMonth() + 1;

    const threeDaysLater = getDateAfterDays(3);
    const threeDaysLaterDay = threeDaysLater.getDate();
    const threeDaysLaterMonth = threeDaysLater.getMonth() + 1;

    const validDate = getDateAfterDays(5);

    const options = { year: "numeric", month: "long", day: "numeric" };
    const valid_until = validDate.toLocaleDateString("en-US", options);

    const birthdayUsers = {
      todayUsers: await getUsersWithBirthday(month, day),
      oneDayLaterUsers: await getUsersWithBirthday(
        oneDaysLaterMonth,
        oneDaysLaterDay
      ),
      twoDaysLaterUsers: await getUsersWithBirthday(
        twoDaysLaterMonth,
        twoDaysLaterDay
      ),
      threeDaysLaterUsers: await getUsersWithBirthday(
        threeDaysLaterMonth,
        threeDaysLaterDay
      ),
    };

    const voucherData = await getVoucherData();

    const emailDays = [
      { users: birthdayUsers.oneDayLaterUsers, daysLeft: 1 },
      { users: birthdayUsers.twoDaysLaterUsers, daysLeft: 2 },
      { users: birthdayUsers.threeDaysLaterUsers, daysLeft: 3 },
    ];

    for (const { users, daysLeft } of emailDays) {
      for (const user of users) {
        const [userVoucher] = await db.query(
          "INSERT INTO user_vouchers (user_id, voucher_id, valid_from, valid_until) VALUES (?, ?, ?, ?)",
          [user.id, voucherData[0]?.id, today, valid_until]
        );

        const emailData = {
          email: user.email,
          subject: `🎉 ${
            user.first_name
          }, Your birthday is only ${daysLeft} day${
            daysLeft > 1 ? "s" : ""
          } away! Get a special gift from Wingsblast!`,
          htmlContent: getThreeDayAwayBirthdayEmailTemplate(
            user,
            voucherData,
            daysLeft,
            valid_until
          ),
        };
        await birthdayEmail(emailData);
      }
    }

    for (const user of birthdayUsers.todayUsers) {
      const emailData = {
        email: user.email, // Use the current user's email
        subject: voucherData[0].title,
        htmlContent: getBirthdayEmailTemplate(user, voucherData, valid_until),
      };

      await birthdayEmail(emailData);
    }
  } catch (error) {
    console.error("Error in birthdayScheduleChecker:", error.message);
  }
};

// Schedule the job to run every day at 8:00 AM
schedule.scheduleJob("0 8 * * *", birthdayScheduleChecker);

module.exports = birthdayScheduleChecker;
