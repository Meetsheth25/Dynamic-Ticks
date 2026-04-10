import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import { fetchAdminProducts, fetchAdminOrders, addProduct, updateProduct, deleteProduct, updateOrderStatus, cancelOrder, approveReturn, rejectReturn, fetchAdminUsers, deleteUser, makeAdmin, removeAdmin, fetchAdminAnalytics } from '@/store/slices/adminSlice';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '@/store/slices/employeeSlice';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Plus, Trash2, Edit, TrendingUp, DollarSign, XCircle, Settings2, CalendarDays, RefreshCcw, CheckCircle, Search, Bell, UserCog } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('30d');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector(state => state.auth);
  const { products, orders, users, analytics } = useSelector(state => state.admin);
  const { employees } = useSelector(state => state.employee);
  const [deliveryPersons, setDeliveryPersons] = useState([]);

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
    fetchDeliveryPersons();
  }, [dispatch]);

  const fetchDeliveryPersons = async () => {
    try {
      const { data } = await api.get('/employees/staff/delivery-persons');
      setDeliveryPersons(data);
    } catch (err) { console.error("Failed to fetch delivery persons", err); }
  };

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
                className={`group flex items-center gap-5 p-4 rounded-sm transition-all duration-300 relative ${
                  activeTab === item.id 
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
                      <DollarSign className="w-4 h-4 text-[var(--accent)]"/>
                    </div>
                    <h3 className="text-3xl font-bold text-black tracking-tight">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalRevenue)}</h3>
                    <p className="text-[9px] text-emerald-500 font-bold mt-2 uppercase tracking-widest">+12.5% vs Last Period</p>
                  </div>

                  <div className="bg-white p-10 border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                    <div className="flex justify-between items-start mb-10">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">Total Acquisitions</p>
                      <ShoppingCart className="w-4 h-4 text-black"/>
                    </div>
                    <h3 className="text-3xl font-bold text-black tracking-tight">{totalOrders.toLocaleString()}</h3>
                    <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Global Registry</p>
                  </div>

                  <div className="bg-white p-10 border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                    <div className="flex justify-between items-start mb-10">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">Returns</p>
                      <XCircle className="w-4 h-4 text-amber-500"/>
                    </div>
                    <h3 className="text-3xl font-bold text-black tracking-tight">{totalReturns.toLocaleString()}</h3>
                    <div className="w-full bg-gray-100 h-1 mt-4">
                       <div className="bg-amber-500 h-full" style={{ width: `${(totalReturns/totalOrders)*100}%` }} />
                    </div>
                  </div>

                  <div className="bg-white p-10 border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                    <div className="flex justify-between items-start mb-10">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">Client Base</p>
                      <Users className="w-4 h-4 text-blue-500"/>
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
                              <stop offset="5%" stopColor="#C9A44C" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#C9A44C" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                          <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 600 }} dx={-10} tickFormatter={(val) => `₹${val / 1000}k`} />
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
                               <p className="text-xs font-bold text-black uppercase tracking-wider">Ref: {order._id.substring(0,8).toUpperCase()}</p>
                               <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1 font-bold">{order.userId?.name || 'Authorized Client'} • {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-bold text-black tracking-widest">₹{order.totalPrice?.toLocaleString()}</p>
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
              <ProductManager products={products} dispatch={dispatch} />
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
            {activeTab === 'users' && <UserManager users={users || []} dispatch={dispatch} />}

            {/* --- EMPLOYEES TAB --- */}
            {activeTab === 'employees' && <EmployeeManager employees={employees || []} dispatch={dispatch} />}

          </Container>
        </div>
      </main>
    </div>
  );
};

// Sub-components mapped to external file components for logic separation

const ProductManager = ({ products, dispatch }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'luxury',
    price: '',
    description: '',
    countInStock: 0,
    returnAvailable: false,
    returnDays: 0,
    returnHours: 0
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleEdit = (product) => {
    setIsAdding(true);
    setEditingId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || '',
      countInStock: product.countInStock || 0,
      returnAvailable: product.returnAvailable || false,
      returnDays: product.returnDays || 0,
      returnHours: product.returnHours || 0,
    });
    const existingImages = (product.images || (product.image ? [product.image] : [])).map(img => 
      getImageUrl(img)
    );
    setImagePreviews(existingImages);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '', category: 'luxury', price: '', description: '',
      countInStock: 0, returnAvailable: false, returnDays: 0, returnHours: 0
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    console.log("FILES SELECTED:", newFiles.length);
    
    setImageFiles(prev => {
      const updated = [...prev, ...newFiles].slice(0, 5); // Limit to 5
      console.log("TOTAL FILES STAGED:", updated.length);
      return updated;
    });
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => {
      const updated = [...prev, ...newPreviews].slice(0, 5);
      return updated;
    });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', Number(formData.price));
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('countInStock', formData.countInStock);
    formDataToSend.append('returnAvailable', formData.returnAvailable);
    formDataToSend.append('returnDays', formData.returnDays);
    formDataToSend.append('returnHours', formData.returnHours);
    
    if (imageFiles.length > 0) {
      console.log("APPENDING FILES:", imageFiles.length);
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });
    }

    console.log("SENDING FORMDATA...");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value instanceof File ? value.name : value);
    }

    if (editingId) {
      dispatch(updateProduct({ id: editingId, data: formDataToSend }));
    } else {
      dispatch(addProduct(formDataToSend));
    }
    resetForm();
  };

  return (
    <div className="space-y-12 fade-in">
      <div className="flex justify-between items-end border-b border-gray-100 pb-10">
        <div>
           <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Vault Registry</h3>
           <h2 className="text-2xl font-bold uppercase tracking-widest text-black">{editingId ? 'Modify Piece' : 'Inventory Asset Management'}</h2>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="bg-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[var(--accent)] transition-all duration-300 flex items-center gap-3">
            <Plus className="w-3 h-3" /> New Asset
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white border border-gray-100 p-12 relative">
          <button type="button" onClick={resetForm} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
          
          <form onSubmit={handleAdd} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black border-b border-gray-50 pb-4">Essential Attributes</h3>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Model Designation</label>
                  <input className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Chronos Legacy" required />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Valuation (INR)</label>
                    <input type="number" className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="00.00" required />
                  </div>
                  <div className="group">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Collection</label>
                    <select className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      <option value="luxury">Luxury Elite</option>
                      <option value="sport">Precision Sport</option>
                      <option value="classic">Heritage Classic</option>
                      <option value="smart">Digital Vanguard</option>
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Asset Narrative</label>
                  <textarea className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-medium text-black focus:outline-none focus:border-[var(--accent)] transition-colors h-32 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Detailed specifications and heritage..." />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black border-b border-gray-50 pb-4">Visual & Stock</h3>
              
              <div className="group border-2 border-dashed border-gray-50 p-6 bg-[#FBFBFB]">
                <div className="flex flex-wrap gap-4 mb-6">
                  {imagePreviews.map((prev, idx) => (
                    <div key={idx} className="w-20 h-20 border border-gray-100 bg-white p-2 relative group/item">
                       <img src={prev} className="w-full h-full object-contain" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[6px] text-white uppercase font-bold tracking-tighter">Primary</span>
                       </div>
                    </div>
                  ))}
                  <label className="w-20 h-20 border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-black transition-colors bg-white">
                    <Plus className="w-4 h-4 text-gray-300" />
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                <p className="text-[7px] uppercase tracking-[0.3em] text-gray-300 font-bold text-center">Stage up to 5 high-resolution visuals</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Vault Quantity</label>
                    <input type="number" className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.countInStock} onChange={(e) => setFormData({...formData, countInStock: e.target.value})} placeholder="0" />
                </div>
                <div className="flex items-center gap-3">
                   <input type="checkbox" id="ret-av" checked={formData.returnAvailable} onChange={(e) => setFormData({...formData, returnAvailable: e.target.checked})} className="accent-black w-4 h-4 cursor-pointer" />
                   <label htmlFor="ret-av" className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 cursor-pointer">Escrow Protection</label>
                </div>
              </div>

              {formData.returnAvailable && (
                <div className="grid grid-cols-2 gap-6 slide-down">
                  <div className="group">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Return window (Days)</label>
                    <input type="number" className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.returnDays} onChange={(e) => setFormData({...formData, returnDays: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="pt-10">
                <button type="submit" className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[var(--accent)] transition-all duration-500 shadow-xl">
                  {editingId ? 'Authenticating Changes' : 'Legitimize Asset'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Asset</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Collection</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Valuation</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Vault</th>
                <th className="p-6 text-right text-[9px] uppercase tracking-[0.3em] font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product._id} className="group hover:bg-[#FBFBFB] transition-colors duration-300">
                  <td className="p-6">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 bg-[var(--bg-soft)] rounded-sm p-3 group-hover:scale-110 transition-transform duration-500">
                          <img src={getImageUrl(product.images?.[0] || product.image)} className="w-full h-full object-contain mix-blend-darken" alt={product.name} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-black uppercase tracking-wider">{product.name}</p>
                          <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1 font-bold">ID: {product._id.substring(0,10)}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold px-3 py-1 border border-gray-100">{product.category}</span>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-black tracking-widest">₹{product.price?.toLocaleString()}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2">
                       <div className="w-20 bg-gray-50 h-1 overflow-hidden">
                          <div className={`h-full ${product.countInStock < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (product.countInStock/20)*100)}%` }} />
                       </div>
                       <p className="text-[8px] uppercase tracking-widest font-bold text-gray-400">{product.countInStock} Units Available</p>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(product)} className="p-3 text-gray-300 hover:text-black hover:bg-white transition-all duration-300 border border-transparent hover:border-gray-100">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { if(window.confirm('Decommission this asset?')) dispatch(deleteProduct(product._id)) }} className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 border border-transparent hover:border-rose-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="5" className="p-20 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">No Assets Registered in Vault</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OrderManager = ({ orders, dispatch, deliveryPersons, fetchOrders }) => {
  return (
    <div className="space-y-12 fade-in">
      <div className="border-b border-gray-100 pb-10">
         <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Transaction Ledger</h3>
         <h2 className="text-2xl font-bold uppercase tracking-widest text-black">Acquisition Fulfillment</h2>
      </div>
      
      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Ref ID</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Beneficiary</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Asset Value</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Configuration</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Status</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Delivery</th>
                <th className="p-6 text-right text-[9px] uppercase tracking-[0.3em] font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order._id} className="group hover:bg-[#FBFBFB] transition-colors duration-300">
                  <td className="p-6 text-[10px] font-bold text-black border-r border-gray-50 uppercase tracking-widest bg-gray-50/30 font-mono">
                    {order._id.substring(0,12)}...
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-black uppercase tracking-wider">{order.userId?.name || 'Exclusive Client'}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1 font-bold">{order.userId?.email || 'Unauthorized'}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-black tracking-widest">₹{order.totalPrice?.toLocaleString()}</p>
                    <span className="text-[8px] uppercase tracking-widest text-emerald-500 font-bold">Authorized</span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-3">
                      {order.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                           <span className="text-[10px] font-bold text-black uppercase tracking-tight">{item.name}</span>
                           <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Units: {item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-6">
                    <select 
                      value={order.status}
                      onChange={(e) => dispatch(updateOrderStatus({ id: order._id, status: e.target.value }))}
                      className={`text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-sm border-0 outline-none shadow-sm cursor-pointer transition-colors appearance-none text-center min-w-[120px] ${
                        order.status === 'processing' ? 'bg-amber-50 text-amber-600' : 
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-600' : 
                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <option value="processing">Awaiting Prep</option>
                      <option value="shipped">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Voided</option>
                    </select>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      <select
                        style={{ 
                          background: 'rgba(0,0,0,0.03)', 
                          border: '1px solid rgba(0,0,0,0.05)', 
                          borderRadius: '4px', 
                          padding: '4px 8px', 
                          fontSize: '9px', 
                          fontWeight: 'bold', 
                          color: '#000', 
                          appearance: 'none',
                          opacity: order.assignedDeliveryPerson ? 0.6 : 1,
                          cursor: order.assignedDeliveryPerson ? 'not-allowed' : 'pointer'
                        }}
                        value={order.assignedDeliveryPerson?._id || ''}
                        disabled={!!order.assignedDeliveryPerson}
                        onChange={async (e) => {
                          if (!e.target.value) return;
                          try {
                            await api.put(`/employees/staff/orders/${order._id}`, { assignedDeliveryPerson: e.target.value });
                            fetchOrders();
                          } catch (err) { alert(err.response?.data?.message || err.message); }
                        }}
                      >
                        <option value="">{order.assignedDeliveryPerson ? order.assignedDeliveryPerson.name : '— Assign —'}</option>
                        {!order.assignedDeliveryPerson && deliveryPersons.map(dp => (
                          <option key={dp._id} value={dp._id}>{dp.name} ({dp.activeDeliveries || 0} active)</option>
                        ))}
                      </select>
                      {order.assignedDeliveryPerson && (
                        <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest text-center">Assigned to {order.assignedDeliveryPerson.name}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    {order.status !== 'cancelled' && (
                       <button 
                         onClick={() => dispatch(cancelOrder(order._id))}
                         className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 border border-transparent hover:border-rose-100"
                         title="Void Transaction"
                       >
                         <XCircle className="w-4 h-4" />
                       </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">No Transactions in Ledger</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReturnManager = ({ orders, dispatch, analytics }) => {
  const returnOrders = orders.filter(o => o.returnRequest);

  return (
    <div className="space-y-12 fade-in">
      <div className="border-b border-gray-100 pb-10">
         <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Concierge Service</h3>
         <h2 className="text-2xl font-bold uppercase tracking-widest text-black">Asset Returns & Exchanges</h2>
      </div>

      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Ref ID</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Client</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Asset</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Justification</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Resolution</th>
                <th className="p-6 text-right text-[9px] uppercase tracking-[0.3em] font-bold text-white">Finalize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {returnOrders.map((order) => (
                <tr key={order._id} className="group hover:bg-[#FBFBFB] transition-colors duration-300">
                  <td className="p-6 text-[10px] font-bold text-gray-400 border-r border-gray-50 uppercase tracking-widest font-mono">
                    {order._id.substring(0,8)}...
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-black uppercase tracking-wider">{order.userId?.name || 'Authorized Client'}</p>
                    <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-sm ${order.returnRequest?.adminDecision === 'exchange' ? 'bg-blue-50 text-blue-600' : order.returnRequest?.adminDecision === 'refund' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                      {order.returnRequest?.adminDecision || 'Pending Audit'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-3">
                      {order.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[var(--bg-soft)] rounded-sm p-2">
                             <img src={getImageUrl(item.image)} className="w-full h-full object-contain mix-blend-darken" />
                          </div>
                          <span className="text-[10px] font-bold text-black uppercase tracking-tight">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-[10px] font-bold text-black uppercase tracking-wider mb-1">{order.returnRequest?.reason || 'Asset Quality'}</p>
                    <p className="text-[9px] text-gray-400 font-medium leading-relaxed max-w-[200px]">{order.returnRequest?.description || 'No detailed brief provided.'}</p>
                  </td>
                  <td className="p-6 text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    {new Date(order.returnRequest?.requestedAt || order.updatedAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-6 text-right">
                    {order.status === 'return_requested' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => dispatch(approveReturn({ id: order._id, adminDecision: 'refund' }))} className="text-[8px] font-bold text-amber-600 bg-amber-50 px-4 py-2 hover:bg-amber-100 transition-colors uppercase tracking-widest">
                          Liquidate
                        </button>
                        <button onClick={() => dispatch(approveReturn({ id: order._id, adminDecision: 'exchange' }))} className="text-[8px] font-bold text-blue-600 bg-blue-50 px-4 py-2 hover:bg-blue-100 transition-colors uppercase tracking-widest">
                          Exchange
                        </button>
                        <button onClick={() => dispatch(rejectReturn(order._id))} className="text-[8px] font-bold text-rose-600 bg-rose-50 px-4 py-2 hover:bg-rose-100 transition-colors uppercase tracking-widest">
                          Deny
                        </button>
                      </div>
                    )}
                    {order.status === 'returned' && (
                      <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-4 py-2 uppercase tracking-widest">Finalized</span>
                    )}
                  </td>
                </tr>
              ))}
              {returnOrders.length === 0 && (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">No Returns in Queue</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UserManager = ({ users, dispatch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id.includes(searchTerm)
  );

  return (
    <div className="space-y-12 fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
         <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Heritage Ledger</h3>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-black">Client Registry</h2>
         </div>
         <div className="relative group w-full md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" />
            <input 
              type="text"
              placeholder="Search by Identity or ID..."
              className="w-full bg-white border border-gray-100 pl-12 pr-6 py-4 text-[10px] uppercase tracking-widest font-bold focus:border-black outline-none transition-all placeholder:text-gray-200 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>
      
      <div className="bg-white border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Beneficiary</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Authentication</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Acquisitions</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Privilege</th>
                <th className="p-6 text-right text-[9px] uppercase tracking-[0.3em] font-bold text-white">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user._id} className="group hover:bg-[#FBFBFB] transition-colors duration-300">
                  <td className="p-6">
                    <p className="text-xs font-bold text-black uppercase tracking-wider">{user.name}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1 font-bold font-mono">ID: {user._id.substring(0,10)}</p>
                  </td>
                  <td className="p-6 text-xs font-medium text-gray-500 uppercase tracking-tight italic">{user.email}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                       <span className="text-xs font-bold text-black">{user.totalOrders || 0}</span>
                       <div className="w-12 bg-gray-50 h-0.5"><div className="bg-black h-full" style={{ width: `${Math.min(100, (user.totalOrders || 0)*20)}%` }} /></div>
                    </div>
                  </td>
                  <td className="p-6">
                    {user.isAdmin ? (
                       <button onClick={() => { if(window.confirm('Revoke administrator status?')) dispatch(removeAdmin(user._id)); }} className="text-[8px] font-bold text-purple-600 bg-purple-50 px-4 py-2 hover:bg-purple-100 transition-colors uppercase tracking-widest border border-purple-100">Master Admin</button>
                    ) : (
                       <button onClick={() => { if(window.confirm('Promote this client to Administrator?')) dispatch(makeAdmin(user._id)); }} className="text-[8px] font-bold text-gray-400 bg-gray-50 px-4 py-2 hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-widest border border-gray-100">Authorize Staff</button>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => { if(window.confirm('Excommunicate this client?')) dispatch(deleteUser(user._id)) }}
                      className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 border border-transparent hover:border-rose-100 active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan="5" className="p-20 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">No Match in Registry</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── EMPLOYEE MANAGER ────────────────────────────────────────────────────────
const EmployeeManager = ({ employees, dispatch }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', isActive: true });

  useEffect(() => { dispatch(fetchEmployees()); }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEmp) {
      const payload = { id: editingEmp._id, name: form.name, email: form.email, role: form.role, isActive: form.isActive };
      if (form.password) payload.password = form.password;
      dispatch(updateEmployee(payload));
    } else {
      dispatch(createEmployee(form));
    }
    setShowForm(false);
    setEditingEmp(null);
    setForm({ name: '', email: '', password: '', role: 'staff', isActive: true });
  };

  const startEdit = (emp) => {
    setEditingEmp(emp);
    setForm({ name: emp.name, email: emp.email, password: '', role: emp.role, isActive: emp.isActive });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this employee?')) dispatch(deleteEmployee(id));
  };

  const toggleActive = (emp) => {
    dispatch(updateEmployee({ id: emp._id, isActive: !emp.isActive }));
  };

  const ROLE_STYLES = {
    manager: 'text-purple-600 bg-purple-50 border-purple-100',
    staff: 'text-blue-600 bg-blue-50 border-blue-100',
    delivery: 'text-amber-600 bg-amber-50 border-amber-100',
  };

  return (
    <div className="space-y-12 fade-in">
      <div className="flex justify-between items-end border-b border-gray-100 pb-10">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Human Resources</h3>
          <h2 className="text-2xl font-bold uppercase tracking-widest text-black">Staff Control Panel</h2>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditingEmp(null); setForm({ name: '', email: '', password: '', role: 'staff', isActive: true }); }}
            className="bg-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[var(--accent)] transition-all duration-300 flex items-center gap-3">
            <Plus className="w-3 h-3" /> Onboard Staff
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 p-10 relative">
          <button type="button" onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black border-b border-gray-50 pb-4 mb-8">
            {editingEmp ? 'Modify Employee Record' : 'New Employee Onboarding'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Email Address', key: 'email', type: 'email' },
              { label: editingEmp ? 'New Password (leave blank to keep)' : 'Password', key: 'password', type: 'password' },
            ].map(({ label, key, type }) => (
              <div key={key} className="group">
                <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">{label}</label>
                <input type={type} required={!editingEmp || key !== 'password'}
                  className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors"
                  value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="group">
              <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Role Assignment</label>
              <select className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer"
                value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="delivery">Delivery Person</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="emp-active" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-black w-4 h-4 cursor-pointer" />
              <label htmlFor="emp-active" className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 cursor-pointer">Active Employee</label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[var(--accent)] transition-all duration-500 shadow-xl">
                {editingEmp ? 'Update Record' : 'Register Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                {['Employee', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map(emp => (
                <tr key={emp._id} className="group hover:bg-[#FBFBFB] transition-colors duration-300">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs font-bold text-black uppercase tracking-wider">{emp.name}</p>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-gray-500 italic">{emp.email}</td>
                  <td className="p-6">
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 border ${ROLE_STYLES[emp.role] || 'text-gray-600 bg-gray-50 border-gray-100'}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <button onClick={() => toggleActive(emp)}
                      className={`text-[8px] font-bold uppercase tracking-widest px-4 py-2 transition-colors ${
                        emp.isActive ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                      }`}>
                      {emp.isActive ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(emp)} className="p-3 text-gray-300 hover:text-black hover:bg-white transition-all duration-300 border border-transparent hover:border-gray-100">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(emp._id)} className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 border border-transparent hover:border-rose-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan="5" className="p-20 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">No Employees Registered</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
