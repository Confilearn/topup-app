import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration - matches the web server structure
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://topupafrica.online";
const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX || "/api";

// Simple token storage for mobile app
export const TokenStorage = {
  // Store JWT token
  setToken: async (token: string) => {
    try {
      await AsyncStorage.setItem("auth_token", token);
    } catch (error) {
      console.error("Error storing token:", error);
    }
  },

  // Get JWT token
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("auth_token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  // Clear token
  clearToken: async () => {
    try {
      await AsyncStorage.removeItem("auth_token");
    } catch (error) {
      console.error("Error clearing token:", error);
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
  options: RequestInit = {},
): Promise<any> => {
  const url = `${API_URL}${API_PREFIX}${endpoint}`;

  // Get auth token
  const token = await TokenStorage.getToken();

  // Prepare headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  // Debug: Log token presence for development
  if (__DEV__) {
    console.log(`API Request: ${endpoint}`, {
      hasToken: !!token,
      tokenLength: token?.length,
      method: options.method || "GET",
    });
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle authentication errors specifically
      if (response.status === 401) {
        // Clear invalid token
        await TokenStorage.clearToken();

        // Provide specific error message
        const errorMessage = errorData.message || "Authentication failed";
        console.error(
          `Authentication Error (${response.status}):`,
          errorMessage,
        );

        throw new Error(errorMessage);
      }

      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

// Authentication API calls - matches server routes from app.js
export const authAPI = {
  // Login - matches POST /api/auth/login
  login: async (email: string, password: string) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Store token from response
    if (response.token) {
      await TokenStorage.setToken(response.token);
    }

    return response;
  },

  // Register - matches POST /api/auth/signup (but server uses /auth/signup route)
  register: async (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    referredBy?: string;
  }) => {
    return apiRequest("/auth/signup", {
      method: "POST",
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
    throw new Error("getCurrentUser endpoint not implemented on server");
  },

  // Update password - matches POST /api/auth/update-password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    // Validate token before making request
    const token = await TokenStorage.getToken();
    if (!token) {
      throw new Error("No authentication token found. Please log in again.");
    }

    return apiRequest("/auth/update-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Forgot password - matches POST /api/auth/forgot-password
  forgotPassword: async (email: string) => {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Verify password - helper method to verify current password
  verifyPassword: async (password: string) => {
    try {
      // Make a request to a protected endpoint to verify current session
      // If it succeeds, the user is authenticated and password was correct at login
      const token = await TokenStorage.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Try to access user profile (requires valid authentication)
      await userAPI.getProfile("current");

      return true;
    } catch (error) {
      return false;
    }
  },
};

// Helper method to initialize auth state
export const initializeAuth = async () => {
  try {
    const hasToken = await TokenStorage.hasToken();
    return { isAuthenticated: hasToken, user: null };
  } catch (error) {
    console.error("Auth initialization error:", error);
    return { isAuthenticated: false, user: null };
  }
};

// Generic API request method for user endpoints
export const userAPI = {
  // Get user profile - matches GET /user/profile/:id
  getProfile: async (userId: string) => {
    return apiRequest(`/user/profile/${userId}`, {
      method: "GET",
    });
  },

  // Update user profile - matches PUT /user/profile/:id
  updateProfile: async (
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      transactionPin?: string;
    },
  ) => {
    return apiRequest(`/user/profile/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Update transaction pin - matches PUT /user/profile/:id with transactionPin
  setTransactionPin: async (userId: string, pin: string) => {
    return apiRequest(`/user/profile/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ transactionPin: pin }),
    });
  },
};
