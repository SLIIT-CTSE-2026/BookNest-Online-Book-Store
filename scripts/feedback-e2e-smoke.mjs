/*
  End-to-end smoke script for BookNest feedback integrations.
  Demonstrates:
  1) Customer can add order-level feedback (without productId)
  2) Customer can add product-level feedback (with productId)
  3) Product rating updates automatically in product-service
  4) Seller can see product-level feedback list
*/

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';
const CUSTOMER_SERVICE_BASE = process.env.CUSTOMER_SERVICE_BASE_URL || 'http://localhost:5002/api/customers';

const now = Date.now();
const sellerEmail = `seller.smoke.${now}@mail.com`;
const customerEmail = `customer.smoke.${now}@mail.com`;
const password = 'Pass1234';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  return { response, body };
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

async function registerUser(name, email, role) {
  const { response, body } = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });

  if (!response.ok || !body?.data?.token || !body?.data?.user) {
    throw new Error(`Register failed for ${role}: ${JSON.stringify(body)}`);
  }

  return { token: body.data.token, user: body.data.user };
}

async function main() {
  console.log(`Using API base: ${API_BASE}`);

  const seller = await registerUser('Smoke Seller', sellerEmail, 'seller');
  const customer = await registerUser('Smoke Customer', customerEmail, 'customer');
  console.log('Registered seller and customer');
  console.log('Customer auth userId:', customer.user.userId);

  // Ensure customer profile exists for order-service validation.
  const profileUpsertResponse = await fetch(`${CUSTOMER_SERVICE_BASE}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: customer.user.userId,
      name: customer.user.name,
      email: customer.user.email,
      role: customer.user.role
    })
  });

  if (!profileUpsertResponse.ok) {
    throw new Error(`Customer profile upsert failed: ${profileUpsertResponse.status}`);
  }

  const profileLookupResponse = await fetch(`${CUSTOMER_SERVICE_BASE}?search=${encodeURIComponent(customer.user.email)}`);
  if (!profileLookupResponse.ok) {
    throw new Error(`Customer profile lookup failed: ${profileLookupResponse.status}`);
  }

  const profileLookupBody = await profileLookupResponse.json();
  const matchedCustomer = (profileLookupBody?.data?.customers || []).find(
    (entry) => entry.email === customer.user.email
  );

  const resolvedCustomerId = matchedCustomer?.userId || customer.user.userId;
  console.log('Resolved customerId for order:', resolvedCustomerId);

  const createProductPayload = {
    title: `Smoke Product ${now}`,
    author: 'Smoke Author',
    description: 'Integration smoke product',
    price: 1200,
    category: 'Testing',
    stock: 10,
    sellerId: seller.user.userId
  };

  const createProductResult = await request('/products', {
    method: 'POST',
    headers: authHeaders(seller.token),
    body: JSON.stringify(createProductPayload)
  });

  if (!createProductResult.response.ok || !createProductResult.body?.product?._id) {
    throw new Error(`Create product failed: ${JSON.stringify(createProductResult.body)}`);
  }

  const product = createProductResult.body.product;
  console.log(`Created product: ${product._id}`);

  const createOrderPayload = {
    customerId: resolvedCustomerId,
    customerName: customer.user.name,
    customerEmail: customer.user.email,
    items: [
      {
        productId: product._id,
        productName: product.title,
        quantity: 1,
        price: product.price
      }
    ],
    shippingAddress: '123 Smoke Street',
    paymentMethod: 'card',
    notes: 'smoke test order'
  };

  const createOrderResult = await request('/orders', {
    method: 'POST',
    headers: authHeaders(customer.token),
    body: JSON.stringify(createOrderPayload)
  });

  if (!createOrderResult.response.ok || !createOrderResult.body?.data?.orderId) {
    throw new Error(`Create order failed: ${JSON.stringify(createOrderResult.body)}`);
  }

  const orderId = createOrderResult.body.data.orderId;
  console.log(`Created order: ${orderId}`);

  const orderLevelFeedbackResult = await request('/feedback', {
    method: 'POST',
    headers: authHeaders(customer.token),
    body: JSON.stringify({
      orderId,
      rating: 4,
      comment: 'Order-level feedback smoke test'
    })
  });

  if (!orderLevelFeedbackResult.response.ok) {
    throw new Error(`Order-level feedback failed: ${JSON.stringify(orderLevelFeedbackResult.body)}`);
  }
  console.log('Order-level feedback created');

  const productLevelFeedbackResult = await request('/feedback', {
    method: 'POST',
    headers: authHeaders(customer.token),
    body: JSON.stringify({
      orderId,
      productId: product._id,
      rating: 5,
      comment: 'Product-level feedback smoke test'
    })
  });

  if (!productLevelFeedbackResult.response.ok) {
    throw new Error(`Product-level feedback failed: ${JSON.stringify(productLevelFeedbackResult.body)}`);
  }
  console.log('Product-level feedback created');

  const productAfterFeedbackResult = await request(`/products/${product._id}`, {
    method: 'GET',
    headers: authHeaders(customer.token)
  });

  if (!productAfterFeedbackResult.response.ok) {
    throw new Error(`Fetch product failed: ${JSON.stringify(productAfterFeedbackResult.body)}`);
  }

  const updatedProduct = productAfterFeedbackResult.body?.product;
  console.log('Updated product ratings:', updatedProduct?.ratings);

  if (!updatedProduct?.ratings || updatedProduct.ratings.count < 1) {
    throw new Error('Product rating sync did not update ratings.count');
  }

  const sellerFeedbackResult = await request('/feedback/seller', {
    method: 'GET',
    headers: authHeaders(seller.token)
  });

  if (!sellerFeedbackResult.response.ok) {
    throw new Error(`Seller feedback list failed: ${JSON.stringify(sellerFeedbackResult.body)}`);
  }

  const sellerFeedbackItems = sellerFeedbackResult.body?.data?.feedback || [];
  const hasProductFeedback = sellerFeedbackItems.some(
    (entry) => entry.orderId === orderId && entry.productId === product._id
  );

  if (!hasProductFeedback) {
    throw new Error('Seller feedback feed does not contain the expected product-level feedback');
  }

  console.log('Seller sees product-level feedback');
  console.log('\nSmoke test passed: order-level + product-level feedback + product rating sync + seller feed');
}

main().catch((error) => {
  console.error('\nSmoke test failed:', error.message);
  process.exit(1);
});
