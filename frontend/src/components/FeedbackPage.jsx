import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { feedbackAPI } from '../utils/api';

const initialForm = {
  orderId: '',
  productId: '',
  rating: '5',
  comment: ''
};

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [customerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrderOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchProductId, setSearchProductId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editData, setEditData] = useState({ rating: '5', comment: '' });

  const loadFeedback = useCallback(async (orderId = '', productId = '') => {
    setLoading(true);
    clearAlerts();
    try {
      const params = {};
      if (orderId) params.orderId = orderId;
      if (productId) params.productId = productId;
      const response = await feedbackAPI.listMine(params);
      const feedbackItems = response.data?.data?.feedback || [];
      setItems(feedbackItems);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [clearAlerts]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');

    if (!token || !rawUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(rawUser);
    if (parsedUser.role !== 'customer') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    loadFeedback();
  }, [navigate, loadFeedback]);

  const ratingSummary = useMemo(() => {
    if (!items.length) return 'No ratings yet';
    const total = items.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return `Average rating: ${(total / items.length).toFixed(1)} / 5`;
  }, [items]);

  const clearAlerts = () => {
    setError('');
    setMessage('');
  };

  const orderOptions = useMemo(
    () => customerOrders.filter((order) => order?.orderId),
    [customerOrders]
  );

  const productOptionsByOrder = useMemo(() => {
    const productMap = new Map();

    customerOrders.forEach((order) => {
      const uniqueProducts = new Map();
      (order.items || []).forEach((item) => {
        if (!item?.productId) return;
        if (!uniqueProducts.has(item.productId)) {
          uniqueProducts.set(item.productId, {
            productId: item.productId,
            productName: item.productName || item.productId
          });
        }
      });

      if (order?.orderId) {
        productMap.set(order.orderId, Array.from(uniqueProducts.values()));
      }
    });

    return productMap;
  }, [customerOrders]);

  const submitProductOptions = useMemo(() => {
    if (!formData.orderId) return [];
    return productOptionsByOrder.get(formData.orderId) || [];
  }, [formData.orderId, productOptionsByOrder]);

  const searchProductOptions = useMemo(() => {
    if (searchOrderId) {
      return productOptionsByOrder.get(searchOrderId) || [];
    }

    const uniqueProducts = new Map();
    productOptionsByOrder.forEach((products) => {
      products.forEach((product) => {
        if (!uniqueProducts.has(product.productId)) {
          uniqueProducts.set(product.productId, product);
        }
      });
    });

    return Array.from(uniqueProducts.values());
  }, [searchOrderId, productOptionsByOrder]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    clearAlerts();

    try {
      await feedbackAPI.create({
        orderId: formData.orderId.trim(),
        productId: formData.productId.trim(),
        rating: Number(formData.rating),
        comment: formData.comment.trim()
      });

      setMessage('Feedback submitted successfully.');
      setFormData(initialForm);
      await loadFeedback(searchOrderId.trim(), searchProductId.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditData({
      rating: String(item.rating || 5),
      comment: item.comment || ''
    });
    clearAlerts();
  };

  const cancelEdit = () => {
    setEditingId('');
    setEditData({ rating: '5', comment: '' });
  };

  const submitEdit = async (feedbackId) => {
    clearAlerts();
    try {
      await feedbackAPI.update(feedbackId, {
        rating: Number(editData.rating),
        comment: editData.comment.trim()
      });
      setMessage('Feedback updated successfully.');
      cancelEdit();
      await loadFeedback(searchOrderId.trim(), searchProductId.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update feedback');
    }
  };

  const handleDelete = async (feedbackId) => {
    const confirmed = window.confirm('Delete this feedback?');
    if (!confirmed) return;

    clearAlerts();
    try {
      await feedbackAPI.remove(feedbackId);
      setMessage('Feedback deleted successfully.');
      await loadFeedback(searchOrderId.trim(), searchProductId.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete feedback');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadFeedback(searchOrderId, searchProductId);
  };

  const handleResetSearch = async () => {
    setSearchOrderId('');
    setSearchProductId('');
    await loadFeedback('', '');
  };

  const handleOrderSelectChange = (orderId) => {
    setFormData((prev) => ({ ...prev, orderId, productId: '' }));
  };

  const handleSearchOrderChange = (orderId) => {
    setSearchOrderId(orderId);
    setSearchProductId('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50">
      <nav className="bg-white/85 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-slate-800">
              Book<span className="text-cyan-700">Nest</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/customer-dashboard"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Dashboard
              </Link>
              <span className="text-sm text-slate-600">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-black text-white text-sm px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h1 className="text-3xl font-bold text-slate-900">My Feedback</h1>
          <p className="text-slate-600 mt-2">Create and manage feedback for each product in your completed orders.</p>
          <p className="text-sm text-cyan-700 font-semibold mt-2">{ratingSummary}</p>
        </section>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Submit Feedback</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-slate-700 mb-1">
                  Order ID
                </label>
                <select
                  id="orderId"
                  value={formData.orderId}
                  onChange={(e) => handleOrderSelectChange(e.target.value)}
                  required
                  disabled={loadingOrderOptions || orderOptions.length === 0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                >
                  <option value="">
                    {loadingOrderOptions
                      ? 'Loading your orders...'
                      : orderOptions.length
                        ? 'Select an order'
                        : 'No orders available'}
                  </option>
                  {orderOptions.map((order) => (
                    <option key={order._id || order.orderId} value={order.orderId}>
                      {order.orderId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="productId" className="block text-sm font-medium text-slate-700 mb-1">
                  Product ID (Optional)
                </label>
                <select
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, productId: e.target.value }))}
                  disabled={!formData.orderId || submitProductOptions.length === 0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                >
                  <option value="">Order-level feedback (no product selected)</option>
                  {submitProductOptions.map((product) => (
                    <option key={product.productId} value={product.productId}>
                      {product.productName} ({product.productId})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Add Product ID for product-level feedback. Leave empty to add feedback for the full order.
                </p>
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-slate-700 mb-1">
                  Rating
                </label>
                <select
                  id="rating"
                  value={formData.rating}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very Poor</option>
                </select>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-1">
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  maxLength={1000}
                  value={formData.comment}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  placeholder="Share your order experience"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-700 hover:bg-cyan-800 disabled:bg-cyan-400 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </section>

          <section className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-slate-900">Feedback History</h2>
              <form onSubmit={handleSearch} className="flex gap-2">
                <select
                  value={searchOrderId}
                  onChange={(e) => handleSearchOrderChange(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                >
                  <option value="">All orders</option>
                  {orderOptions.map((order) => (
                    <option key={`search-${order._id || order.orderId}`} value={order.orderId}>
                      {order.orderId}
                    </option>
                  ))}
                </select>
                <select
                  value={searchProductId}
                  onChange={(e) => setSearchProductId(e.target.value)}
                  disabled={searchProductOptions.length === 0}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                >
                  <option value="">All products</option>
                  {searchProductOptions.map((product) => (
                    <option key={`search-${product.productId}`} value={product.productId}>
                      {product.productName} ({product.productId})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-semibold"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold"
                >
                  Reset
                </button>
              </form>
            </div>

            {loading ? (
              <div className="text-slate-600">Loading feedback...</div>
            ) : items.length === 0 ? (
              <div className="text-slate-600 border border-dashed border-slate-300 rounded-xl p-6 text-center">
                No feedback found. Submit your first feedback using the form.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <article key={item._id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">Order</p>
                        <p className="font-semibold text-slate-900">{item.orderId}</p>
                        <p className="text-sm text-slate-500 mt-1">Product</p>
                        <p className="font-semibold text-slate-900">{item.productName || item.productId}</p>
                        <p className="text-xs text-slate-500">{item.productId}</p>
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {editingId === item._id ? (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <select
                            value={editData.rating}
                            onChange={(e) => setEditData((prev) => ({ ...prev, rating: e.target.value }))}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                          >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Very Poor</option>
                          </select>
                          <div className="text-sm text-slate-500 self-center">Update your rating and comment</div>
                        </div>
                        <textarea
                          rows="3"
                          maxLength={1000}
                          value={editData.comment}
                          onChange={(e) => setEditData((prev) => ({ ...prev, comment: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => submitEdit(item._id)}
                            className="bg-cyan-700 hover:bg-cyan-800 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-3 text-sm text-slate-600">Rating: {item.rating}/5</p>
                        <p className="mt-2 text-slate-800">{item.comment || 'No comment provided.'}</p>
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="bg-slate-800 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}