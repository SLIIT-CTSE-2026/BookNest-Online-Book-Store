import { useState } from 'react';
import api from '../utils/api';

export default function OrderEditDetailsForm({ order, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    shippingAddress: order?.shippingAddress || '',
    notes: order?.notes || '',
    items: order?.items ? JSON.parse(JSON.stringify(order.items)) : []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if order can be edited by customer
  const canEdit = order?.status === 'pending';

  if (!canEdit) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Order Cannot Be Edited
          </h3>
          <p className="text-gray-600 mb-4">
            This order has already been {order?.status} and can no longer be edited online.
          </p>
          <p className="text-sm text-gray-500">
            Please contact customer support if you need to make changes to this order.
          </p>
          <button
            onClick={onCancel}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemQuantityChange = (index, newQuantity) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: Math.max(1, parseInt(newQuantity) || 1)
    };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      alert('Cannot remove the last item. Please contact support to cancel the order.');
      return;
    }
    
    if (window.confirm('Are you sure you want to remove this item from the order?')) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.shippingAddress || formData.shippingAddress.trim().length === 0) {
      setError('Shipping address is required');
      return;
    }

    if (formData.items.length === 0) {
      setError('Order must have at least one item');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        shippingAddress: formData.shippingAddress.trim(),
        notes: formData.notes,
        items: formData.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        }))
      };

      console.log('Updating order:', order.orderId, updateData);
      
      const response = await api.put(`/orders/${order.orderId}`, updateData);
      
      if (response.data.success) {
        setSuccess('Order updated successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess(response.data.data);
        }, 1000);
      } else {
        setError(response.data.message || 'Failed to update order');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update order. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (!order) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Order Details</h3>
      <p className="text-sm text-gray-600 mb-4">
        You can update your shipping address, order notes, and item quantities. 
        Note: Some changes may require seller approval.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipping Address */}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your complete shipping address"
          />
        </div>

        {/* Order Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Order Items
          </label>
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                    <p className="text-sm text-gray-600">Product ID: {item.productId}</p>
                    <p className="text-sm text-gray-600">Price: ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                      />
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center bg-indigo-50 px-4 py-3 rounded-lg">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-indigo-600">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Order Notes */}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Any special instructions or delivery notes..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximum 500 characters. {formData.notes.length}/500
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-md transition duration-300 disabled:opacity-50 font-medium"
          >
            {loading ? 'Saving Changes...' : '💾 Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2.5 px-4 rounded-md transition duration-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
