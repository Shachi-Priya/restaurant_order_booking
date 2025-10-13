// // server/controller/orderController.js
// const Order = require("../model/orderModel");
// const menu = require("../data/menu.json");
// const tables = require("../data/tables.json");

// // Build a fast lookup: { [id:number]: { id, name, price? } }
// const menuIndex = (() => {
//   const idx = Object.create(null);
//   // menu is an array of categories: { category, items: [...] }
//   for (const section of menu) {
//     for (const it of section.items) {
//       // You can add prices to menu.json; if not, default to 0
//       idx[Number(it.id)] = {
//         id: Number(it.id),
//         name: it.name,
//         price: Number(it.price ?? 0),
//       };
//     }
//   }
//   return idx;
// })();

// // Allowed tables
// const tableSet = new Set(tables.map(Number));

// // helpers
// function toMoney(n) {
//   // round to 2 decimals to avoid floating drift (change if using integers/paise)
//   return Math.round((Number(n) || 0) * 100) / 100;
// }

// function sanitizeItems(clientItems = []) {
//   const sanitized = [];
//   for (const raw of clientItems) {
//     const id = Number(raw.id);
//     const found = menuIndex[id];
//     if (!found) continue; // skip unknown items

//     // force server truth for name & price; never trust client
//     const qty = Math.max(1, parseInt(raw.qty, 10) || 0);
//     if (!qty) continue;

//     sanitized.push({
//       id: found.id,
//       name: found.name,
//       price: toMoney(found.price),
//       qty,
//     });
//   }
//   return sanitized;
// }

// exports.createOrder = async (req, res) => {
//   try {
//     const { tableNo: tableNoRaw, items: clientItems, adult, Barn1, Barn2 } = req.body;

//     const tableNo = Number(tableNoRaw);
//     if (!tableNo || !tableSet.has(tableNo)) {
//       return res.status(400).json({ message: "Invalid or missing table number" });
//     }

//     const items = sanitizeItems(clientItems);
//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ message: "No valid items in order" });
//     }

//     // totals
//     const total = toMoney(items.reduce((sum, item) => sum + item.price * item.qty, 0));

//     const SERVICE_TAX_RATE = process.env.SERVICE_TAX_RATE
//       ? Number(process.env.SERVICE_TAX_RATE)
//       : 0.05; // 5%
//     const GST_RATE = process.env.GST_RATE
//       ? Number(process.env.GST_RATE)
//       : 0.12; // 12%

//     const serviceTax = toMoney(total * SERVICE_TAX_RATE);
//     const GST = toMoney(total * GST_RATE);
//     const payable = toMoney(total + serviceTax + GST);

//     const order = await Order.create({
//       tableNo,
//       items,
//       total,
//       serviceTax,
//       GST,
//       payable,
//       adult: Number(adult || 0),
//       Barn1: Number(Barn1 || 0),
//       Barn2: Number(Barn2 || 0),
//     });

//     return res.status(201).json({ success: true, order });
//   } catch (err) {
//     console.error("Error creating order:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.getAllOrders = async (_req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     return res.json({ success: true, orders });
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.getOrdersByTable = async (req, res) => {
//   try {
//     const tableNo = Number(req.params.tableNo);
//     if (!tableNo || !tableSet.has(tableNo)) {
//       return res.status(400).json({ message: "Invalid table number" });
//     }
//     const orders = await Order.find({ tableNo }).sort({ createdAt: -1 });
//     return res.json({ success: true, orders });
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };



///////////

// server/controller/orderController.js
const Order = require("../model/orderModel");
const menu = require("../data/menu.json");
const tables = require("../data/tables.json");

// ------- Fast menu lookup: { [id:number]: { id, name, price } }
const menuIndex = (() => {
  const idx = Object.create(null);
  for (const section of menu) {
    for (const it of section.items) {
      const id = Number(it.id);
      idx[id] = { id, name: it.name, price: Number(it.price ?? 0) };
    }
  }
  return idx;
})();

const tableSet = new Set(tables.map(Number));

// ------- helpers
const toMoney = (n) => Math.round((Number(n) || 0) * 100) / 100;
const toQty = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};
const toNonNegInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
};

function sanitizeItems(clientItems = []) {
  const out = [];
  for (const raw of clientItems) {
    const id = Number(raw.id);
    const found = menuIndex[id];
    if (!found) continue;
    const qty = toQty(raw.qty);
    out.push({
      id: String(found.id),           // store id as string consistently
      name: found.name,
      price: toMoney(found.price),
      qty,
    });
  }
  return out;
}

// Normalize any existing stored items (defensive for legacy rows)
function normalizeStoredItems(items = []) {
  return (items || []).map((it) => {
    const key = String(it.id);
    const canonical = menuIndex[Number(key)] || {};
    return {
      id: key,
      name: canonical.name ?? it.name,
      price: toMoney(canonical.price ?? it.price ?? 0),
      qty: toQty(it.qty),
    };
  });
}

function mergeItems(existing = [], incoming = []) {
  const map = new Map();

  // seed with normalized existing
  for (const it of normalizeStoredItems(existing)) {
    const key = String(it.id);
    map.set(key, { ...it });
  }

  // add incoming (coerce + sum)
  for (const itRaw of incoming) {
    const key = String(itRaw.id);
    const it = {
      id: key,
      name: itRaw.name,
      price: toMoney(itRaw.price),
      qty: toQty(itRaw.qty),
    };
    const prev = map.get(key);
    if (prev) {
      map.set(key, { ...prev, qty: toQty(prev.qty) + toQty(it.qty) });
    } else {
      map.set(key, { ...it });
    }
  }

  // ensure final server truth
  return Array.from(map.values()).map((it) => {
    const canonical = menuIndex[Number(it.id)] || {};
    return {
      id: String(it.id),
      name: canonical.name ?? it.name,
      price: toMoney(canonical.price ?? it.price ?? 0),
      qty: toQty(it.qty),
    };
  });
}

function computeTotals(items) {
  const total = toMoney(items.reduce((sum, item) => sum + item.price * item.qty, 0));
  const SERVICE_TAX_RATE = process.env.SERVICE_TAX_RATE ? Number(process.env.SERVICE_TAX_RATE) : 0.05; // 5%
  const GST_RATE = process.env.GST_RATE ? Number(process.env.GST_RATE) : 0.12; // 12%
  const serviceTax = toMoney(total * SERVICE_TAX_RATE);
  const GST = toMoney(total * GST_RATE);
  const payable = toMoney(total + serviceTax + GST);
  return { total, serviceTax, GST, payable };
}

// ============ UPSERT ORDER (status: "placed") ============
exports.upsertOrder = async (req, res) => {
  try {
    const { tableNo: tableNoRaw, items: clientItems, adult, Barn1, Barn2 } = req.body;

    const tableNo = Number(tableNoRaw);
    if (!tableNo || !tableSet.has(tableNo)) {
      return res.status(400).json({ message: "Invalid or missing table number" });
    }

    const incomingItems = sanitizeItems(clientItems);
    if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
      return res.status(400).json({ message: "No valid items in order" });
    }

    // try to find an existing open order
    let order = await Order.findOne({ tableNo, status: "placed" }).sort({ createdAt: -1 });

    if (!order) {
      const items = normalizeStoredItems(incomingItems);
      const totals = computeTotals(items);
      order = await Order.create({
        tableNo,
        items,
        ...totals,
        adult: toNonNegInt(adult),
        Barn1: toNonNegInt(Barn1),
        Barn2: toNonNegInt(Barn2),
        status: "placed",
      });
      return res.status(201).json({ success: true, order, mode: "created" });
    }

    // Merge incoming into existing open order
    const mergedItems = mergeItems(order.items, incomingItems);
    const totals = computeTotals(mergedItems);

    // Overwrite people counts with provided values if present; else keep
    const nextAdult = typeof adult !== "undefined" ? toNonNegInt(adult) : toNonNegInt(order.adult);
    const nextBarn1 = typeof Barn1 !== "undefined" ? toNonNegInt(Barn1) : toNonNegInt(order.Barn1);
    const nextBarn2 = typeof Barn2 !== "undefined" ? toNonNegInt(Barn2) : toNonNegInt(order.Barn2);

    order.items = mergedItems;
    order.total = totals.total;
    order.serviceTax = totals.serviceTax;
    order.GST = totals.GST;
    order.payable = totals.payable;
    order.adult = nextAdult;
    order.Barn1 = nextBarn1;
    order.Barn2 = nextBarn2;

    await order.save();

    return res.status(200).json({ success: true, order, mode: "updated" });
  } catch (err) {
    console.error("Error upserting order:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============ COMPLETE ORDER ============
exports.completeOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId ? String(req.body.orderId) : null;
    const tableNo = req.body.tableNo != null ? Number(req.body.tableNo) : null;

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.status === "completed") {
        return res.json({ success: true, order }); // already complete
      }
    } else {
      if (!tableNo) return res.status(400).json({ message: "orderId or tableNo required" });
      order = await Order.findOne({ tableNo, status: "placed" }).sort({ createdAt: -1 });
      if (!order) return res.status(404).json({ message: "No open order to complete for this table" });
    }

    order.status = "completed";
    await order.save();
    return res.json({ success: true, order });
  } catch (err) {
    console.error("Error completing order:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ============ REOPEN ORDER (set status back to 'placed') ============
exports.reopenOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId ? String(req.body.orderId) : null;
    const tableNo = req.body.tableNo != null ? Number(req.body.tableNo) : null;

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
    } else {
      if (!tableNo) return res.status(400).json({ message: "orderId or tableNo required" });
      // reopen the latest completed order for this table
      order = await Order.findOne({ tableNo, status: "completed" }).sort({ createdAt: -1 });
      if (!order) return res.status(404).json({ message: "No completed order to reopen for this table" });
    }

    order.status = "placed";
    await order.save();
    return res.json({ success: true, order });
  } catch (err) {
    console.error("Error reopening order:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============ READS ============
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
