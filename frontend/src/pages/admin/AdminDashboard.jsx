import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import { fetchAdminProducts, fetchAdminOrders, addProduct, updateProduct, deleteProduct, updateOrderStatus, cancelOrder, approveReturn, rejectReturn, fetchAdminUsers, deleteUser, makeAdmin, removeAdmin, fetchAdminAnalytics, toggleUserBlock } from '@/store/slices/adminSlice';
import { updateEstimatedDeliveryDate } from '@/store/slices/orderSlice';

import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee, fetchStaffDeliveryPersons } from '@/store/slices/employeeSlice';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Plus, Trash2, Edit, TrendingUp, XCircle, Settings2, CalendarDays, RefreshCcw, CheckCircle, Search, Bell, UserCog } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';
import api from '@/services/api';

// Extracted Components
import ProductManager from '@/components/dashboard/ProductManager';
import UserManager from '@/components/dashboard/UserManager';
import OrderManager from '@/components/dashboard/OrderManager';
import ReturnManager from '@/components/dashboard/ReturnManager';
import EmployeeManager from '@/components/dashboard/EmployeeManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('30d');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector(state => state.auth);
  const { products, orders, users, analytics } = useSelector(state => state.admin);
  const { employees, deliveryPersons } = useSelector(state => state.employee);

  // Stats calculation
  const totalRevenue = analytics?.totalStats?.totalRevenue || 0;
  const totalOrders = analytics?.totalStats?.totalOrders || 0;
  const totalUsers = users.length;
  const totalReturns = analytics?.totalStats?.totalReturns || 0;

  const pieData = [
    { name: 'Fulfilled', value: Math.max(0, totalOrders - totalReturns) },
    { name: 'Returns', value: totalReturns }
  ];
  const PIE_COLORS = ['#000000', '#C9A44C'];

  useEffect(() => {
    dispatch(fetchAdminOrders());
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminUsers());
    dispatch(fetchEmployees());
    dispatch(fetchStaffDeliveryPersons());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAdminAnalytics(timeRange));
  }, [dispatch, timeRange]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dossier', icon: LayoutDashboard },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Acquisitions', icon: ShoppingCart },
    { id: 'returns', label: 'Concierge Returns', icon: RefreshCcw },
    { id: 'users', label: 'Client Registry', icon: Users },
    { id: 'employees', label: 'Staff Control', icon: UserCog },
  ];

  return (
    <div className="bg-[#FBFBFB] min-h-screen flex flex-col lg:flex-row">

      {/* Sidebar - Left */}
      <aside className="w-full lg:w-72 bg-black text-white shrink-0 flex flex-col pt-12 pb-8 px-8 border-r border-white/5 z-20">
        <div className="flex items-center gap-4 mb-16 pb-8 border-b border-white/10">
          <div className="w-10 h-10 bg-[var(--accent)] text-black rounded-sm flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(201,164,76,0.2)]">
            DT
          </div>
          <div>
            <span className="font-bold text-sm tracking-[0.3em] uppercase block">Console</span>
            <span className="text-[8px] text-gray-500 tracking-[0.4em] uppercase font-medium">Bespoke Admin</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-3">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex items-center gap-5 p-4 rounded-sm transition-all duration-300 relative ${activeTab === item.id
                    ? 'text-white'
                    : 'text-gray-500 hover:text-white'
                  }`}
              >
                {activeTab === item.id && (
                  <div className="absolute left-[-32px] w-1 h-6 bg-[var(--accent)] rounded-r-full" />
                )}
                <Icon className={`w-4 h-4 transition-colors duration-300 ${activeTab === item.id ? 'text-[var(--accent)]' : 'group-hover:text-[var(--accent)]'}`} />
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-8 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-5 p-4 rounded-sm text-gray-500 hover:text-rose-500 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md px-10 py-6 flex justify-between items-center border-b border-gray-100 z-10">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 mb-1">
              Internal Registry / {activeTab}
            </h2>
            <h1 className="text-xl font-bold uppercase tracking-widest text-black">
              Managed {activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-10">
            <div className="hidden md:flex items-center gap-6">
              <Search className="w-4 h-4 text-gray-300 cursor-pointer hover:text-black transition-colors" />
              <div className="relative">
                <Bell className="w-4 h-4 text-gray-300 cursor-pointer hover:text-black transition-colors" />
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
              </div>
            </div>
            <div className="flex items-center gap-4 pl-10 border-l border-gray-100">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black mb-0.5">{user?.name || 'Grandmaster'}</p>
                <p className="text-[8px] text-[var(--accent)] uppercase tracking-[0.2em] font-bold">Legacy Role</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--bg-soft)] border border-gray-100 flex items-center justify-center overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=F5F5F5&color=000&bold=true`} alt="avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <Container className="!px-0 !max-w-none">

            {/* --- DASHBOARD TAB --- */}
            {activeTab === 'dashboard' && (
              <div className="space-y-12 fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Snapshot / {timeRange}</h3>
                  <div className="flex bg-white p-1 rounded-sm border border-gray-100">
                    {['7d', '30d', '12m'].map(range => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-1.5 rounded-sm text-[8px] font-bold uppercase tracking-widest transition-all ${timeRange === range ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-white p-10 border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                    <div className="flex justify-between items-start mb-10">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">Net Revenue</p>
                      <span className="text-lg font-bold text-[var(--accent)] leading-none">₹</span>
                    </div>
                    <h3 className="text-3xl font-bold text-black tracking-tight">Rs. {new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(totalRevenue)}</h3>
                    <p className="text-[9px] text-emerald-500 font-bold mt-2 uppercase tracking-widest">+12.5% vs Last Period</p>
                  </div>

                  <div className="bg-white p-10 border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                    <div className="flex justify-between items-start mb-10">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">Total Acquisitions</p>
                      <ShoppingCart className="w-4 h-4 text-black" />
                    </div>
                    <h3 className="text-3xl font-bold text-black tracking-tight">{totalOrders.toLocaleString()}</h3>
                    <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Global Registry</p>
                  </div>

                  <div className="bg-white p-10 border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                    <div className="flex justify-between items-start mb-10">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">Returns</p>
                      <XCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-black tracking-tight">{totalReturns.toLocaleString()}</h3>
                    <div className="w-full bg-gray-100 h-1 mt-4">
                      <div className="bg-amber-500 h-full" style={{ width: `${(totalReturns / totalOrders) * 100}%` }} />
                    </div>
                  </div>

                  <div className="bg-white p-10 border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                    <div className="flex justify-between items-start mb-10">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">Client Base</p>
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-black tracking-tight">{totalUsers.toLocaleString()}</h3>
                    <p className="text-[9px] text-emerald-500 font-bold mt-2 uppercase tracking-widest">+4 New Today</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white border border-gray-100 p-10">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black">Revenue Trajectory</h3>
                      <TrendingUp className="w-3 h-3 text-[var(--accent)]" />
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics?.dailyRevenue || []}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C9A44C" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#C9A44C" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                          <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 600 }} dx={-10} tickFormatter={(val) => `Rs. ${val / 1000}k`} />
                          <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #F3F4F6', boxShadow: 'none', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                          <Area type="monotone" dataKey="revenue" stroke="#C9A44C" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 p-10 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black">Registry Mix</h3>
                      <RefreshCcw className="w-3 h-3 text-gray-300" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center">
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-8 w-full mt-8">
                        {pieData.map((d, i) => (
                          <div key={i} className="text-center">
                            <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold mb-1">{d.name}</p>
                            <p className="text-sm font-bold text-black">{d.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 overflow-hidden">
                  <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black">Recent Acquisitions</h3>
                    <button className="text-[10px] uppercase tracking-widest font-bold text-[var(--accent)] border-b border-[var(--accent)] pb-0.5">View Registry</button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {orders.slice(0, 5).map(order => (
                      <div key={order._id} className="p-8 flex items-center justify-between hover:bg-[#FBFBFB] transition-colors duration-300 group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-[var(--bg-soft)] rounded-sm flex items-center justify-center p-3">
                            <img src={getImageUrl(order.orderItems?.[0]?.image)} className="w-full h-full object-contain mix-blend-darken" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-black uppercase tracking-wider">Ref: {order._id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1 font-bold">{order.userId?.name || 'Authorized Client'} • {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-black tracking-widest">Rs. {order.totalPrice?.toLocaleString()}</p>
                          <span className="text-[8px] uppercase tracking-widest text-[var(--accent)] font-bold">Processed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- PRODUCTS TAB --- */}
            {activeTab === 'products' && (
              <ProductManager 
                products={products} 
                dispatch={dispatch} 
                onAdd={addProduct} 
                onUpdate={updateProduct} 
                onDelete={deleteProduct} 
              />
            )}

            {/* --- ORDERS TAB --- */}
            {activeTab === 'orders' && (
              <OrderManager orders={orders} dispatch={dispatch} deliveryPersons={deliveryPersons} fetchOrders={() => dispatch(fetchAdminOrders())} />
            )}

            {/* --- RETURNS TAB --- */}
            {activeTab === 'returns' && (
              <ReturnManager orders={orders} dispatch={dispatch} />
            )}

            {/* --- USERS TAB --- */}
            {activeTab === 'users' && (
              <UserManager 
                users={users || []} 
                dispatch={dispatch} 
                toggleBlockAction={toggleUserBlock}
                deleteAction={deleteUser}
                makeAdminAction={makeAdmin}
                removeAdminAction={removeAdmin}
                showAdminActions={true}
              />
            )}

            {/* --- EMPLOYEES TAB --- */}
            {activeTab === 'employees' && <EmployeeManager employees={employees || []} dispatch={dispatch} />}

          </Container>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
