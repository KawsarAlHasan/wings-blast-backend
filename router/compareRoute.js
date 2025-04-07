const express = require("express");
const { getProductSaleCompare } = require("../controllers/compareController");

const router = express.Router();

router.get("/product/sale", getProductSaleCompare);

module.exports = router;
