import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

const empFromStorage = localStorage.getItem('employeeInfo')
  ? JSON.parse(localStorage.getItem('employeeInfo'))
  : null;

const initialState = {
  employee: empFromStorage,
  employees: [],
  managerProducts: [],
  users: [],
  returns: [],
  reviews: [],
  orders: [],
  deliveryPersons: [],
  loading: false,
  error: null,
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginEmployee = createAsyncThunk(
  'employee/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/employees/login', { email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || err.message,
        status: err.response?.status
      });
    }
  }
);

// ─── ADMIN CRUD (Managing Employees) ───────────────────────────────────────────
export const fetchEmployees = createAsyncThunk(
  'employee/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/employees');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employee/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/employees', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employee/update',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/employees/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employee/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── MANAGER PRODUCT CRUD ───────────────────────────────────────────────────
export const fetchManagerProducts = createAsyncThunk(
  'employee/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/employees/manager/products');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addManagerProduct = createAsyncThunk(
  'employee/addProduct',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/employees/manager/products', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateManagerProduct = createAsyncThunk(
  'employee/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/employees/manager/products/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteManagerProduct = createAsyncThunk(
  'employee/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/manager/products/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── MANAGER RETURN ACTIONS ───────────────────────────────────────────────
export const fetchManagerReturns = createAsyncThunk(
  'employee/fetchReturns',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/employees/manager/returns');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const managerDecisionReturn = createAsyncThunk(
  'employee/decisionReturn',
  async ({ id, decision }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/employees/manager/returns/${id}/approve`, { adminDecision: decision });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const managerRejectReturn = createAsyncThunk(
  'employee/rejectReturn',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/employees/manager/returns/${id}/reject`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── STAFF ACTION THUNKS ─────────────────────────────────────────────────
export const fetchStaffOrders = createAsyncThunk(
  'employee/fetchStaffOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/employees/staff/orders');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateStaffOrderStatus = createAsyncThunk(
  'employee/updateStaffOrder',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/employees/staff/orders/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStaffDeliveryPersons = createAsyncThunk(
  'employee/fetchDeliveryPersons',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/employees/staff/delivery-persons');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── DELIVERY ACTION THUNKS ───────────────────────────────────────────────
export const fetchDeliveryOrders = createAsyncThunk(
  'employee/fetchDeliveryOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/employees/delivery/orders');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateDeliveryStatus = createAsyncThunk(
  'employee/updateDeliveryStatus',
  async ({ id, deliveryStatus }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/employees/delivery/orders/${id}`, { deliveryStatus });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── USER MANAGEMENT (MANAGER/STAFF) ───────────────────────────────────────────
export const fetchUsersForEmployee = createAsyncThunk(
  'employee/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/employees/users');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const toggleUserBlockForEmployee = createAsyncThunk(
  'employee/toggleUserBlock',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/employees/users/${id}/block`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── SHARED ACTIONS (REVIEWS) ──────────────────────────────────────────────
export const fetchEmployeeReviews = createAsyncThunk(
  'employee/fetchReviews',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/employees/reviews');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const employeeDeleteReview = createAsyncThunk(
  'employee/deleteReview',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/reviews/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── SLICE ────────────────────────────────────────────────────────────────────
const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    logoutEmployee: (state) => {
      state.employee = null;
      localStorage.removeItem('employeeInfo');
    },
    clearEmployeeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Shared Loading/Error Handling
    const setPending = (state) => { state.loading = true; state.error = null; };
    const setRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      // Auth
      .addCase(loginEmployee.pending, setPending)
      .addCase(loginEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
        localStorage.setItem('employeeInfo', JSON.stringify(action.payload));
      })
      .addCase(loginEmployee.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || action.payload; })

      // Admin Management
      .addCase(fetchEmployees.pending, setPending)
      .addCase(fetchEmployees.fulfilled, (state, action) => { state.loading = false; state.employees = action.payload; })
      .addCase(fetchEmployees.rejected, setRejected)
      .addCase(createEmployee.fulfilled, (state, action) => { state.employees.push(action.payload); })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.employees.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.employees[idx] = action.payload;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(e => e._id !== action.payload);
      })

      // Manager Products
      .addCase(fetchManagerProducts.pending, setPending)
      .addCase(fetchManagerProducts.fulfilled, (state, action) => { state.loading = false; state.managerProducts = action.payload; })
      .addCase(fetchManagerProducts.rejected, setRejected)
      .addCase(addManagerProduct.fulfilled, (state, action) => { state.managerProducts.push(action.payload); })
      .addCase(updateManagerProduct.fulfilled, (state, action) => {
        const idx = state.managerProducts.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.managerProducts[idx] = action.payload;
      })
      .addCase(deleteManagerProduct.fulfilled, (state, action) => {
        state.managerProducts = state.managerProducts.filter(p => p._id !== action.payload);
      })

      // Manager Returns
      .addCase(fetchManagerReturns.pending, setPending)
      .addCase(fetchManagerReturns.fulfilled, (state, action) => { state.loading = false; state.returns = action.payload; })
      .addCase(fetchManagerReturns.rejected, setRejected)
      .addCase(managerDecisionReturn.fulfilled, (state, action) => {
        state.returns = state.returns.filter(r => r._id !== action.payload._id);
      })
      .addCase(managerRejectReturn.fulfilled, (state, action) => {
        state.returns = state.returns.filter(r => r._id !== action.payload._id);
      })

      // Staff Orders
      .addCase(fetchStaffOrders.pending, setPending)
      .addCase(fetchStaffOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchStaffOrders.rejected, setRejected)
      .addCase(updateStaffOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })

      // Staff Delivery Persons
      .addCase(fetchStaffDeliveryPersons.fulfilled, (state, action) => { state.deliveryPersons = action.payload; })

      // Delivery Orders
      .addCase(fetchDeliveryOrders.pending, setPending)
      .addCase(fetchDeliveryOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchDeliveryOrders.rejected, setRejected)
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })

      // User Management
      .addCase(fetchUsersForEmployee.pending, setPending)
      .addCase(fetchUsersForEmployee.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(fetchUsersForEmployee.rejected, setRejected)
      .addCase(toggleUserBlockForEmployee.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })

      // Reviews
      .addCase(fetchEmployeeReviews.pending, setPending)
      .addCase(fetchEmployeeReviews.fulfilled, (state, action) => { state.loading = false; state.reviews = action.payload; })
      .addCase(fetchEmployeeReviews.rejected, setRejected)
      .addCase(employeeDeleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      });
  },
});

export const { logoutEmployee, clearEmployeeError } = employeeSlice.actions;
export default employeeSlice.reducer;
