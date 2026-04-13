import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  logoutEmployee, 
  fetchDeliveryOrders, 
  updateDeliveryStatusThunk 
} from '@/store/slices/employeeSlice';
import { updateEstimatedDeliveryDate } from '@/store/slices/orderSlice';

const DELIVERY_STEPS = [
  { key: 'pending', label: 'Pending', icon: '⏳', color: 'bg-gray-200 text-gray-500 border-gray-200' },
  { key: 'picked', label: 'Picked', icon: '📦', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'delivered', label: 'Delivered', icon: '✅', color: 'bg-green-100 text-green-700 border-green-200' },
];

const stepIndex = (key) => DELIVERY_STEPS.findIndex(s => s.key === key);

export default function DeliveryDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employee, orders, loading: reduxLoading } = useSelector(s => s.employee);

  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!employee || employee.role !== 'delivery') navigate('/login');
  }, [employee, navigate]);

  useEffect(() => { 
    dispatch(fetchDeliveryOrders()); 
  }, [dispatch]);

  const updateDeliveryStatus = async (id, deliveryStatus) => {
    try {
      await dispatch(updateDeliveryStatusThunk({ id, status: deliveryStatus })).unwrap();
      setMsg(`Status updated to "${deliveryStatus.replace(/_/g, ' ')}"`);
    } catch (err) {
      setMsg(err || 'Failed to update status');
    }
  };

  const handleUpdateDate = async (orderId, date) => {
    try {
      await dispatch(updateEstimatedDeliveryDate({ id: orderId, dateData: { estimatedDeliveryDate: date } })).unwrap();
      setMsg('Delivery estimate updated');
      dispatch(fetchDeliveryOrders());
    } catch (err) {
      setMsg(err || 'Failed to update date');
    }
  };

  const active = orders?.filter(o => o.deliveryStatus !== 'delivered') || [];
  const completed = orders?.filter(o => o.deliveryStatus === 'delivered') || [];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-black text-white flex-shrink-0 flex flex-col p-8 md:min-h-screen">
        <div className="mb-12">
          <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] mb-2 block">Portal</span>
          <h2 className="text-2xl font-light tracking-wider capitalize">{employee?.name}</h2>
          <div className="mt-4 border border-green-500 text-green-400 text-[10px] tracking-widest uppercase px-3 py-1 inline-block">Delivery</div>
        </div>

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

        <div className="fade-in">
          <h1 className="text-3xl font-light mb-10 tracking-[0.1em] text-black">Delivery Overview</h1>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Assigned', val: orders?.length || 0 },
              { label: 'Active', val: active.length },
              { label: 'Completed', val: completed.length },
            ].map(item => (
              <div key={item.label} className="bg-white p-8 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">{item.label}</div>
                <div className="text-4xl font-light">{item.val}</div>
              </div>
            ))}
          </div>

          {reduxLoading ? (
            <div className="text-center py-20 text-gray-400 tracking-widest uppercase text-sm border border-dashed border-black/10">Loading orders...</div>
          ) : (
            <div className="space-y-12">
              
              {/* Active Orders */}
              <section>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-black border-b border-black/10 pb-4">
                  Active Deliveries ({active.length})
                </h3>

                {active.length === 0 && (
                  <div className="bg-white p-12 text-center text-gray-400 border border-black/5 uppercase tracking-widest text-xs font-bold shadow-sm">
                    No active deliveries assigned 🎉
                  </div>
                )}

                <div className="space-y-6">
                  {active.map(order => {
                    const curStep = stepIndex(order.deliveryStatus || 'pending');
                    return (
                      <div key={order._id} className="bg-white p-6 md:p-8 border border-black/5 shadow-sm hover:border-black/20 transition-colors">
                        
                        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6 mb-8">
                          <div>
                            <div className="text-lg font-medium tracking-wider mb-2">Order #{order._id.slice(-8)}</div>
                            <div className="text-sm text-gray-500 tracking-wide">
                              Customer: <strong className="text-black">{order.userId?.name}</strong>
                            </div>
                            <div className="text-sm text-gray-500 tracking-wide mt-1">
                              {order.shippingAddress?.address}, {order.shippingAddress?.city} — {order.shippingAddress?.postalCode}
                            </div>
                            <div className="text-black font-bold tracking-widest mt-3">
                              Rs. {order.totalPrice?.toLocaleString()}
                            </div>
                             
                             <div className="mt-6 flex flex-col md:flex-row gap-4 items-end">
                                <div className="space-y-1.5 flex-1 max-w-[200px]">
                                  <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400">Estimated Delivery</label>
                                  <input 
                                    type="date" 
                                    className="w-full bg-[#fbfbfb] border border-gray-100 p-2 text-[10px] focus:outline-none focus:border-black"
                                    value={order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : ''}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => handleUpdateDate(order._id, e.target.value)}
                                  />
                                </div>
                                {order.estimatedDeliveryDate && (
                                  <span className="text-[8px] italic text-gray-400 mb-2">Early delivery only</span>
                                )}
                             </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {DELIVERY_STEPS.slice(1).map((step, idx) => {
                              const targetIdx = idx + 1;
                              const isNext = targetIdx === curStep + 1;
                              const isDone = targetIdx <= curStep;
                              return (
                                <button
                                  key={step.key}
                                  className={`px-4 py-2 text-[9px] uppercase tracking-widest font-bold transition-all border ${isDone ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed' : isNext ? 'bg-black text-white border-black hover:bg-[var(--accent)] hover:text-black hover:border-transparent' : 'bg-transparent text-gray-300 border-gray-200 cursor-not-allowed'}`}
                                  disabled={isDone || !isNext}
                                  onClick={() => updateDeliveryStatus(order._id, step.key)}
                                >
                                  {step.icon} {step.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="pt-6 border-t border-black/5">
                          <div className="flex justify-between items-center relative max-w-2xl mx-auto">
                            {/* Line connecting steps */}
                            <div className="absolute top-4 left-0 w-full h-[1px] bg-gray-200 -z-10" />
                            <div 
                              className="absolute top-4 left-0 h-[1px] bg-black -z-10 transition-all duration-500" 
                              style={{ width: `${(curStep / (DELIVERY_STEPS.length - 1)) * 100}%` }} 
                            />

                            {DELIVERY_STEPS.map((step, idx) => (
                              <div key={step.key} className="flex flex-col items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-colors ${idx <= curStep ? step.color : 'bg-white border-gray-200 text-gray-300'}`}>
                                  {idx <= curStep ? step.icon : '○'}
                                </div>
                                <div className={`text-[10px] uppercase font-bold tracking-widest text-center max-w-[80px] ${idx <= curStep ? 'text-black' : 'text-gray-400'}`}>
                                  {step.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Completed */}
              {completed.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-green-700 border-b border-green-700/20 pb-4">
                    Completed Deliveries ({completed.length})
                  </h3>
                  <div className="space-y-4">
                    {completed.map(order => (
                      <div key={order._id} className="bg-white p-6 border border-green-500/20 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="font-medium tracking-wider mb-1">#{order._id.slice(-8)}</div>
                          <div className="text-xs text-gray-500 tracking-wide uppercase font-bold">
                            {order.userId?.name} &middot; Rs. {order.totalPrice?.toLocaleString()}
                          </div>
                        </div>
                        <span className="bg-green-50 text-green-700 px-4 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-green-200">
                          ✅ Delivered
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
