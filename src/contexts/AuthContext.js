import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token for axios requests
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const res = await axios.get('/api/auth/profile');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: res.data, token: state.token },
          });
        } catch (error) {
          dispatch({ type: 'LOGIN_FAIL' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, [state.token]);

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.post('/api/auth/register', userData);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data,
      });
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      dispatch({ type: 'LOGIN_FAIL' });
      return { success: false, message };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.post('/api/auth/login', credentials);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data,
      });
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      dispatch({ type: 'LOGIN_FAIL' });
      return { success: false, message };
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await axios.put('/api/auth/profile', userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: res.data,
      });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 