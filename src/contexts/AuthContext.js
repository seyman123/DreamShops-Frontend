import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api, { authAPI } from '../services/api';
import { config } from '../utils/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(config.TOKEN_STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  // Helper function to transform JWT token data to expected user format
  const transformJwtToUser = (decodedToken) => {
    const transformedUser = {
      id: decodedToken.id || decodedToken.sub || decodedToken.userId,
      email: decodedToken.sub || decodedToken.email,
      roles: decodedToken.roles ? decodedToken.roles.map(roleName => ({ name: roleName })) : []
    };
    return transformedUser;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(config.TOKEN_STORAGE_KEY);
      if (storedToken) {
        try {
          const decodedToken = jwtDecode(storedToken);
          if (decodedToken.exp * 1000 > Date.now()) {
            setToken(storedToken);
            
            // Transform JWT data to expected format
            const transformedUser = transformJwtToUser(decodedToken);
            setUser(transformedUser);
            
            // Try to fetch full user details from backend
            try {
              const userId = decodedToken.id || decodedToken.sub || decodedToken.userId;
              if (userId) {
                const response = await api.get(`/users/${userId}/user`);
                const fullUserData = response.data.data;
                // Merge backend user data with JWT roles
                setUser({
                  ...fullUserData,
                  roles: transformedUser.roles // Keep JWT roles as they are authoritative
                });
              }
            } catch (error) {
              // Keep the transformed JWT user data
            }
          } else {
            localStorage.removeItem(config.TOKEN_STORAGE_KEY);
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem(config.TOKEN_STORAGE_KEY);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Call backend login API
      const response = await authAPI.login({ email, password });
      
      // Extract token from response
      const token = response.data.token || response.data.data?.token || response.data.accessToken;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      // Decode and validate token
      const decodedToken = jwtDecode(token);
      
      // Store token
      localStorage.setItem(config.TOKEN_STORAGE_KEY, token);
      setToken(token);
      
      // Transform JWT data to expected format
      const transformedUser = transformJwtToUser(decodedToken);
      setUser(transformedUser);
      
      // Try to fetch full user details from backend
      try {
        const userId = decodedToken.id || decodedToken.sub || decodedToken.userId;
        if (userId) {
          const userResponse = await api.get(`/users/${userId}/user`);
          const fullUserData = userResponse.data.data;
          // Merge backend user data with JWT roles
          setUser({
            ...fullUserData,
            roles: transformedUser.roles // Keep JWT roles as they are authoritative
          });
        }
      } catch (error) {
        // Keep the transformed JWT user data
      }
      
      return true;
    } catch (error) {
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem(config.TOKEN_STORAGE_KEY);
    localStorage.removeItem(config.USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => ({
      ...prev,
      ...updatedUserData,
      roles: prev.roles // Preserve roles from JWT
    }));
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 