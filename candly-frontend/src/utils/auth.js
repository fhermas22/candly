// Auth utilities for token management and user state

const buildDisplayName = (user) => {
  const firstName = user?.profile?.first_name || user?.first_name || null;
  const lastName = user?.profile?.last_name || user?.last_name || null;
  const emailName = user?.email?.split('@')[0] ?? 'Candidat';

  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ');
  }

  return emailName;
};

const buildAvatarInitials = (displayName) => {
  if (!displayName) return 'CC';
  const parts = displayName.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const normalizeUser = (user) => {
  if (!user) return null;

  const displayName = buildDisplayName(user);
  const avatarInitials = buildAvatarInitials(displayName);

  return {
    ...user,
    displayName,
    avatarInitials,
    avatarColor: user.avatarColor || '#22D3EE',
  };
};

export const auth = {
  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  removeToken() {
    localStorage.removeItem('token');
  },

  getUser() {
    const raw = localStorage.getItem('user');
    if (!raw) return null;

    try {
      return normalizeUser(JSON.parse(raw));
    } catch {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser() {
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  logout() {
    this.removeToken();
    this.removeUser();
  },

  async login(credentials) {
    try {
      const { default: api } = await import('./api.js');
      const response = await api.post('/auth/login', credentials);
      const { user, plainTextToken } = response.data;

      this.setToken(plainTextToken);
      this.setUser(user);

      return { user: normalizeUser(user), token: plainTextToken };
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  async register(credentials) {
    try {
      const { default: api } = await import('./api.js');
      const response = await api.post('/auth/register', credentials);
      const { user, plainTextToken } = response.data;

      this.setToken(plainTextToken);
      this.setUser(user);

      return { user: normalizeUser(user), token: plainTextToken };
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },
};
