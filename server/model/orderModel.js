// // server/model/orderModel.js
// const mongoose = require("mongoose");

// const OrderItemSchema = new mongoose.Schema(
//   { id: String, name: String, price: Number, qty: Number },
//   { _id: false }
// );

// const OrderSchema = new mongoose.Schema(
//   {
//     tableNo: Number,
//     items: [OrderItemSchema],

//     total: Number,       // sum(price * qty)
//     serviceTax: Number,  // absolute amount (not percent)
//     GST: Number,         // absolute amount (not percent)
//     payable: Number,     // total + serviceTax + GST

//     adult: Number,
//     Barn1: Number,
//     Barn2: Number,

//     status: { type: String, default: "placed" }, // placed | preparing | served | closed
//     createdAt: { type: Date, default: Date.now }
//   },
//   { collection: "orders" }
// );

// // Reuse model in dev
// module.exports =
//   mongoose.models.Order || mongoose.model("Order", OrderSchema);



//////////////////
// server/model/orderModel.js
const mongoose = require("mongoose");

const toMoney = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0;
};
const toQty = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};

const OrderItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: {
      type: Number,
      default: 0,
      min: 0,
      set: (v) => toMoney(v),
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
      set: (v) => toQty(v),
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    tableNo: { type: Number, required: true, min: 1 },
    items: {
      type: [OrderItemSchema],
      validate: v => Array.isArray(v) && v.length > 0,
    },

    total: { type: Number, default: 0, min: 0, set: (v) => toMoney(v) },
    serviceTax: { type: Number, default: 0, min: 0, set: (v) => toMoney(v) },
    GST: { type: Number, default: 0, min: 0, set: (v) => toMoney(v) },
    payable: { type: Number, default: 0, min: 0, set: (v) => toMoney(v) },

    adult: { type: Number, default: 0, min: 0, set: (v) => Math.max(0, parseInt(v ?? 0, 10) || 0) },
    Barn1: { type: Number, default: 0, min: 0, set: (v) => Math.max(0, parseInt(v ?? 0, 10) || 0) },
    Barn2: { type: Number, default: 0, min: 0, set: (v) => Math.max(0, parseInt(v ?? 0, 10) || 0) },

    // placed = open/ongoing (we keep adding to this order)
    // completed = user finished ordering (stop adding)
    status: { type: String, enum: ["placed", "completed"], default: "placed" },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "orders" }
);

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
