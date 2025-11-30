import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { cartAPI } from "../../services/api";
import { logout } from "./authSlice";

const createTempId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const ensurePositiveQuantity = (value) => {
  const numeric = Number(value ?? 1);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
};

const calculateTotal = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.price || 0) * ensurePositiveQuantity(item.quantity), 0);

const cloneItems = (items = []) =>
  items.map((item) => ({ ...item, quantity: ensurePositiveQuantity(item.quantity) }));

const emptyNormalizedCart = () => ({
  items: [],
  total: 0,
  currentRestaurantId: null,
  currentRestaurantName: null,
});

const normalizeCartItemFromServer = (raw) => {
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

const normalizeCartResponse = (payload) => {
  if (!payload) {
    return emptyNormalizedCart();
  }

  const rawData = payload?.data ?? payload;
  const items = Array.isArray(rawData?.items)
    ? rawData.items.map((item) => normalizeCartItemFromServer(item))
    : [];

  return {
    items,
    total: typeof rawData?.total === 'number' ? rawData.total : calculateTotal(items),
    currentRestaurantId: rawData?.currentRestaurantId ?? null,
    currentRestaurantName: rawData?.currentRestaurantName ?? null,
  };
};

const serializeCartForServer = (cart) => ({
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

const applyNormalizedCartState = (state, normalized) => {
  state.items = cloneItems(normalized.items);
  state.total = normalized.total;
  state.currentRestaurantId = normalized.currentRestaurantId;
  state.currentRestaurantName = normalized.currentRestaurantName;
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.get();
      return normalizeCartResponse(response);
    } catch (error) {
      return rejectWithValue(error?.message || 'Không thể tải giỏ hàng');
    }
  }
);

export const persistCart = createAsyncThunk(
  'cart/persistCart',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await cartAPI.upsert(payload);
      return normalizeCartResponse(response);
    } catch (error) {
      return rejectWithValue(error?.message || 'Không thể lưu giỏ hàng');
    }
  }
);

const initialState = {
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
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const productId = String(action.payload.productId ?? action.payload.id);
      const restaurantId = String(action.payload.restaurantId);
      const restaurantName = String(action.payload.restaurantName ?? '');

      if (!restaurantId) {
        return;
      }

      const normalizedItem = {
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
        // Khi đổi nhà hàng, clear giỏ cũ
        state.items = [normalizedItem];
        state.currentRestaurantId = restaurantId;
        state.currentRestaurantName = restaurantName;
      }

      state.total = calculateTotal(state.items);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = calculateTotal(state.items);
      if (state.items.length === 0) {
        state.currentRestaurantId = null;
        state.currentRestaurantName = null;
      }
    },
    updateItemQuantity: (state, action) => {
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
    applyCartSnapshot: (state, action) => {
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
        state.error = action.payload || action.error.message || 'Không thể tải giỏ hàng';
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
        state.error = action.payload || action.error.message || 'Không thể lưu giỏ hàng';
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

export const selectCartState = (state) => state.cart;

export const synchronizeCart = () => async (dispatch, getState) => {
  const state = getState();
  if (!state.auth?.isAuthenticated) {
    return undefined;
  }

  const payload = serializeCartForServer(state.cart);
  return dispatch(persistCart(payload)).unwrap();
};

export const addToCart = (payload) => async (dispatch) => {
  dispatch(addItem(payload));
  try {
    await dispatch(synchronizeCart());
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = (id) => async (dispatch) => {
  dispatch(removeItem(id));
  try {
    await dispatch(synchronizeCart());
  } catch (error) {
    throw error;
  }
};

export const updateQuantity = (payload) => async (dispatch) => {
  dispatch(updateItemQuantity(payload));
  try {
    await dispatch(synchronizeCart());
  } catch (error) {
    throw error;
  }
};

export const clearCart = () => async (dispatch) => {
  dispatch(clearCartState());
  try {
    // Gọi API clear cart trên server
    await cartAPI.clear();
  } catch (error) {
    console.error('Failed to clear cart on server:', error);
    // Vẫn tiếp tục vì local đã clear rồi
  }
};

export default cartSlice.reducer;
