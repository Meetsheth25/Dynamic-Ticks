import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

const empFromStorage = localStorage.getItem('employeeInfo')
  ? JSON.parse(localStorage.getItem('employeeInfo'))
  : null;

const initialState = {
  employee: empFromStorage,
  employees: [],
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

// ─── ADMIN CRUD ───────────────────────────────────────────────────────────────
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
    // Login
    builder
      .addCase(loginEmployee.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
        localStorage.setItem('employeeInfo', JSON.stringify(action.payload));
      })
      .addCase(loginEmployee.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || action.payload; });

    // Fetch All
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployees.fulfilled, (state, action) => { state.loading = false; state.employees = action.payload; })
      .addCase(fetchEmployees.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Create
    builder
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      });

    // Update
    builder
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.employees.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.employees[idx] = action.payload;
      });

    // Delete
    builder
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(e => e._id !== action.payload);
      });
  },
});

export const { logoutEmployee, clearEmployeeError } = employeeSlice.actions;
export default employeeSlice.reducer;
