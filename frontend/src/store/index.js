import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import adminReducer from './slices/adminSlice';
import orderReducer from './slices/orderSlice';
import productReducer from './slices/productSlice';
import employeeReducer from './slices/employeeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    admin: adminReducer,
    orders: orderReducer,
    products: productReducer,
    employee: employeeReducer,
  },
});
