const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const mySqlPool = require("./config/db");
const notifyAdminBeforeOrder = require("./scheduleChecker");
const foodDetailsStatus = require("./scheduleFoodDetailsStatus");
const birthdayScheduleChecker = require("./scheduleChecker/birthdayChecker");
const path = require("path");
dotenv.config();

const app = express();

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
const globalCorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(globalCorsOptions));
app.options("*", cors(globalCorsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/v1/admin", require("./router/adminRoute"));
app.use("/api/v1/user", require("./router/userRoute"));
app.use("/api/v1/forgot", require("./router/forgotPassword"));
app.use("/api/v1/category", require("./router/categoryRouter"));
app.use("/api/v1/flavor", require("./router/flavorRoute"));
app.use("/api/v1/foodmenu", require("./router/foodMenuRoute"));
app.use("/api/v1/food-details", require("./router/foodDetailsRoute"));
app.use("/api/v1/feature", require("./router/featureRoute"));
app.use("/api/v1/product-feature", require("./router/productFeatureRoute"));
app.use("/api/v1/dip", require("./router/dipRoute"));
app.use("/api/v1/side", require("./router/sideRoute"));
app.use("/api/v1/beverage", require("./router/beverageRoute"));
app.use("/api/v1/drink", require("./router/drinkRoute"));
app.use("/api/v1/sand-cust", require("./router/sandCustRoute"));
app.use("/api/v1/toppings", require("./router/toppingsRoute"));
app.use("/api/v1/guest-user", require("./router/guesUserRoute"));
app.use("/api/v1/card", require("./router/cardRoute"));
app.use("/api/v1/orders", require("./router/ordersRoute"));
app.use("/api/v1/settings", require("./router/settingsRoute"));
app.use("/api/v1/coupons", require("./router/couponsRoute"));
app.use("/api/v1/fees", require("./router/feesRouter"));
app.use("/api/v1/tips", require("./router/tipsRoute"));
app.use("/api/v1/notification", require("./router/notificationsRoute"));
app.use("/api/v1/opening", require("./router/openingAndClosingRoute"));
app.use("/api/v1/bonus", require("./router/bonusRoute"));
app.use("/api/v1/promotion", require("./router/promotionRoute"));
app.use("/api/v1/food-promotion", require("./router/foodPromotionRouter"));
app.use("/api/v1/voucher", require("./router/vouchersRoute"));
app.use("/api/v1/user-voucher", require("./router/userVouchersRoute"));
app.use("/api/v1/compare", require("./router/compareRoute"));
app.use("/test", require("./test"));

notifyAdminBeforeOrder();
foodDetailsStatus();
// birthdayScheduleChecker();

mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("MYSQL DB Connected");
  })
  .catch((error) => {
    console.log(error);
  });

// Default Route
app.get("/", (req, res) => {
  res.status(200).send("Wings Blast server is working");
});

// 404 Not Found Middleware
app.use("*", (req, res, next) => {
  res.status(404).json({
    error: "You have hit the wrong route",
  });
});

// Socket.io Events and Attach io to App
io.on("connection", (socket) => {
  console.log("A user connected with socket id:", socket.id);

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Attach Socket.io instance to Express app
app.set("socketio", io);

// Server Start
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Wings Blast server is running on port ${port}`);
});
