const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  get: async (endpoint, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'GET', headers });
    return res.json();
  },

  post: async (endpoint, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return res.json();
  }
};
