const express = require("express");
const cors = require("cors");
const connectMongo = require("./config/mongodb");
const {
  createOrder,
  getAllOrders,
  getOrdersByTable,
} = require("./controller/orderController");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
connectMongo();

// Routes
app.post("/api/orders", createOrder);
app.get("/api/orders", getAllOrders);
app.get("/api/orders/:tableNo", getOrdersByTable);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
