import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  logoutEmployee, 
  fetchUsersForEmployee, 
  toggleUserBlockForEmployee,
  fetchStaffOrders,
  fetchStaffDeliveryPersons,
  fetchEmployeeReviews,
  updateStaffOrderStatus,
  employeeDeleteReview
} from '@/store/slices/employeeSlice';
import { updateEstimatedDeliveryDate } from '@/store/slices/orderSlice';
import UserManager from '@/components/dashboard/UserManager';

const STATUS_OPTIONS = ['processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  processing: 'text-yellow-600 bg-yellow-50 border border-yellow-200',
  shipped: 'text-blue-600 bg-blue-50 border border-blue-200',
  delivered: 'text-green-600 bg-green-50 border border-green-200',
  cancelled: 'text-red-600 bg-red-50 border border-red-200',
  return_requested: 'text-purple-600 bg-purple-50 border border-purple-200',
  returned: 'text-gray-600 bg-gray-50 border border-gray-200',
};

const SIDEBAR = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'orders', label: 'All Orders', icon: '🛒' },
  { key: 'reviews', label: 'All Reviews', icon: '⭐' },
  { key: 'users', label: 'Client Registry', icon: '👥' },
];

export default function StaffDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    employee, 
    users, 
    orders, 
    deliveryPersons, 
    reviews, 
    loading: reduxLoading 
  } = useSelector(s => s.employee);

  const [tab, setTab] = useState('overview');
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!employee || employee.role !== 'staff') navigate('/login');
  }, [employee, navigate]);

  useEffect(() => {
    dispatch(fetchStaffOrders());
    dispatch(fetchStaffDeliveryPersons());
    if (tab === 'reviews') dispatch(fetchEmployeeReviews());
    if (tab === 'users') dispatch(fetchUsersForEmployee());
  }, [tab, dispatch]);

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await dispatch(employeeDeleteReview(id)).unwrap();
      setMsg('Review deleted.');
    } catch(err) {
      setMsg(err || 'Failed to delete review');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateStaffOrderStatus({ id, data: { status } })).unwrap();
      setMsg(`Order status updated to "${status}"`);
    } catch (err) {
      setMsg(err || 'Failed to update status');
    }
  };

  const handleAssignDelivery = async (id, personId) => {
    if (!personId) return;
    try {
      await dispatch(updateStaffOrderStatus({ id, data: { assignedDeliveryPerson: personId } })).unwrap();
      setMsg('Delivery person assigned successfully.');
    } catch (err) {
      setMsg(err || 'Failed to assign delivery person');
    }
  };

  const handleUpdateDate = async (orderId, date) => {
    try {
      await dispatch(updateEstimatedDeliveryDate({ id: orderId, dateData: { estimatedDeliveryDate: date } })).unwrap();
      setMsg('Delivery estimate updated');
      dispatch(fetchStaffOrders()); // Refresh list to get new dates
    } catch (err) {
      setMsg(err || 'Failed to update date');
    }
  };

  const filtered = filter === 'all' ? orders : (orders?.filter(o => o.status === filter) || []);

  const stats = {
    total: orders?.length || 0,
    processing: orders?.filter(o => o.status === 'processing').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    delivered: orders?.filter(o => o.status === 'delivered').length || 0,
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-black text-white flex-shrink-0 flex flex-col p-8 md:min-h-screen">
        <div className="mb-12">
          <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] mb-2 block">Portal</span>
          <h2 className="text-2xl font-light tracking-wider capitalize">{employee?.name}</h2>
          <div className="mt-4 border border-[var(--accent)] text-[var(--accent)] text-[10px] tracking-widest uppercase px-3 py-1 inline-block">Staff</div>
        </div>

        <nav className="space-y-4">
          {SIDEBAR.map(item => (
            <div 
              key={item.key} 
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-300 ${tab === item.key ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              onClick={() => setTab(item.key)}
            >
              <span className="text-sm">{item.icon}</span> 
              <span className="uppercase tracking-widest text-[10px] font-bold">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-white/10 mb-auto">
          <button 
            className="w-full text-left flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white transition-colors"
            onClick={() => { dispatch(logoutEmployee()); navigate('/login'); }}
          >
            <span className="text-sm">🚪</span>
            <span className="uppercase tracking-widest text-[10px] font-bold">Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-[#fafafa]">
        {msg && (
          <div className="mb-8 p-4 bg-black text-white text-xs tracking-widest uppercase flex justify-between items-center shadow-lg animate-fade-in">
            <span>{msg}</span>
            <button onClick={() => setMsg('')} className="text-white hover:text-[var(--accent)] transition-colors">✕</button>
          </div>
        )}

        {tab === 'overview' && (
          <div className="fade-in">
            <h1 className="text-3xl font-light mb-10 tracking-[0.1em] text-black">Staff Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Total Orders', val: stats.total },
                { label: 'Processing', val: stats.processing },
                { label: 'Shipped', val: stats.shipped },
                { label: 'Delivered', val: stats.delivered },
              ].map(item => (
                <div key={item.label} className="bg-white p-8 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">{item.label}</div>
                  <div className="text-4xl font-light">{item.val}</div>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 border border-black/5 shadow-sm">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6">🎯 Your Responsibilities</h3>
              <ul className="space-y-4 text-sm text-gray-600 tracking-wide">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-black rounded-full" /> Update order status (processing → shipped → delivered)</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-black rounded-full" /> Assign delivery persons to orders</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-black rounded-full" /> Stock is automatically reduced when order is shipped</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <h1 className="text-3xl font-light tracking-[0.1em] text-black">Order Management</h1>
              <div className="flex flex-wrap gap-4 items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Filter</span>
                <select 
                  className="bg-white border border-black/10 px-4 py-2 text-xs uppercase tracking-widest text-black outline-none focus:border-black transition-colors"
                  value={filter} 
                  onChange={e => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
                <button 
                  className="bg-black text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[var(--accent)] hover:text-black transition-colors border border-transparent"
                  onClick={() => dispatch(fetchStaffOrders())}
                >
                  Refresh
                </button>
              </div>
            </div>

            {reduxLoading ? <p className="text-sm tracking-widest uppercase text-gray-400">Loading...</p> : (
              !filtered || filtered.length === 0
                ? <div className="text-center py-20 text-gray-400 tracking-widest uppercase text-sm border border-dashed border-black/10">No orders found</div>
                : <div className="space-y-6">
                  {filtered.map(order => (
                    <div key={order._id} className="bg-white p-6 md:p-8 border border-black/5 shadow-sm flex flex-col lg:flex-row gap-8 justify-between hover:border-black/20 transition-colors">
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-medium tracking-wider">#{order._id.slice(-8)}</span>
                          <span className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 tracking-wide">
                          Customer: <strong className="text-black">{order.userId?.name}</strong> &middot; {order.userId?.email}
                        </div>
                        <div className="text-sm text-gray-500 tracking-wide">
                          Total: <strong className="text-black">Rs. {order.totalPrice?.toLocaleString()}</strong> &middot; {order.orderItems?.length} item(s)
                        </div>
                        {order.assignedDeliveryPerson && (
                          <div className="text-xs uppercase tracking-widest font-bold text-green-700 mt-2">
                            🚚 Delivery: {typeof order.assignedDeliveryPerson === 'object' ? order.assignedDeliveryPerson.name : 'Assigned'}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-6 min-w-[240px]">
                        <div>
                          <div className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-2">Update Status</div>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map(st => (
                              <button
                                key={st}
                                className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-colors border ${order.status === st ? 'bg-black text-white border-black' : 'bg-transparent text-gray-600 border-black/10 hover:border-black'}`}
                                onClick={() => handleStatusUpdate(order._id, st)}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-2">Assign Delivery Person</div>
                          <select
                            className="w-full bg-white border border-black/10 focus:border-black text-black px-3 py-2 text-[10px] uppercase font-bold tracking-widest outline-none transition-colors"
                            value={order.assignedDeliveryPerson?._id || order.assignedDeliveryPerson || ''}
                            onChange={e => handleAssignDelivery(order._id, e.target.value)}
                          >
                            <option value="">— Select Delivery Person —</option>
                            {deliveryPersons?.map(dp => (
                              <option key={dp._id} value={dp._id}>
                                {dp.name} ({dp.activeDeliveries || 0} active)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <div className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-2">Delivery Timeline</div>
                          <div className="flex items-center gap-3">
                            <input 
                              type="date"
                              className="bg-white border border-black/10 focus:border-black text-black px-3 py-2 text-[10px] uppercase font-bold tracking-widest outline-none transition-colors w-full"
                              value={order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : ''}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => handleUpdateDate(order._id, e.target.value)}
                            />
                            {order.estimatedDeliveryDate && (
                              <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold whitespace-nowrap">Early only</span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
            )}
          </div>
        )}
        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div className="fade-in">
            <h1 className="text-3xl font-light mb-10 tracking-[0.1em] text-black">Product Reviews</h1>
            
            {reduxLoading ? <p className="text-sm tracking-widest uppercase text-gray-400">Loading reviews...</p> : (
              !reviews || reviews.length === 0
                ? <div className="text-center py-20 text-gray-400 tracking-widest uppercase text-sm border border-dashed border-black/10">No reviews found</div>
                : <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review._id} className="bg-white p-8 border border-black/5 shadow-sm hover:border-black/20 transition-colors flex flex-col md:flex-row justify-between gap-8 md:items-start">
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Rating</div>
                          <div className="flex text-[var(--accent)] text-lg">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? "opacity-100" : "opacity-30"}>★</span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="font-medium tracking-wide text-md">{review.productId?.name}</div>
                        
                        <div className="text-sm text-gray-500 tracking-wide">
                          By: <strong className="text-black">{review.userId?.name}</strong> {review.userId?.email ? `(${review.userId.email})` : ''}
                        </div>
                        
                        {review.comment && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-4 border border-black/5 mt-2 italic">
                            "{review.comment}"
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-400 mt-2">
                          Posted on: {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex shrink-0 min-w-[120px]">
                        <button 
                          className="w-full h-fit flex justify-center items-center bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 text-[9px] uppercase tracking-widest font-bold hover:bg-red-600 hover:text-white transition-colors"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
            )}
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <UserManager 
            users={users || []} 
            dispatch={dispatch} 
            toggleBlockAction={toggleUserBlockForEmployee}
          />
        )}
      </div>
    </div>
  );
}
