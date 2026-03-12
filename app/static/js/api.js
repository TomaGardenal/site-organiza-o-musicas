/* ── API CLIENT ─────────────────────────────────── */
const API = {
  async request(method, url, body = null, isFormData = false) {
    const options = {
      method,
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    };
    if (body) options.body = isFormData ? body : JSON.stringify(body);
    const response = await fetch(url, options);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
    if (response.status === 204) return null;
    return response.json();
  },

  get: (url) => API.request('GET', url),
  post: (url, data) => API.request('POST', url, data),
  put: (url, data) => API.request('PUT', url, data),
  delete: (url) => API.request('DELETE', url),
  upload: (url, formData) => API.request('POST', url, formData, true),

  // Projects
  projects: {
    list: () => API.get('/api/projects/'),
    get: (id) => API.get(`/api/projects/${id}`),
    create: (data) => API.post('/api/projects/', data),
    update: (id, data) => API.put(`/api/projects/${id}`, data),
    delete: (id) => API.delete(`/api/projects/${id}`),
  },

  // Tracks
  tracks: {
    list: (projectId) => API.get(`/api/tracks/project/${projectId}`),
    get: (id) => API.get(`/api/tracks/${id}`),
    create: (data) => API.post('/api/tracks/', data),
    update: (id, data) => API.put(`/api/tracks/${id}`, data),
    delete: (id) => API.delete(`/api/tracks/${id}`),
  },

  // Marketing
  marketing: {
    list: (projectId) => API.get(`/api/marketing/project/${projectId}`),
    create: (data) => API.post('/api/marketing/', data),
    update: (id, data) => API.put(`/api/marketing/${id}`, data),
    delete: (id) => API.delete(`/api/marketing/${id}`),
  },

  // Dashboard
  dashboard: {
    get: () => API.get('/api/dashboard/'),
  },

  // Uploads
  uploadFile: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return API.upload('/api/uploads/', fd);
  },
};
