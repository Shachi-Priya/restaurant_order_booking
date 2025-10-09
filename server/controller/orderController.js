// server/controller/orderController.js
const Order = require("../model/orderModel");
const menu = require("../data/menu.json");
const tables = require("../data/tables.json");

// Build a fast lookup: { [id:number]: { id, name, price? } }
const menuIndex = (() => {
  const idx = Object.create(null);
  // menu is an array of categories: { category, items: [...] }
  for (const section of menu) {
    for (const it of section.items) {
      // You can add prices to menu.json; if not, default to 0
      idx[Number(it.id)] = {
        id: Number(it.id),
        name: it.name,
        price: Number(it.price ?? 0),
      };
    }
  }
  return idx;
})();

// Allowed tables
const tableSet = new Set(tables.map(Number));

// helpers
function toMoney(n) {
  // round to 2 decimals to avoid floating drift (change if using integers/paise)
  return Math.round((Number(n) || 0) * 100) / 100;
}

function sanitizeItems(clientItems = []) {
  const sanitized = [];
  for (const raw of clientItems) {
    const id = Number(raw.id);
    const found = menuIndex[id];
    if (!found) continue; // skip unknown items

    // force server truth for name & price; never trust client
    const qty = Math.max(1, parseInt(raw.qty, 10) || 0);
    if (!qty) continue;

    sanitized.push({
      id: found.id,
      name: found.name,
      price: toMoney(found.price),
      qty,
    });
  }
  return sanitized;
}

exports.createOrder = async (req, res) => {
  try {
    const { tableNo: tableNoRaw, items: clientItems, adult, Barn1, Barn2 } = req.body;

    const tableNo = Number(tableNoRaw);
    if (!tableNo || !tableSet.has(tableNo)) {
      return res.status(400).json({ message: "Invalid or missing table number" });
    }

    const items = sanitizeItems(clientItems);
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No valid items in order" });
    }

    // totals
    const total = toMoney(items.reduce((sum, item) => sum + item.price * item.qty, 0));

    const SERVICE_TAX_RATE = process.env.SERVICE_TAX_RATE
      ? Number(process.env.SERVICE_TAX_RATE)
      : 0.05; // 5%
    const GST_RATE = process.env.GST_RATE
      ? Number(process.env.GST_RATE)
      : 0.12; // 12%

    const serviceTax = toMoney(total * SERVICE_TAX_RATE);
    const GST = toMoney(total * GST_RATE);
    const payable = toMoney(total + serviceTax + GST);

    const order = await Order.create({
      tableNo,
      items,
      total,
      serviceTax,
      GST,
      payable,
      adult: Number(adult || 0),
      Barn1: Number(Barn1 || 0),
      Barn2: Number(Barn2 || 0),
    });

    return res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getOrdersByTable = async (req, res) => {
  try {
    const tableNo = Number(req.params.tableNo);
    if (!tableNo || !tableSet.has(tableNo)) {
      return res.status(400).json({ message: "Invalid table number" });
    }
    const orders = await Order.find({ tableNo }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
