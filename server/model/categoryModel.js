const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, default: '/menu/default.jpg' },
    price: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    items: [MenuItemSchema],
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Category || mongoose.model('Category', CategorySchema);
