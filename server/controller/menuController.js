const Category = require('../model/categoryModel');

// Get all categories with items
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, order } = req.body;
    if (!name)
      return res.status(400).json({ success: false, message: 'Name required' });

    const count = await Category.countDocuments();
    const category = await Category.create({
      name,
      order: order ?? count,
      items: [],
    });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update category name/order
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, order } = req.body;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { ...(name && { name }), ...(order !== undefined && { order }) },
      { new: true },
    );
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });

    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });

    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add item to category
const addMenuItem = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, image, price } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: 'Item name required' });

    const category = await Category.findById(categoryId);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });

    const newItem = {
      name,
      image: image || '/menu/default.jpg',
      price: price || 0,
      order: category.items.length,
    };
    category.items.push(newItem);
    await category.save();

    res
      .status(201)
      .json({
        success: true,
        item: category.items[category.items.length - 1],
        category,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;
    const { name, image, price, order } = req.body;

    const category = await Category.findById(categoryId);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });

    const item = category.items.id(itemId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: 'Item not found' });

    if (name !== undefined) item.name = name;
    if (image !== undefined) item.image = image;
    if (price !== undefined) item.price = price;
    if (order !== undefined) item.order = order;

    await category.save();
    res.json({ success: true, item, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });

    const item = category.items.id(itemId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: 'Item not found' });

    category.items.pull(itemId);
    await category.save();

    res.json({ success: true, message: 'Item deleted', category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Seed initial menu from JSON (one-time migration)
const seedMenu = async (req, res) => {
  try {
    const { categories } = req.body;
    if (!categories || !Array.isArray(categories)) {
      return res
        .status(400)
        .json({ success: false, message: 'Categories array required' });
    }

    // Clear existing menu
    await Category.deleteMany({});

    // Insert new categories
    const docs = categories.map((cat, i) => ({
      name: cat.category,
      order: i,
      items: (cat.items || []).map((item, j) => ({
        name: item.name,
        image: item.image || `/menu/${item.id}.jpg`,
        price: item.price || 0,
        order: j,
      })),
    }));

    const result = await Category.insertMany(docs);
    res.json({
      success: true,
      message: `Seeded ${result.length} categories`,
      categories: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedMenu,
};
