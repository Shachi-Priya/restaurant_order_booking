const express = require("express");
const cors = require("cors");
const connectMongo = require("./config/mongodb");
const {
  upsertOrder,
  completeOrder,
  reopenOrder,
  getAllOrders,
  getOrdersByTable,
  deleteOrderById
} = require("./controller/orderController");

const app = express();
const PORT = process.env.PORT || 8000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Connect to MongoDB ----------
connectMongo();

// ---------- Routes ----------

// Create or update ongoing ("placed") buffet order
app.post("/api/orders", upsertOrder);
// Mark ongoing order as "completed"
app.post("/api/orders/complete", completeOrder);
// mark "placed" again
app.post("/api/orders/reopen", reopenOrder);          
// Fetch all orders (support view)
app.get("/api/orders", getAllOrders);
// Fetch orders by table number
app.get("/api/orders/:tableNo", getOrdersByTable);
// NEW: delete by id
app.delete("/api/orders/:orderId", deleteOrderById);


// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
