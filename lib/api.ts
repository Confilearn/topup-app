import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - matches the web server structure
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://topupafrica.online';
const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX || '/api';

// Simple token storage for mobile app
export const TokenStorage = {
  // Store JWT token
  setToken: async (token: string) => {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  // Get JWT token
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Clear token
  clearToken: async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  },

  // Check if token exists
  hasToken: async (): Promise<boolean> => {
    const token = await TokenStorage.getToken();
    return !!token;
  },
};

// Simple API request wrapper for mobile app
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_URL}${API_PREFIX}${endpoint}`;
  
  // Get auth token
  const token = await TokenStorage.getToken();
  
  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // If unauthorized, clear token and let app handle redirect
      if (response.status === 401) {
        await TokenStorage.clearToken();
      }
      
      throw new Error(errorData.message || `Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Authentication API calls - matches server routes
export const authAPI = {
  // Login - matches POST /api/login
  login: async (email: string, password: string) => {
    const response = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token from response
    if (response.token) {
      await TokenStorage.setToken(response.token);
    }
    
    return response;
  },

  // Register - matches POST /api/signup
  register: async (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    referredBy?: string;
  }) => {
    return apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Logout - clear local token
  logout: async () => {
    await TokenStorage.clearToken();
  },

  // Get current user - would need /api/me endpoint on server
  getCurrentUser: async () => {
    // Note: Server doesn't have /api/me endpoint yet
    // This would need to be added to the server
    throw new Error('getCurrentUser endpoint not implemented on server');
  },

  // Update password - matches POST /api/update-password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/update-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Forgot password - matches POST /api/forgot-password
  forgotPassword: async (email: string) => {
    return apiRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password - matches POST /api/reset-password
  resetPassword: async (token: string, newPassword: string) => {
    return apiRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// Helper method to initialize auth state
export const initializeAuth = async () => {
  try {
    const hasToken = await TokenStorage.hasToken();
    return { isAuthenticated: hasToken, user: null };
  } catch (error) {
    console.error('Auth initialization error:', error);
    return { isAuthenticated: false, user: null };
  }
};
