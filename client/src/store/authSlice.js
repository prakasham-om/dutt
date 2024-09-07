import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const initialState = {
  loggedIn: JSON.parse(localStorage.getItem('loggedIn')) || false,
  token: localStorage.getItem('token') || null,
  isNew: {},
};

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    login: (state, { payload }) => {
      state.loggedIn = true;
      state.token = payload.token;
      localStorage.setItem('loggedIn', JSON.stringify(true));
      localStorage.setItem('token', payload.token); // Store token
    },
    logout: (state) => {
      state.loggedIn = false;
      state.token = null;
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('token'); // Remove token
    },
    setUserIsNew: (state, { payload }) => {
      state.isNew = payload;
    },
  },
});

export const authActions = authSlice.actions;

export default authSlice.reducer;
