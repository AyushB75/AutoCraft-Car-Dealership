const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(data.message || `Request failed with status ${response.status}`, response.status, data);
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me', { method: 'GET' }),

  // Vehicles
  getVehicles: () => request('/vehicles', { method: 'GET' }),
  searchVehicles: (params = {}) => {
    const query = new URLSearchParams();
    if (params.make) query.set('make', params.make);
    if (params.model) query.set('model', params.model);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.minPrice) query.set('minPrice', params.minPrice);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice);
    const queryString = query.toString();
    return request(`/vehicles/search${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },
  createVehicle: (vehicleData) => request('/vehicles', { method: 'POST', body: JSON.stringify(vehicleData) }),
  updateVehicle: (id, updateData) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(updateData) }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),
  purchaseVehicle: (id) => request(`/vehicles/${id}/purchase`, { method: 'POST' }),
  restockVehicle: (id, quantity) => request(`/vehicles/${id}/restock`, { method: 'POST', body: JSON.stringify({ quantity }) }),
};

export default api;
