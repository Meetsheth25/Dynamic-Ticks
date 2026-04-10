import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { getAuthHeader } from '@/utils/auth';

const initialState = {
  items: [],
  totalPrice: 0,
  totalQuantity: 0,
  loading: false,
  error: null,
};

// Async Thunks mapping directly to MongoDB backend!
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/cart', { headers: getAuthHeader() });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (itemData, { rejectWithValue }) => {
    try {
      const payload = {
         product: itemData.product || itemData._id,
         customDesign: itemData.customDesign,
         name: itemData.name,
         qty: itemData.qty || 1,
         image: itemData.image,
         price: itemData.price
      };
      const res = await api.post('/cart', payload, { headers: getAuthHeader() });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/cart/${itemId}`, { headers: getAuthHeader() });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalQuantity = 0;
    }
  },
  extraReducers: (builder) => {
    const calculateTotal = (items) => {
      return items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    };
    const calculateQuantity = (items) => {
      return items.reduce((acc, item) => acc + item.qty, 0);
    };

    // FETCH CART
    builder.addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.items || [];
      state.totalPrice = calculateTotal(state.items);
      state.totalQuantity = calculateQuantity(state.items);
    });
    builder.addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // ADD TO CART
    builder.addCase(addToCart.pending, (state, action) => { 
      state.loading = true; 
      state.error = null; 
      // IMMEDIATE OPTIMISTIC UPDATE FOR SNAPPY UI
      if (action.meta && action.meta.arg) {
        const itemArgs = action.meta.arg;
        const productId = itemArgs.product || itemArgs._id;
        const existing = state.items.find(i => i.product === productId || i._id === productId);
        
        if (existing) {
           existing.qty += (itemArgs.qty || 1);
        } else {
           state.items.push({ ...itemArgs, product: productId, qty: itemArgs.qty || 1 });
        }
        state.totalPrice = calculateTotal(state.items);
        state.totalQuantity = calculateQuantity(state.items);
      }
    });
    builder.addCase(addToCart.fulfilled, (state, action) => {
      state.loading = false;
      // Confirmed by backend DB
      state.items = action.payload.items || [];
      state.totalPrice = calculateTotal(state.items);
      state.totalQuantity = calculateQuantity(state.items);
    });
    builder.addCase(addToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // REMOVE FROM CART
    builder.addCase(removeFromCart.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.items || [];
      state.totalPrice = calculateTotal(state.items);
      state.totalQuantity = calculateQuantity(state.items);
    });
    builder.addCase(removeFromCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
