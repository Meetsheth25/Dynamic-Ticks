import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutEmployee } from '@/store/slices/employeeSlice';
import api from '@/services/api';

const DELIVERY_STEPS = [
  { key: 'pending', label: 'Pending', icon: '⏳', color: '#94a3b8' },
  { key: 'picked', label: 'Picked from Warehouse', icon: '📦', color: '#fbbf24' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚', color: '#60a5fa' },
  { key: 'delivered', label: 'Delivered', icon: '✅', color: '#4ade80' },
];

const stepIndex = (key) => DELIVERY_STEPS.findIndex(s => s.key === key);

export default function DeliveryDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employee } = useSelector(s => s.employee);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!employee || employee.role !== 'delivery') navigate('/login');
  }, [employee, navigate]);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees/delivery/orders');
      setOrders(data);
    } finally { setLoading(false); }
  };

  const updateDeliveryStatus = async (orderId, deliveryStatus) => {
    try {
      await api.put(`/employees/delivery/orders/${orderId}`, { deliveryStatus });
      setMsg(`✅ Status updated to "${deliveryStatus.replace('_', ' ')}"`);
      fetchOrders();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  const active = orders.filter(o => o.deliveryStatus !== 'delivered');
  const completed = orders.filter(o => o.deliveryStatus === 'delivered');

  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d1f1a, #0a2218, #04150f)',
      fontFamily: "'Inter', sans-serif", color: '#fff',
      padding: '0',
    },
    header: {
      background: 'rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '1rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    main: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
    card: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '1.5rem', marginBottom: '16px',
    },
    btn: (color, disabled) => ({
      background: disabled ? 'rgba(255,255,255,0.05)' : color,
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px', padding: '9px 18px',
      color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
      fontSize: '13px', fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
    }),
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>DELIVERY PORTAL</div>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>{employee?.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '20px', padding: '4px 14px',
            color: '#4ade80', fontSize: '12px', fontWeight: 600,
          }}>🚚 Delivery</span>
          <button
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '7px 16px', color: '#f87171', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => { dispatch(logoutEmployee()); navigate('/login'); }}
          >Logout</button>
        </div>
      </div>

      <div style={s.main}>
        {msg && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', color: '#86efac', fontSize: '13px' }} onClick={() => setMsg('')}>
            {msg} <span style={{ float: 'right', opacity: 0.5, cursor: 'pointer' }}>✕</span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Assigned', val: orders.length, color: '#60a5fa' },
            { label: 'Active', val: active.length, color: '#fbbf24' },
            { label: 'Completed', val: completed.length, color: '#4ade80' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid rgba(255,255,255,0.08)`,
              borderTop: `3px solid ${item.color}`,
              borderRadius: '14px', padding: '1.2rem', textAlign: 'center',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '6px' }}>{item.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: item.color }}>{item.val}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '3rem' }}>Loading orders...</div>
        ) : (
          <>
            {/* Active Orders */}
            <h3 style={{ margin: '0 0 1rem', fontWeight: 600, fontSize: '18px', color: '#fbbf24' }}>
              📦 Active Deliveries ({active.length})
            </h3>

            {active.length === 0 && (
              <div style={{ ...s.card, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No active deliveries assigned 🎉</div>
            )}

            {active.map(order => {
              const curStep = stepIndex(order.deliveryStatus || 'pending');
              return (
                <div key={order._id} style={{ ...s.card, borderColor: 'rgba(251,191,36,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>Order #{order._id.slice(-8)}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                        Customer: <strong style={{ color: '#fff' }}>{order.userId?.name}</strong>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>
                        {order.shippingAddress?.address}, {order.shippingAddress?.city} — {order.shippingAddress?.postalCode}
                      </div>
                      <div style={{ color: '#93c5fd', fontWeight: 600, marginTop: '6px' }}>₹{order.totalPrice}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                      {DELIVERY_STEPS.map((step, idx) => (
                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                          {idx < DELIVERY_STEPS.length - 1 && (
                            <div style={{
                              position: 'absolute', top: '16px', left: '50%', right: '-50%',
                              height: '2px',
                              background: idx < curStep ? step.color : 'rgba(255,255,255,0.1)',
                              zIndex: 0,
                            }} />
                          )}
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: idx <= curStep ? step.color : 'rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', zIndex: 1, position: 'relative',
                            transition: 'background 0.3s',
                          }}>{idx <= curStep ? step.icon : '○'}</div>
                          <div style={{ fontSize: '10px', color: idx <= curStep ? step.color : 'rgba(255,255,255,0.3)', marginTop: '6px', textAlign: 'center', lineHeight: 1.2 }}>{step.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {DELIVERY_STEPS.slice(1).map((step, idx) => {
                      const targetIdx = idx + 1;
                      const isNext = targetIdx === curStep + 1;
                      const isDone = targetIdx <= curStep;
                      return (
                        <button
                          key={step.key}
                          style={s.btn(step.color + 'aa', isDone || !isNext)}
                          disabled={isDone || !isNext}
                          onClick={() => updateDeliveryStatus(order._id, step.key)}
                        >
                          {step.icon} {step.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Completed */}
            {completed.length > 0 && (
              <>
                <h3 style={{ margin: '2rem 0 1rem', fontWeight: 600, fontSize: '18px', color: '#4ade80' }}>
                  ✅ Completed Deliveries ({completed.length})
                </h3>
                {completed.map(order => (
                  <div key={order._id} style={{ ...s.card, opacity: 0.7, borderColor: 'rgba(74,222,128,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>Order #{order._id.slice(-8)}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{order.userId?.name} · ₹{order.totalPrice}</div>
                      </div>
                      <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: 600 }}>✅ Delivered</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
