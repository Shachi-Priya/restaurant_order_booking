import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';

export default function MenuAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItem, setNewItem] = useState({
    categoryId: null,
    name: '',
    image: '',
    imagePreview: '',
    imageFile: null,
    price: 0,
  });
  const [showAddItem, setShowAddItem] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menuHandler');
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.success) {
          setCategories(data.categories || []);
        } else {
          showMessage(data.message || 'Failed to load menu', 'error');
        }
      } catch {
        console.error('API returned non-JSON:', text.substring(0, 200));
        showMessage('Server not ready. Please wait and refresh.', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      showMessage('Network error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Upload image to Supabase
  const uploadImage = async (file) => {
    if (!file) return null;

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const res = await fetch('/api/uploadImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64Data,
          fileName: file.name,
          contentType: file.type,
        }),
      });

      const data = await res.json();
      if (data.success) {
        return data.url;
      } else {
        showMessage('Upload failed: ' + data.message, 'error');
        return null;
      }
    } catch (err) {
      showMessage('Upload error: ' + err.message, 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection for new item
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNewItem({ ...newItem, imageFile: file, imagePreview: previewUrl });
    }
  };

  // Handle file selection for editing item
  const handleEditFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setEditImageFile(file);
      setEditImagePreview(previewUrl);
    }
  };

  // Add category
  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/menuHandler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('Category added!');
        setNewCategoryName('');
        fetchMenu();
      } else {
        showMessage(data.message || 'Failed', 'error');
      }
    } catch (err) {
      showMessage('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Update category
  const updateCategory = async (categoryId, name) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/menuHandler?categoryId=${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('Category updated!');
        setEditingCategory(null);
        fetchMenu();
      } else {
        showMessage(data.message || 'Failed', 'error');
      }
    } catch (err) {
      showMessage('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const deleteCategory = async (categoryId) => {
    if (!confirm('Delete this category and ALL its items?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/menuHandler?categoryId=${categoryId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showMessage('Category deleted!');
        fetchMenu();
      } else {
        showMessage(data.message || 'Failed', 'error');
      }
    } catch (err) {
      showMessage('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add item with image upload
  const addItem = async (categoryId) => {
    if (!newItem.name.trim()) return;
    setSaving(true);
    try {
      // Upload image first if file is selected
      let imageUrl = newItem.image.trim() || '/menu/default.jpg';
      if (newItem.imageFile) {
        const uploadedUrl = await uploadImage(newItem.imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const res = await fetch(
        `/api/menuHandler?categoryId=${categoryId}&items=true`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newItem.name.trim(),
            image: imageUrl,
            price: parseFloat(newItem.price) || 0,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        showMessage('Item added successfully!');
        setNewItem({
          categoryId: null,
          name: '',
          image: '',
          imagePreview: '',
          imageFile: null,
          price: 0,
        });
        setShowAddItem(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchMenu();
      } else {
        showMessage(data.message || 'Failed', 'error');
      }
    } catch (err) {
      showMessage('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Update item with image upload
  const updateItem = async (
    categoryId,
    itemId,
    updates,
    hasNewImage = false,
  ) => {
    setSaving(true);
    try {
      // Upload new image if file is selected
      if (hasNewImage && editImageFile) {
        const uploadedUrl = await uploadImage(editImageFile);
        if (uploadedUrl) {
          updates.image = uploadedUrl;
        }
      }

      const res = await fetch(
        `/api/menuHandler?categoryId=${categoryId}&itemId=${itemId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        },
      );
      const data = await res.json();
      if (data.success) {
        showMessage('Item updated!');
        setEditingItem(null);
        setEditImageFile(null);
        setEditImagePreview('');
        fetchMenu();
      } else {
        showMessage(data.message || 'Failed', 'error');
      }
    } catch (err) {
      showMessage('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete item
  const deleteItem = async (categoryId, itemId) => {
    if (!confirm('Delete this item?')) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/menuHandler?categoryId=${categoryId}&itemId=${itemId}`,
        {
          method: 'DELETE',
        },
      );
      const data = await res.json();
      if (data.success) {
        showMessage('Item deleted!');
        fetchMenu();
      } else {
        showMessage(data.message || 'Failed', 'error');
      }
    } catch (err) {
      showMessage('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a3a2e] to-[#152b23] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto mb-4" />
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Menu Admin | Restaurant</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#1a3a2e] via-[#1d3f32] to-[#152b23] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Menu Admin
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Manage categories & items
            </p>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`mb-4 p-3 rounded-lg ${message.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-green-500/20 text-green-200 border border-green-500/30'}`}
            >
              {message.text}
            </div>
          )}

          {/* Add Category */}
          <div className="premium-card p-4 mb-6">
            <h2 className="text-lg font-bold text-amber-200 mb-3">
              Add New Category
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="flex-1 bg-[#0f1f1a] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-amber-500/50 focus:outline-none"
              />
              <button
                onClick={addCategory}
                disabled={saving || !newCategoryName.trim()}
                className="btn-premium px-6 py-2 rounded-lg disabled:opacity-50"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-6">
            {categories.length === 0 ? (
              <div className="premium-card p-8 text-center">
                <p className="text-white/60 mb-4">
                  No categories yet. Add one above or seed from JSON.
                </p>
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat._id} className="premium-card overflow-hidden">
                  {/* Category Header */}
                  <div className="bg-[#0f1f1a] p-4 flex items-center justify-between border-b border-white/10">
                    {editingCategory === cat._id ? (
                      <input
                        type="text"
                        defaultValue={cat.name}
                        autoFocus
                        onBlur={(e) => {
                          if (e.target.value.trim() !== cat.name) {
                            updateCategory(cat._id, e.target.value.trim());
                          } else {
                            setEditingCategory(null);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur();
                          } else if (e.key === 'Escape') {
                            setEditingCategory(null);
                          }
                        }}
                        className="bg-transparent border-b border-amber-500 text-xl font-bold text-white focus:outline-none"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-white">
                        {cat.name}
                      </h3>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCategory(cat._id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                        title="Edit category name"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteCategory(cat._id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                        title="Delete category"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() =>
                          setShowAddItem(
                            showAddItem === cat._id ? null : cat._id,
                          )
                        }
                        className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-200 text-sm hover:bg-amber-500/30 transition"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>

                  {/* Add Item Form */}
                  {showAddItem === cat._id && (
                    <div className="p-4 bg-[#152b23] border-b border-white/10">
                      <div className="flex gap-4">
                        {/* Image Upload Section */}
                        <div className="flex-shrink-0">
                          <div
                            className="w-24 h-24 rounded-lg border-2 border-dashed border-white/20 bg-[#0f1f1a] flex items-center justify-center cursor-pointer hover:border-amber-500/50 transition overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {newItem.imagePreview ? (
                              <img
                                src={newItem.imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <span className="text-2xl">📷</span>
                                <p className="text-[10px] text-white/40 mt-1">
                                  Click to upload
                                </p>
                              </div>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Food item name *"
                            value={newItem.name}
                            onChange={(e) =>
                              setNewItem({ ...newItem, name: e.target.value })
                            }
                            className="w-full bg-[#0f1f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:border-amber-500/50 focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Or paste image URL"
                              value={newItem.image}
                              onChange={(e) =>
                                setNewItem({
                                  ...newItem,
                                  image: e.target.value,
                                  imageFile: null,
                                  imagePreview: '',
                                })
                              }
                              className="flex-1 bg-[#0f1f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:border-amber-500/50 focus:outline-none text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Price"
                              value={newItem.price}
                              onChange={(e) =>
                                setNewItem({
                                  ...newItem,
                                  price: e.target.value,
                                })
                              }
                              className="w-20 bg-[#0f1f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:border-amber-500/50 focus:outline-none text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => addItem(cat._id)}
                              disabled={
                                saving || uploading || !newItem.name.trim()
                              }
                              className="btn-premium px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                            >
                              {uploading ? (
                                <>
                                  <span className="spinner h-4 w-4" />
                                  Uploading...
                                </>
                              ) : saving ? (
                                'Saving...'
                              ) : (
                                '+ Add Item'
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setShowAddItem(null);
                                setNewItem({
                                  categoryId: null,
                                  name: '',
                                  image: '',
                                  imagePreview: '',
                                  imageFile: null,
                                  price: 0,
                                });
                              }}
                              className="px-4 py-2 bg-white/10 rounded-lg text-white/60 hover:bg-white/20 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items Grid */}
                  <div className="p-4">
                    {cat.items.length === 0 ? (
                      <p className="text-white/40 text-center py-4">
                        No items in this category
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {cat.items.map((item) => (
                          <div
                            key={item._id}
                            className="bg-[#1a2f28] border border-white/10 rounded-xl overflow-hidden group"
                          >
                            {/* Item Image */}
                            <div className="relative h-24 sm:h-28 bg-[#0f1f1a] overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.image || '/menu/default.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/menu/default.jpg';
                                }}
                              />
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setEditingItem(item._id)}
                                  className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => deleteItem(cat._id, item._id)}
                                  className="p-2 bg-red-500/30 rounded-full hover:bg-red-500/50"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            {/* Item Info */}
                            <div className="p-2">
                              {editingItem === item._id ? (
                                <div className="space-y-2">
                                  {/* Edit Image Upload */}
                                  <div
                                    className="w-full h-16 rounded border border-dashed border-white/20 bg-[#0f1f1a] flex items-center justify-center cursor-pointer hover:border-amber-500/50 transition overflow-hidden"
                                    onClick={() =>
                                      editFileInputRef.current?.click()
                                    }
                                  >
                                    {editImagePreview ? (
                                      <img
                                        src={editImagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-xs text-white/40">
                                        📷 New photo
                                      </span>
                                    )}
                                  </div>
                                  <input
                                    ref={editFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditFileSelect}
                                    className="hidden"
                                  />
                                  <input
                                    type="text"
                                    defaultValue={item.name}
                                    placeholder="Name"
                                    className="w-full bg-[#0f1f1a] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                    id={`edit-name-${item._id}`}
                                  />
                                  <input
                                    type="text"
                                    defaultValue={item.image}
                                    placeholder="Image URL"
                                    className="w-full bg-[#0f1f1a] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                    id={`edit-image-${item._id}`}
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => {
                                        const name = document.getElementById(
                                          `edit-name-${item._id}`,
                                        ).value;
                                        const image = document.getElementById(
                                          `edit-image-${item._id}`,
                                        ).value;
                                        updateItem(
                                          cat._id,
                                          item._id,
                                          { name, image },
                                          !!editImageFile,
                                        );
                                      }}
                                      disabled={saving || uploading}
                                      className="flex-1 bg-green-500/30 text-green-200 rounded py-1 text-xs hover:bg-green-500/40 disabled:opacity-50"
                                    >
                                      {uploading ? '...' : 'Save'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingItem(null);
                                        setEditImageFile(null);
                                        setEditImagePreview('');
                                      }}
                                      className="flex-1 bg-white/10 text-white/60 rounded py-1 text-xs hover:bg-white/20"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p
                                  className="text-white text-xs font-medium truncate"
                                  title={item.name}
                                >
                                  {item.name}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-white/40 text-sm">
            <p>
              Total: {categories.length} categories,{' '}
              {categories.reduce((n, c) => n + c.items.length, 0)} items
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #fbbf24;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
