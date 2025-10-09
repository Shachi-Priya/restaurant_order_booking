// server/model/orderModel.js
const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  { id: String, name: String, price: Number, qty: Number },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    tableNo: Number,
    items: [OrderItemSchema],

    total: Number,       // sum(price * qty)
    serviceTax: Number,  // absolute amount (not percent)
    GST: Number,         // absolute amount (not percent)
    payable: Number,     // total + serviceTax + GST

    adult: Number,
    Barn1: Number,
    Barn2: Number,

    status: { type: String, default: "placed" }, // placed | preparing | served | closed
    createdAt: { type: Date, default: Date.now }
  },
  { collection: "orders" }
);

// Reuse model in dev
module.exports =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
