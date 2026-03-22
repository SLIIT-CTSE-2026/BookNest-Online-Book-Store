import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    items: [{ productId: '', quantity: 1 }],
    shippingAddress: '',
    paymentMethod: 'card',
    notes: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Pre-fill customer information if user is a customer
    if (parsedUser.role === 'customer') {
      setFormData(prev => ({
        ...prev,
        customerId: parsedUser.userId,
        customerName: parsedUser.name,
        customerEmail: parsedUser.email
      }));
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    const loadProducts = async () => {
      try {
        const res = await api.get('/products');
        if (cancelled) return;
        if (res.data?.success) {
          setCatalog(res.data.products || []);
          setCatalogError(null);
        } else {
          setCatalogError(res.data?.message || 'Product list request did not succeed.');
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading products:', err);
          const detail =
            err.response?.data?.message ||
            (err.response?.status
              ? `HTTP ${err.response.status}`
              : err.message);
          setCatalogError(
            `Could not load products (${detail}). If you use MongoDB Atlas, allow your current IP in Network Access and confirm MONGO_URI in the product service.`
          );
        }
      }
    };
    loadProducts();
    return () => { cancelled = true; };
  }, []);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      alert('Order must have at least one item');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => ({
        ...item,
        ...(i === index ? {
          [field]: field === 'quantity' ? Math.max(1, parseInt(value, 10) || 1) : value
        } : {})
      }))
    }));
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.customerId || !formData.customerName || !formData.customerEmail) {
      alert('Customer information is required');
      return;
    }

    if (!formData.shippingAddress) {
      alert('Shipping address is required');
      return;
    }

    const validItems = formData.items.filter(
      (item) => item.productId && item.quantity > 0
    );
    if (validItems.length === 0) {
      alert('Add at least one product with a quantity of at least 1.');
      return;
    }

    for (const item of validItems) {
      const p = catalog.find((x) => String(x._id) === String(item.productId));
      if (p && Number(p.stock) < item.quantity) {
        alert(`Not enough stock for "${p.title}". Available: ${p.stock}`);
        return;
      }
    }

    try {
      setLoading(true);
      
      const orderData = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        items: validItems.map(({ productId, quantity }) => ({ productId, quantity })),
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        alert('Order created successfully!');
        navigate(`/order-details/${response.data.data.orderId}`);
      }
    } catch (err) {
      console.error('Error creating order:', err);
      alert(err.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const productById = (id) => catalog.find((p) => String(p._id) === String(id));

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const p = productById(item.productId);
      if (!p) return total;
      return total + p.price * item.quantity;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Book<span className="text-indigo-600">Nest</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/orders')}
                className="text-gray-700 hover:text-indigo-600 transition duration-300"
              >
                ← Back to Orders
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create New Order</h2>
            <p className="text-gray-600 mt-2">Fill in the details to place your order</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer ID *
                  </label>
                  <input
                    type="text"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter customer ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter customer email"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              {catalogError && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                  {catalogError}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-4">
                Choose books from the catalog. The order service loads title and price from the product service when you place the order.
              </p>

              {formData.items.map((item, index) => {
                const selected = productById(item.productId);
                const subtotal = selected ? selected.price * item.quantity : 0;
                return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product *
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select a book</option>
                        {catalog.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.title} — ${Number(p.price).toFixed(2)}
                            {Number.isFinite(Number(p.stock)) ? ` (stock: ${p.stock})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-3 flex flex-wrap items-end gap-4 text-sm text-gray-600">
                      {selected ? (
                        <>
                          <span>
                            Unit price:{' '}
                            <span className="font-semibold text-gray-900">
                              ${Number(selected.price).toFixed(2)}
                            </span>
                          </span>
                          <span>
                            Subtotal:{' '}
                            <span className="font-semibold text-gray-900">
                              ${subtotal.toFixed(2)}
                            </span>
                          </span>
                        </>
                      ) : (
                        <span>Select a product to see pricing.</span>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition duration-300"
              >
                + Add Another Item
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping & Payment</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address *
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter complete shipping address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    maxLength="500"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Any special instructions for your order..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.notes.length}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/customer-dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition duration-300"
              >
                {loading ? 'Creating Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
