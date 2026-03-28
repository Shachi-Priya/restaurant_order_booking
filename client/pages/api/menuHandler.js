// Client-side API proxy for menu operations
const SERVER =
  process.env.SERVER_BASE_URL ||
  process.env.NEXT_PUBLIC_SERVER_BASE_URL ||
  'http://localhost:8000';

export default async function handler(req, res) {
  const { method, query, body } = req;
  const { categoryId, itemId, action } = query;

  let url = `${SERVER}/api/menu`;
  let fetchMethod = method;

  // Build URL based on action/params
  if (action === 'seed') {
    url = `${SERVER}/api/menu/seed`;
  } else if (categoryId && itemId) {
    url = `${SERVER}/api/menu/categories/${categoryId}/items/${itemId}`;
  } else if (categoryId && query.items === 'true') {
    url = `${SERVER}/api/menu/categories/${categoryId}/items`;
  } else if (categoryId) {
    url = `${SERVER}/api/menu/categories/${categoryId}`;
  } else if (method === 'POST' && !action) {
    url = `${SERVER}/api/menu/categories`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const fetchOptions = {
      method: fetchMethod,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    };

    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeout);

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Menu API error:', err.message);
    res.status(err.name === 'AbortError' ? 504 : 500).json({
      success: false,
      message: err.name === 'AbortError' ? 'Request timeout' : err.message,
    });
  }
}
