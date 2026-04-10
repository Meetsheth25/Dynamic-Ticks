import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { getAuthHeader } from '@/utils/auth';

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders', { headers: getAuthHeader() });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders/my', { headers: getAuthHeader() });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/orders/${id}`, { headers: getAuthHeader() });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createOrder = createAsyncThunk('orders/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders', orderData, { headers: getAuthHeader() });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const returnUserOrder = createAsyncThunk('orders/returnOrder', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/orders/${id}/return`, data, { headers: getAuthHeader() });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; });
    builder.addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder.addCase(fetchMyOrders.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; });
    builder.addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder.addCase(createOrder.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(createOrder.fulfilled, (state, action) => { state.loading = false; state.orders.push(action.payload); });
    builder.addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder.addCase(fetchOrderById.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchOrderById.fulfilled, (state, action) => { 
      state.loading = false; 
      // Upsert the specific order into the orders array for caching
      const index = state.orders.findIndex(o => o._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      } else {
        state.orders.push(action.payload);
      }
    });
    builder.addCase(fetchOrderById.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder.addCase(returnUserOrder.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(returnUserOrder.fulfilled, (state, action) => { 
      state.loading = false; 
      const index = state.orders.findIndex(o => o._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    });
    builder.addCase(returnUserOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export default orderSlice.reducer;
