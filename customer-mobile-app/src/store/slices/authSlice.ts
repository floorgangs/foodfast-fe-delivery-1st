import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      // Mock login
      state.user = {
        id: '1',
        name: 'Nguyễn Văn A',
        email: action.payload.email,
        phone: '0901234567',
      };
      state.isAuthenticated = true;
      AsyncStorage.setItem('user', JSON.stringify(state.user));
    },
    register: (state, action: PayloadAction<{ name: string; email: string; phone: string; password: string }>) => {
      // Mock register - lưu thông tin thật từ form
      state.user = {
        id: Date.now().toString(),
        name: action.payload.name,
        email: action.payload.email,
        phone: action.payload.phone,
      };
      state.isAuthenticated = true;
      AsyncStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      AsyncStorage.removeItem('user');
      AsyncStorage.removeItem('cart');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
});

export const { login, register, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
