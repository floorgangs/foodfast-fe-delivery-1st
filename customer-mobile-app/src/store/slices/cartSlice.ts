import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
}

interface SavedCart {
  items: CartItem[];
  total: number;
  restaurantId: string;
  restaurantName: string;
  savedAt: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  currentRestaurantId: string | null;
  currentRestaurantName: string | null;
  savedCarts: SavedCart[];
}

const initialState: CartState = {
  items: [],
  total: 0,
  currentRestaurantId: null,
  currentRestaurantName: null,
  savedCarts: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const { restaurantId, restaurantName } = action.payload;
      
      // Nếu giỏ hàng trống, đặt nhà hàng hiện tại
      if (state.items.length === 0) {
        state.currentRestaurantId = restaurantId;
        state.currentRestaurantName = restaurantName;
        state.items.push({ ...action.payload, quantity: 1 });
      } 
      // Nếu cùng nhà hàng, thêm vào giỏ
      else if (state.currentRestaurantId === restaurantId) {
        const existingItem = state.items.find(item => item.id === action.payload.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.items.push({ ...action.payload, quantity: 1 });
        }
      } 
      // Nếu khác nhà hàng, lưu giỏ hiện tại vào savedCarts và tạo giỏ mới
      else {
        // Lưu giỏ hiện tại vào savedCarts
        state.savedCarts.push({
          items: [...state.items],
          total: state.total,
          restaurantId: state.currentRestaurantId!,
          restaurantName: state.currentRestaurantName!,
          savedAt: Date.now(),
        });
        
        // Tạo giỏ mới với món từ nhà hàng khác
        state.items = [{ ...action.payload, quantity: 1 }];
        state.currentRestaurantId = restaurantId;
        state.currentRestaurantName = restaurantName;
      }
      
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      AsyncStorage.setItem('cart', JSON.stringify(state));
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      AsyncStorage.setItem('cart', JSON.stringify(state));
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.id !== action.payload.id);
        }
      }
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      AsyncStorage.setItem('cart', JSON.stringify(state));
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.currentRestaurantId = null;
      state.currentRestaurantName = null;
      AsyncStorage.setItem('cart', JSON.stringify(state));
    },
    restoreSavedCart: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.savedCarts.length) {
        // Lưu giỏ hiện tại nếu có món
        if (state.items.length > 0) {
          state.savedCarts.push({
            items: [...state.items],
            total: state.total,
            restaurantId: state.currentRestaurantId!,
            restaurantName: state.currentRestaurantName!,
            savedAt: Date.now(),
          });
        }
        
        // Khôi phục giỏ đã lưu
        const savedCart = state.savedCarts[index];
        state.items = savedCart.items;
        state.total = savedCart.total;
        state.currentRestaurantId = savedCart.restaurantId;
        state.currentRestaurantName = savedCart.restaurantName;
        
        // Xóa khỏi savedCarts
        state.savedCarts.splice(index, 1);
        AsyncStorage.setItem('cart', JSON.stringify(state));
      }
    },
    deleteSavedCart: (state, action: PayloadAction<number>) => {
      state.savedCarts.splice(action.payload, 1);
      AsyncStorage.setItem('cart', JSON.stringify(state));
    },
    setCart: (state, action: PayloadAction<CartState>) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart, restoreSavedCart, deleteSavedCart } = cartSlice.actions;
export default cartSlice.reducer;
