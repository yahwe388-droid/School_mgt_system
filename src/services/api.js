const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (res) => {
  try {
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      message: res.statusText || 'An unexpected network error occurred.'
    };
  }
};

export const api = {
  get: async (endpoint, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'GET', headers });
      return await handleResponse(res);
    } catch (err) {
      return { success: false, message: 'Unable to connect to server.' };
    }
  },

  post: async (endpoint, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      return await handleResponse(res);
    } catch (err) {
      return { success: false, message: 'Unable to connect to server.' };
    }
  },

  put: async (endpoint, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });
      return await handleResponse(res);
    } catch (err) {
      return { success: false, message: 'Unable to connect to server.' };
    }
  },

  patch: async (endpoint, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body)
      });
      return await handleResponse(res);
    } catch (err) {
      return { success: false, message: 'Unable to connect to server.' };
    }
  },

  delete: async (endpoint, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE', headers });
      return await handleResponse(res);
    } catch (err) {
      return { success: false, message: 'Unable to connect to server.' };
    }
  }
};

