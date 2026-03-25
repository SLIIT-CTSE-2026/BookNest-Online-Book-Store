const FEEDBACK_SERVICE_URL = (process.env.FEEDBACK_SERVICE_URL).replace(/\/$/, '');

const requestFeedbackService = async (path, token, query = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  const querySuffix = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const response = await fetch(`${FEEDBACK_SERVICE_URL}${path}${querySuffix}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.message || 'Feedback service request failed');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

const getTokenFromHeader = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
};

// Try seller feed first, then fallback to customer feed based on auth role.
const getRelevantFeedbackForProduct = async (productId, authorizationHeader = '') => {
  const token = getTokenFromHeader(authorizationHeader);
  if (!token) {
    const error = new Error('Authorization token is required');
    error.status = 401;
    throw error;
  }

  try {
    const sellerPayload = await requestFeedbackService('/api/feedback/seller', token, { productId });
    return {
      source: 'seller',
      ...sellerPayload
    };
  } catch (error) {
    if (error.status !== 403) {
      throw error;
    }
  }

  const customerPayload = await requestFeedbackService('/api/feedback', token, { productId });
  return {
    source: 'customer',
    ...customerPayload
  };
};

const getFeedbackHealth = async () => {
  const response = await fetch(`${FEEDBACK_SERVICE_URL}/health`, {
    method: 'GET'
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || 'Feedback health check failed');
    error.status = response.status;
    throw error;
  }

  return payload;
};

module.exports = {
  getRelevantFeedbackForProduct,
  getFeedbackHealth
};
