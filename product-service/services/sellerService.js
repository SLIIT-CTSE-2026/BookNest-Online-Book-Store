const SELLER_SERVICE_URL = (process.env.SELLER_SERVICE_URL).replace(/\/$/, '');

const requestSellerService = async (path, query = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  const querySuffix = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const response = await fetch(`${SELLER_SERVICE_URL}${path}${querySuffix}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || 'Seller service request failed');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

const getSellerHealth = async () => {
  const response = await fetch(`${SELLER_SERVICE_URL}/health`, {
    method: 'GET'
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || 'Seller health check failed');
    error.status = response.status;
    throw error;
  }

  return payload;
};

// Uses list endpoint to avoid relying on seller-service's id route auth context.
const getSellerByUserId = async (sellerId) => {
  const payload = await requestSellerService('/api/sellers');
  const sellers = payload?.data?.sellers || [];
  const seller = sellers.find((item) => String(item.userId) === String(sellerId));

  if (!seller) {
    const error = new Error('Seller not found');
    error.status = 404;
    throw error;
  }

  return seller;
};

module.exports = {
  getSellerHealth,
  getSellerByUserId
};
