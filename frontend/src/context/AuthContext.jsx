import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('chat-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('chat-user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // Check if userData is FormData, if not, it stays a plain object
      const { data } = await axios.post('http://localhost:5000/api/auth/register', userData, {
        headers: {
          'Content-Type': userData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      });
      setUser(data);
      localStorage.setItem('chat-user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('http://localhost:5000/api/users/profile', profileData, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setUser(data);
      localStorage.setItem('chat-user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('chat-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
