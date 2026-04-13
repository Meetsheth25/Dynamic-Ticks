import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { getAuthHeader } from '@/utils/auth';

const initialState = {
  products: [],
  orders: [],
  users: [],
  stats: { totalRevenue: 98000 },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAdminProducts = createAsyncThunk('admin/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products', { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const addProduct = createAsyncThunk('admin/addProduct', async (productData, { rejectWithValue }) => {
  try {
    const res = await api.post('/products', productData, { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const deleteProduct = createAsyncThunk('admin/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`, { headers: getAuthHeader() });
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const updateProduct = createAsyncThunk('admin/updateProduct', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/products/${id}`, data, { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const fetchAdminOrders = createAsyncThunk('admin/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders', { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const updateOrderStatus = createAsyncThunk('admin/updateOrderStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/status`, { status }, { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const cancelOrder = createAsyncThunk('admin/cancelOrder', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/cancel`, {}, { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const approveReturn = createAsyncThunk('admin/approveReturn', async ({ id, adminDecision }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/return/approve`, { adminDecision }, { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const rejectReturn = createAsyncThunk('admin/rejectReturn', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/return/reject`, {}, { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/users', { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/users/${id}`, { headers: getAuthHeader() });
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const makeAdmin = createAsyncThunk('admin/makeAdmin', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/admin/users/${id}/make-admin`, {}, { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const removeAdmin = createAsyncThunk('admin/removeAdmin', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/admin/users/${id}/remove-admin`, {}, { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const toggleUserBlock = createAsyncThunk('admin/toggleUserBlock', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/admin/users/${id}/block`, {}, { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const fetchAdminAnalytics = createAsyncThunk('admin/fetchAnalytics', async (timeRange = '30d', { rejectWithValue }) => {
  try {
    const res = await api.get(`/admin/analytics?timeRange=${timeRange}`, { headers: getAuthHeader() });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    ...initialState,
    analytics: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // PRODUCTS
    builder.addCase(fetchAdminProducts.pending, (state) => { state.loading = true; });
    builder.addCase(fetchAdminProducts.fulfilled, (state, action) => { state.loading = false; state.products = action.payload; });
    
    builder.addCase(addProduct.fulfilled, (state, action) => { state.products.push(action.payload); });
    builder.addCase(deleteProduct.fulfilled, (state, action) => { state.products = state.products.filter(p => p._id !== action.payload); });
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      const index = state.products.findIndex(p => p._id === action.payload._id);
      if (index !== -1) state.products[index] = action.payload;
    });

    // ORDERS
    builder.addCase(fetchAdminOrders.pending, (state) => { state.loading = true; });
    builder.addCase(fetchAdminOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; });

    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      const index = state.orders.findIndex(o => o._id === action.payload._id);
      if (index !== -1) state.orders[index] = action.payload;
    });
    
    builder.addCase(cancelOrder.fulfilled, (state, action) => {
      const index = state.orders.findIndex(o => o._id === action.payload._id);
      if (index !== -1) state.orders[index] = action.payload;
    });

    builder.addCase(approveReturn.fulfilled, (state, action) => {
      const index = state.orders.findIndex(o => o._id === action.payload._id);
      if (index !== -1) state.orders[index] = action.payload;
    });
    builder.addCase(rejectReturn.fulfilled, (state, action) => {
      const index = state.orders.findIndex(o => o._id === action.payload._id);
      if (index !== -1) state.orders[index] = action.payload;
    });

    // USERS
    builder.addCase(fetchAdminUsers.pending, (state) => { state.loading = true; });
    builder.addCase(fetchAdminUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; });
    builder.addCase(deleteUser.fulfilled, (state, action) => { state.users = state.users.filter(u => u._id !== action.payload); });
    
    builder.addCase(makeAdmin.fulfilled, (state, action) => {
      const index = state.users.findIndex(u => u._id === action.payload._id);
      if (index !== -1) {
         state.users[index] = { ...state.users[index], isAdmin: action.payload.isAdmin };
      }
    });

    builder.addCase(removeAdmin.fulfilled, (state, action) => {
      const index = state.users.findIndex(u => u._id === action.payload._id);
      if (index !== -1) {
         state.users[index] = { ...state.users[index], isAdmin: action.payload.isAdmin };
      }
    });

    builder.addCase(toggleUserBlock.fulfilled, (state, action) => {
      const index = state.users.findIndex(u => u._id === action.payload._id);
      if (index !== -1) {
         state.users[index] = action.payload;
      }
    });

    // ANALYTICS
    builder.addCase(fetchAdminAnalytics.pending, (state) => { state.loading = true; });
    builder.addCase(fetchAdminAnalytics.fulfilled, (state, action) => { state.loading = false; state.analytics = action.payload; });
  }
});

export default adminSlice.reducer;
