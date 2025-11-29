import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';
import type { AppThunk, RootState } from '../index';
import { logout } from './authSlice';

const createTempId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const ensurePositiveQuantity = (value?: number) => {
  const numeric = Number(value ?? 1);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
};

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  currentRestaurantId: string | null;
  currentRestaurantName: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncedAt: number | null;
}

interface CartSyncItemPayload {
  id?: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
}

export interface CartSyncPayload {
  items: CartSyncItemPayload[];
  total?: number;
  currentRestaurantId: string | null;
  currentRestaurantName: string | null;
}

export interface NormalizedCartPayload {
  items: CartItem[];
  total: number;
  currentRestaurantId: string | null;
  currentRestaurantName: string | null;
}

export interface AddToCartPayload {
  id: string;
  productId?: string;
  name: string;
  price: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
}

const calculateTotal = (items: CartItem[] = []) =>
  items.reduce((sum, item) => sum + Number(item.price || 0) * ensurePositiveQuantity(item.quantity), 0);

const cloneItems = (items: CartItem[] = []): CartItem[] =>
  items.map((item) => ({ ...item, quantity: ensurePositiveQuantity(item.quantity) }));

const emptyNormalizedCart = (): NormalizedCartPayload => ({
  items: [],
  total: 0,
  currentRestaurantId: null,
  currentRestaurantName: null,
});

const normalizeCartItemFromServer = (raw: any): CartItem => {
  const productId = String(raw?.productId ?? raw?.product ?? raw?.id ?? raw?._id ?? createTempId('product'));
  return {
    id: String(raw?._id ?? raw?.id ?? createTempId('item')),
    productId,
    name: String(raw?.name ?? ''),
    price: Number(raw?.price ?? 0),
    quantity: ensurePositiveQuantity(raw?.quantity),
    restaurantId: raw?.restaurantId ? String(raw.restaurantId) : '',
    restaurantName: String(raw?.restaurantName ?? ''),
    image: raw?.image ?? undefined,
  };
};

const normalizeCartResponse = (payload: any): NormalizedCartPayload => {
  if (!payload) {
    return emptyNormalizedCart();
  }

  const rawData = payload?.data ?? payload;
  const items = Array.isArray(rawData?.items)
    ? rawData.items.map((item: any) => normalizeCartItemFromServer(item))
    : [];

  return {
    items,
    total: typeof rawData?.total === 'number' ? rawData.total : calculateTotal(items),
    currentRestaurantId: rawData?.currentRestaurantId ?? null,
    currentRestaurantName: rawData?.currentRestaurantName ?? null,
  };
};

const serializeCartForServer = (cart: CartState): CartSyncPayload => ({
  items: cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: ensurePositiveQuantity(item.quantity),
    restaurantId: item.restaurantId,
    restaurantName: item.restaurantName,
    image: item.image,
  })),
  total: cart.total,
  currentRestaurantId: cart.currentRestaurantId,
  currentRestaurantName: cart.currentRestaurantName,
});

const applyNormalizedCartState = (state: CartState, normalized: NormalizedCartPayload) => {
  state.items = cloneItems(normalized.items);
  state.total = normalized.total;
  state.currentRestaurantId = normalized.currentRestaurantId;
  state.currentRestaurantName = normalized.currentRestaurantName;
};

export const fetchCart = createAsyncThunk<NormalizedCartPayload, void, { state: RootState }>(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.get();
      return normalizeCartResponse(response);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Không thể tải giỏ hàng');
    }
  }
);

export const persistCart = createAsyncThunk<NormalizedCartPayload, CartSyncPayload>(
  'cart/persistCart',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await cartAPI.upsert(payload);
      return normalizeCartResponse(response);
    } catch (error: any) {
      const errorMessage = error?.message || 'Không thể lưu giỏ hàng';
      
      // Chỉ log nếu là lỗi thực sự liên quan đến cart
      const isIrrelevantError = 
        errorMessage.includes('đã tồn tại') || 
        errorMessage.includes('user') ||
        errorMessage.includes('đăng nhập') || 
        errorMessage.includes('Token') ||
        errorMessage.includes('401');
      
      if (!isIrrelevantError) {
        console.error('[persistCart] Error:', errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState: CartState = {
  items: [],
  total: 0,
  currentRestaurantId: null,
  currentRestaurantName: null,
  isLoading: false,
  isSyncing: false,
  error: null,
  lastSyncedAt: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<AddToCartPayload>) => {
      const productId = String(action.payload.productId ?? action.payload.id);
      const restaurantId = String(action.payload.restaurantId);
      const restaurantName = String(action.payload.restaurantName ?? '');

      if (!restaurantId) {
        return;
      }

      const normalizedItem: CartItem = {
        id: createTempId('item'),
        productId,
        name: action.payload.name,
        price: Number(action.payload.price ?? 0),
        quantity: 1,
        restaurantId,
        restaurantName,
        image: action.payload.image,
      };

      if (state.items.length === 0) {
        state.items.push(normalizedItem);
        state.currentRestaurantId = restaurantId;
        state.currentRestaurantName = restaurantName;
      } else if (state.currentRestaurantId === restaurantId) {
        const existingItem = state.items.find((item) => item.productId === productId);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.items.push(normalizedItem);
        }
      } else {
        // Khi đổi nhà hàng, clear giỏ cũ (logic lưu đơn tạm sẽ implement riêng sau)
        state.items = [normalizedItem];
        state.currentRestaurantId = restaurantId;
        state.currentRestaurantName = restaurantName;
      }

      state.total = calculateTotal(state.items);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = calculateTotal(state.items);
      if (state.items.length === 0) {
        state.currentRestaurantId = null;
        state.currentRestaurantName = null;
      }
    },
    updateItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const target = state.items.find((item) => item.id === action.payload.id);
      if (!target) {
        return;
      }

      const numericQuantity = Number.isFinite(action.payload.quantity)
        ? Math.floor(action.payload.quantity)
        : 1;

      if (numericQuantity <= 0) {
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      } else {
        target.quantity = numericQuantity;
      }

      state.total = calculateTotal(state.items);
      if (state.items.length === 0) {
        state.currentRestaurantId = null;
        state.currentRestaurantName = null;
      }
    },
    clearCartState: (state) => {
      state.items = [];
      state.total = 0;
      state.currentRestaurantId = null;
      state.currentRestaurantName = null;
    },
    applyCartSnapshot: (state, action: PayloadAction<NormalizedCartPayload>) => {
      applyNormalizedCartState(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        applyNormalizedCartState(state, action.payload);
        state.lastSyncedAt = Date.now();
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Không thể tải giỏ hàng';
      })
      .addCase(persistCart.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(persistCart.fulfilled, (state, action) => {
        state.isSyncing = false;
        applyNormalizedCartState(state, action.payload);
        state.lastSyncedAt = Date.now();
      })
      .addCase(persistCart.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = (action.payload as string) || action.error.message || 'Không thể lưu giỏ hàng';
      })
      .addCase(logout.fulfilled, () => ({ ...initialState }));
  },
});

const {
  addItem,
  removeItem,
  updateItemQuantity,
  clearCartState,
} = cartSlice.actions;

export const selectCartState = (state: RootState) => state.cart;

export const synchronizeCart = (): AppThunk<Promise<NormalizedCartPayload | void>> =>
  async (dispatch, getState) => {
    const state = getState();
    
    // Kiểm tra authentication
    if (!state.auth?.isAuthenticated) {
      return undefined;
    }

    try {
      const payload = serializeCartForServer(state.cart);
      return await dispatch(persistCart(payload)).unwrap();
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || '';
      
      // Bỏ qua các error không liên quan đến cart
      const isIrrelevantError = 
        errorMsg.includes('đã tồn tại') || 
        errorMsg.includes('user') ||
        errorMsg.includes('đăng nhập') || 
        errorMsg.includes('Token') ||
        errorMsg.includes('401');
      
      if (!isIrrelevantError) {
        console.error('[synchronizeCart] Failed:', errorMsg);
      }
      throw error;
    }
  };

export const addToCart = (payload: AddToCartPayload): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(addItem(payload));
    
    const state = getState();
    if (!state.auth?.isAuthenticated) {
      // Nếu chưa đăng nhập, chỉ cập nhật local state
      return;
    }
    
    try {
      await dispatch(synchronizeCart());
    } catch (error: any) {
      // Silent - không log error, không throw
      // Vẫn giữ item trong local state
    }
  };

export const removeFromCart = (id: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(removeItem(id));
    
    const state = getState();
    if (!state.auth?.isAuthenticated) {
      // Nếu chưa đăng nhập, chỉ cập nhật local state
      return;
    }
    
    try {
      await dispatch(synchronizeCart());
    } catch (error: any) {
      // Silent - không log error, không throw
      // Vẫn giữ thay đổi trong local state
    }
  };

export const updateQuantity = (payload: { id: string; quantity: number }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(updateItemQuantity(payload));
    
    const state = getState();
    if (!state.auth?.isAuthenticated) {
      // Nếu chưa đăng nhập, chỉ cập nhật local state
      return;
    }
    
    try {
      await dispatch(synchronizeCart());
    } catch (error: any) {
      // Silent - không log error, không throw
      // Vẫn giữ thay đổi trong local state
    }
  };

export const clearCart = (): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(clearCartState());
    
    const state = getState();
    if (!state.auth?.isAuthenticated) {
      // Nếu chưa đăng nhập, chỉ cập nhật local state
      return;
    }
    
    try {
      await dispatch(synchronizeCart());
    } catch (error: any) {
      // Silent - không log error, không throw
      // Vẫn giữ thay đổi trong local state
    }
  };

export default cartSlice.reducer;
