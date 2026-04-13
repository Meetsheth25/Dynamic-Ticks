import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchManagerProducts, 
  addManagerProduct, 
  updateManagerProduct, 
  deleteManagerProduct,
  logoutEmployee,
  fetchUsersForEmployee,
  toggleUserBlockForEmployee,
  fetchManagerReturns,
  managerDecisionReturn,
  managerRejectReturn,
  fetchEmployeeReviews,
  employeeDeleteReview
} from '@/store/slices/employeeSlice';
import ProductManager from '@/components/dashboard/ProductManager';
import UserManager from '@/components/dashboard/UserManager';

const SIDEBAR = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'products', label: 'Products', icon: '📦' },
  { key: 'returns', label: 'Return Requests', icon: '↩️' },
  { key: 'reviews', label: 'All Reviews', icon: '⭐' },
  { key: 'users', label: 'Client Registry', icon: '👥' },
];

export default function ManagerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    employee, 
    managerProducts, 
    users, 
    returns, 
    reviews, 
    loading: reduxLoading 
  } = useSelector(s => s.employee);

  const [tab, setTab] = useState('overview');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!employee || employee.role !== 'manager') navigate('/login');
  }, [employee, navigate]);

  useEffect(() => {
    if (tab === 'products') dispatch(fetchManagerProducts());
    if (tab === 'returns') dispatch(fetchManagerReturns());
    if (tab === 'reviews') dispatch(fetchEmployeeReviews());
    if (tab === 'users') dispatch(fetchUsersForEmployee());
  }, [tab, dispatch]);

  const handleReturnDecision = async (id, decision) => {
    try {
      await dispatch(managerDecisionReturn({ id, decision })).unwrap();
      setMsg(`Return ${decision === 'refund' ? 'approved for refund' : 'approved for exchange'}.`);
    } catch (err) {
      setMsg(err || 'Failed to update return');
    }
  };

  const handleRejectReturn = async (id) => {
    try {
      await dispatch(managerRejectReturn(id)).unwrap();
      setMsg('Return rejected.');
    } catch (err) {
      setMsg(err || 'Failed to reject return');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await dispatch(employeeDeleteReview(id)).unwrap();
      setMsg('Review deleted.');
    } catch (err) {
      setMsg(err || 'Failed to delete review');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">

      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-black text-white flex-shrink-0 flex flex-col p-8 md:min-h-screen">
        <div className="mb-12">
          <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] mb-2 block">Portal</span>
          <h2 className="text-2xl font-light tracking-wider capitalize">{employee?.name}</h2>
          <div className="mt-4 border border-purple-500 text-purple-400 text-[10px] tracking-widest uppercase px-3 py-1 inline-block">Manager</div>
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

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="fade-in">
            <h1 className="text-3xl font-light mb-10 tracking-[0.1em] text-black">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-8 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><span>📦</span> Products</div>
                <div className="text-4xl font-light">{managerProducts?.length || '—'}</div>
              </div>
              <div className="bg-white p-8 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><span>↩️</span> Pending Returns</div>
                <div className="text-4xl font-light">{returns?.filter(r => r.returnRequest?.status === 'pending').length || '—'}</div>
              </div>
              <div className="bg-white p-8 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><span>⭐</span> Total Reviews</div>
                <div className="text-4xl font-light">{reviews?.length || '—'}</div>
              </div>
            </div>

            <div className="bg-white p-8 border border-black/5 shadow-sm">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6">🎯 Your Responsibilities</h3>
              <ul className="space-y-4 text-sm text-gray-600 tracking-wide">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-black rounded-full" /> Add, edit, and delete products</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-black rounded-full" /> Manage product stock / inventory</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-black rounded-full" /> Review return requests from customers</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-black rounded-full" /> Approve refunds or exchanges</li>
              </ul>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <ProductManager
            products={managerProducts}
            dispatch={dispatch}
            onAdd={addManagerProduct}
            onUpdate={updateManagerProduct}
            onDelete={deleteManagerProduct}
          />
        )}

        {/* RETURNS */}
        {tab === 'returns' && (
          <div className="fade-in">
            <h1 className="text-3xl font-light mb-10 tracking-[0.1em] text-black">Return Requests</h1>

            {reduxLoading ? <p className="text-sm tracking-widest uppercase text-gray-400">Loading requests...</p> : (
              !returns || returns.length === 0
                ? <div className="text-center py-20 text-gray-400 tracking-widest uppercase text-sm border border-dashed border-black/10">No pending return requests 🎉</div>
                : <div className="space-y-6">
                  {returns.map(order => (
                    <div key={order._id} className="bg-white p-8 border border-black/5 shadow-sm hover:border-black/20 transition-colors flex flex-col md:flex-row justify-between gap-8 md:items-start">

                      <div className="flex-1 space-y-2">
                        <div className="font-medium tracking-wider text-lg mb-4">Order #{order._id.slice(-8)}</div>
                        <div className="text-sm text-gray-500 tracking-wide">
                          Customer: <strong className="text-black">{order.userId?.name}</strong> &middot; {order.userId?.email}
                        </div>
                        <div className="text-sm text-gray-500 tracking-wide">
                          Reason for Return: <span className="font-bold text-yellow-600">{order.returnRequest?.reason}</span>
                        </div>
                        {order.returnRequest?.description && (
                          <div className="text-sm text-gray-400 italic bg-gray-50 p-4 border-l-2 border-yellow-400 mt-2">
                            "{order.returnRequest.description}"
                          </div>
                        )}
                        <div className="font-bold tracking-widest mt-4">
                          Total: Rs. {order.totalPrice?.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4 md:mt-0 min-w-[200px]">
                        <button
                          className="w-full bg-black text-white px-4 py-2.5 text-[9px] uppercase tracking-widest font-bold hover:bg-green-600 transition-colors"
                          onClick={() => handleReturnDecision(order._id, 'refund')}
                        >
                          ✅ Approve Refund
                        </button>
                        <button
                          className="w-full bg-white border border-black text-black px-4 py-2.5 text-[9px] uppercase tracking-widest font-bold hover:bg-yellow-50 hover:border-yellow-600 transition-colors"
                          onClick={() => handleReturnDecision(order._id, 'exchange')}
                        >
                          🔄 Exchange
                        </button>
                        <button
                          className="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 text-[9px] uppercase tracking-widest font-bold hover:bg-red-600 hover:text-white transition-colors"
                          onClick={() => handleRejectReturn(order._id)}
                        >
                          ❌ Reject
                        </button>
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
