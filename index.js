const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const mySqlPool = require("./config/db");
const path = require("path");
const app = express();
dotenv.config();

const globalCorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(globalCorsOptions));
app.options("*", cors(globalCorsOptions));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/v1/admin", require("./router/adminRoute"));
app.use("/api/v1/user", require("./router/userRoute"));
// app.use("/api/v1/forgot", require("./routes/forgotPassword"));
app.use("/api/v1/category", require("./router/categoryRouter"));
app.use("/api/v1/flavor", require("./router/flavorRoute"));
app.use("/api/v1/foodmenu", require("./router/foodMenuRoute"));
app.use("/api/v1/food-details", require("./router/foodDetailsRoute"));
app.use("/api/v1/dip", require("./router/dipRoute"));
app.use("/api/v1/side", require("./router/sideRoute"));
app.use("/api/v1/beverage", require("./router/beverageRoute"));
app.use("/api/v1/drink", require("./router/drinkRoute"));
app.use("/api/v1/guest-user", require("./router/guesUserRoute"));
app.use("/api/v1/card", require("./router/cardRoute"));

const port = process.env.PORT || 8000;

mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("MYSQL DB Connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(port, () => {
  console.log(`Wings Blast server in running on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Wings Blast server is working");
});

// 404 Not Found middleware
app.use("*", (req, res, next) => {
  res.status(404).json({
    error: "You have hit the wrong route",
  });
});
