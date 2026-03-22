import axios from 'axios';

const getProductServiceUrl = () => process.env.PRODUCT_SERVICE_URL || 'http://localhost:5004';

export const fetchProductById = async (productId) => {
  try {
    const response = await axios.get(`${getProductServiceUrl()}/${productId}`, {
      timeout: 5000
    });

    return response.data?.product || response.data?.data?.product || response.data?.data;
  } catch (error) {
    const err = new Error(error.response?.data?.message || 'Unable to reach product service');
    err.status = error.response?.status || 502;
    throw err;
  }
};

export const syncProductRating = async (productId, averageRating, ratingsCount) => {
  try {
    await axios.post(`${getProductServiceUrl()}/ratings/sync`, {
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
