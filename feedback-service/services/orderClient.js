import axios from 'axios';

const normalizeOrderServiceBase = () => {
  let base = (process.env.ORDER_SERVICE_URL || '').trim().replace(/\/$/, '');
  base = base.replace(/\/api\/orders\/?$/i, '');
  return base;
};

export const verifyOrderOwnership = async (orderId, customerId, token) => {
  const orderServiceUrl = normalizeOrderServiceBase();

  if (!orderServiceUrl) {
    const err = new Error('ORDER_SERVICE_URL is not configured');
    err.status = 503;
    throw err;
  }

  try {
    const response = await axios.get(
      `${orderServiceUrl}/customer/${encodeURIComponent(customerId)}/order/${encodeURIComponent(orderId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      }
    );

    const order = response.data?.data;
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    if (order.customerId && order.customerId !== customerId) {
      const err = new Error('Order does not belong to the authenticated customer');
      err.status = 403;
      throw err;
    }

    return order;
  } catch (error) {
    if (error.status) {
      throw error;
    }

    const err = new Error(error.response?.data?.message || 'Unable to verify order');
    err.status = error.response?.status || 502;
    throw err;
  }
};
