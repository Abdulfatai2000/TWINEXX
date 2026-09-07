import api from './api';

// ── Connection helpers ─────────────────────────────────────────────────────
export const connectionAPI = {
  // GET /api/connections — active connections for current user
  list: () => api.get('/api/connections'),

  // GET /api/connections/pending — pending incoming requests
  pending: () => api.get('/api/connections/pending'),

  // POST /api/connections — send a connection request by PIN
  create: (targetPin) => api.post('/api/connections', { targetPin }),

  // PATCH /api/connections/:id — accept (active) or decline (declined)
  update: (id, status) => api.patch(`/api/connections/${id}`, { status }),
};

export default connectionAPI;