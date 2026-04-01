const express = require('express');
const cors = require('cors');
const connectMongo = require('./config/mongodb');

// Prevent unhandled rejections from crashing the process on Render
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection (kept alive):', err?.message || err);
});
const {
  upsertOrder,
  completeOrder,
  reopenOrder,
  getAllOrders,
  getOrdersByTable,
  deleteOrderById,
} = require('./controller/orderController');

const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedMenu,
} = require('./controller/menuController');

const app = express();
const PORT = process.env.PORT || 8000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Ensure MongoDB is connected before handling requests ----------
app.use(async (_req, res, next) => {
  try {
    await connectMongo();
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    res
      .status(503)
      .json({ message: 'Database unavailable, please try again shortly' });
  }
});

// ---------- Routes ----------

// Create or update ongoing ("placed") buffet order
app.post('/api/orders', upsertOrder);
// Mark ongoing order as "completed"
app.post('/api/orders/complete', completeOrder);
// mark "placed" again
app.post('/api/orders/reopen', reopenOrder);
// Fetch all orders (support view)
app.get('/api/orders', getAllOrders);
// Fetch orders by table number
app.get('/api/orders/:tableNo', getOrdersByTable);
// NEW: delete by id
app.delete('/api/orders/:orderId', deleteOrderById);

// ---------- Menu Routes ----------
// Get all categories with items
app.get('/api/menu', getAllCategories);
// Create category
app.post('/api/menu/categories', createCategory);
// Update category
app.put('/api/menu/categories/:categoryId', updateCategory);
// Delete category
app.delete('/api/menu/categories/:categoryId', deleteCategory);
// Add item to category
app.post('/api/menu/categories/:categoryId/items', addMenuItem);
// Update item
app.put('/api/menu/categories/:categoryId/items/:itemId', updateMenuItem);
// Delete item
app.delete('/api/menu/categories/:categoryId/items/:itemId', deleteMenuItem);
// Seed menu from JSON
app.post('/api/menu/seed', seedMenu);

// Reorder categories
const { reorderCategories } = require('./controller/menuController');
app.put('/api/menu/reorder', reorderCategories);

// ---------- Start server ----------
// Initial connection (non-blocking — server starts even if DB is temporarily down)
connectMongo()
  .then(() => console.log('MongoDB connected'))
  .catch((err) =>
    console.error(
      'Initial MongoDB connection failed (will retry on requests):',
      err.message,
    ),
  );

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
