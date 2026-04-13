import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RootLayout from '@/layouts/RootLayout';
import { Toaster } from 'react-hot-toast';

// Lazy loading all pages for better performance
const Home = lazy(() => import('@/pages/customer/Home'));
const Catalog = lazy(() => import('@/pages/customer/Catalog'));
const ProductDetail = lazy(() => import('@/pages/customer/ProductDetail'));
const Cart = lazy(() => import('@/pages/customer/Cart'));
const Checkout = lazy(() => import('@/pages/customer/Checkout'));
const Orders = lazy(() => import('@/pages/customer/Orders'));
const OrderDetails = lazy(() => import('@/pages/customer/OrderDetails'));
const ReturnProduct = lazy(() => import('@/pages/customer/ReturnProduct'));
const Login = lazy(() => import('@/pages/Auth/Login'));
const Register = lazy(() => import('@/pages/Auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/Auth/ForgotPassword'));
const VerifyOtp = lazy(() => import('@/pages/Auth/VerifyOtp'));
const ResetPassword = lazy(() => import('@/pages/Auth/ResetPassword'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const ManagerDashboard = lazy(() => import('@/pages/employee/ManagerDashboard'));
const StaffDashboard = lazy(() => import('@/pages/employee/StaffDashboard'));
const DeliveryDashboard = lazy(() => import('@/pages/employee/DeliveryDashboard'));
const About = lazy(() => import('@/pages/common/About'));
const Contact = lazy(() => import('@/pages/common/Contact'));
const Policy = lazy(() => import('@/pages/common/Policy'));
const ShippingStatus = lazy(() => import('@/pages/customer/ShippingStatus'));

// Loading Fallback Spinner
const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
    <div className="w-16 h-16 border-[1px] border-gray-100 border-t-[var(--accent)] rounded-full animate-spin mb-6"></div>
    <div className="flex flex-col items-center gap-2 animate-pulse">
      <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-black">Dynamic Ticks</span>
      <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400">Loading Heritage...</span>
    </div>
  </div>
);

const AdminRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || !userInfo.isAdmin) return <Navigate to="/" />;
  return children;
};

const PrivateRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo ? children : <Navigate to="/login" />;
};

// Employee routes — only allow if logged in + correct role
const EmployeeRoute = ({ children, role }) => {
  const empInfo = JSON.parse(localStorage.getItem("employeeInfo"));
  if (!empInfo) return <Navigate to="/login" />;
  if (role && empInfo.role !== role) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main Layout containing Navbar and Footer */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
            <Route path="order/:id" element={<PrivateRoute><OrderDetails /></PrivateRoute>} />
            <Route path="return/:id" element={<PrivateRoute><ReturnProduct /></PrivateRoute>} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="policy" element={<Policy />} />
            <Route path="shipping-status" element={<ShippingStatus />} />
            
            {/* Authentication Flows */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>
          
          {/* Admin Flows using separate layout implicitly */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Employee Flows */}
          <Route path="/manager/dashboard" element={<EmployeeRoute role="manager"><ManagerDashboard /></EmployeeRoute>} />
          <Route path="/staff/dashboard" element={<EmployeeRoute role="staff"><StaffDashboard /></EmployeeRoute>} />
          <Route path="/delivery/dashboard" element={<EmployeeRoute role="delivery"><DeliveryDashboard /></EmployeeRoute>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
