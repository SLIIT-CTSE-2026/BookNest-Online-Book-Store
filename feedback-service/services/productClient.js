import axios from 'axios';

const normalizeProductServiceBase = () => {
  let base = (process.env.PRODUCT_SERVICE_URL || '').trim().replace(/\/$/, '');
  base = base.replace(/\/api\/products\/?$/i, '');
  return base;
};

export const fetchProductById = async (productId) => {
  const baseUrl = normalizeProductServiceBase();
  if (!baseUrl) {
    const err = new Error('PRODUCT_SERVICE_URL is not configured');
    err.status = 503;
    throw err;
  }

  try {
    const response = await axios.get(`${baseUrl}/by-product-id/${encodeURIComponent(productId)}`, {
      timeout: 5000
    });

    return response.data?.product || response.data?.data?.product || response.data?.data;
  } catch (error) {
    try {
      const response = await axios.get(`${baseUrl}/${encodeURIComponent(productId)}`, {
        timeout: 5000
      });
      return response.data?.product || response.data?.data?.product || response.data?.data;
    } catch (fallbackError) {
      const err = new Error(error.response?.data?.message || 'Unable to reach product service');
      err.status = error.response?.status || 502;
      throw err;
    }
  }
};

export const syncProductRating = async (productId, averageRating, ratingsCount) => {
  const baseUrl = normalizeProductServiceBase();
  if (!baseUrl) {
    const err = new Error('PRODUCT_SERVICE_URL is not configured');
    err.status = 503;
    throw err;
  }

  try {
    await axios.post(`${baseUrl}/ratings/sync`, {
      productId,
      averageRating,
      ratingsCount
    }, {
      timeout: 5000
    });
  } catch (error) {
    const err = new Error(error.response?.data?.message || 'Unable to sync product rating');
    err.status = error.response?.status || 502;
    throw err;
  }
};
