import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutEmployee } from '@/store/slices/employeeSlice';
import api from '@/services/api';

const STATUS_OPTIONS = ['processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  processing: '#fbbf24',
  shipped: '#60a5fa',
  delivered: '#4ade80',
  cancelled: '#f87171',
  return_requested: '#c084fc',
  returned: '#94a3b8',
};

const SIDEBAR = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'orders', label: 'All Orders', icon: '🛒' },
];

export default function StaffDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employee } = useSelector(s => s.employee);

  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!employee || employee.role !== 'staff') navigate('/login');
  }, [employee, navigate]);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees/staff/orders');
      setOrders(data);
    } finally { setLoading(false); }
  };

  const fetchDeliveryPersons = async () => {
    const { data } = await api.get('/employees/staff/delivery-persons');
    setDeliveryPersons(data);
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/employees/staff/orders/${orderId}`, { status });
      setMsg(`✅ Order status updated to "${status}"`);
      fetchOrders();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAssignDelivery = async (orderId, personId) => {
    if (!personId) return;
    try {
      await api.put(`/employees/staff/orders/${orderId}`, { assignedDeliveryPerson: personId });
      setMsg('✅ Delivery person assigned');
      fetchOrders();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a192f, #0f2744, #0d1a2d)',
      display: 'flex', fontFamily: "'Inter', sans-serif", color: '#fff',
    },
    sidebar: {
      width: '240px', flexShrink: 0,
      background: 'rgba(255,255,255,0.03)',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', padding: '1.5rem 0',
    },
    main: { flex: 1, padding: '2rem', overflowY: 'auto' },
    navItem: (active) => ({
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 20px', margin: '2px 12px',
      borderRadius: '10px', cursor: 'pointer',
      background: active ? 'rgba(96,165,250,0.2)' : 'transparent',
      color: active ? '#93c5fd' : 'rgba(255,255,255,0.6)',
      fontWeight: active ? 600 : 400, fontSize: '14px',
      border: active ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent',
      transition: 'all 0.2s',
    }),
    statCard: (color) => ({
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px', padding: '1.25rem',
      borderTop: `3px solid ${color}`,
    }),
    orderCard: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', padding: '1.25rem', marginBottom: '12px',
    },
    btn: (color = '#3b82f6') => ({
      background: color, border: 'none', borderRadius: '8px',
      padding: '7px 14px', color: '#fff', fontSize: '12px',
      fontWeight: 600, cursor: 'pointer',
    }),
    select: {
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '8px', padding: '7px 12px',
      color: '#fff', fontSize: '12px', cursor: 'pointer',
    },
  };

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={{ padding: '0 20px', marginBottom: '2rem' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Staff Portal</div>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>{employee?.name}</div>
          <div style={{
            display: 'inline-block', marginTop: '6px',
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '20px', padding: '2px 10px',
            color: '#93c5fd', fontSize: '11px', fontWeight: 600,
          }}>Staff</div>
        </div>

        {SIDEBAR.map(item => (
          <div key={item.key} style={s.navItem(tab === item.key)} onClick={() => setTab(item.key)}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ ...s.navItem(false), margin: '0 12px', color: '#f87171' }} onClick={() => { dispatch(logoutEmployee()); navigate('/login'); }}>
          🚪 Logout
        </div>
      </div>

      <div style={s.main}>
        {msg && (
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', color: '#bfdbfe', fontSize: '13px' }} onClick={() => setMsg('')}>
            {msg} <span style={{ float: 'right', opacity: 0.5, cursor: 'pointer' }}>✕</span>
          </div>
        )}

        {tab === 'overview' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '24px', fontWeight: 700 }}>Staff Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Orders', val: stats.total, color: '#60a5fa' },
                { label: 'Processing', val: stats.processing, color: '#fbbf24' },
                { label: 'Shipped', val: stats.shipped, color: '#a78bfa' },
                { label: 'Delivered', val: stats.delivered, color: '#4ade80' },
              ].map(item => (
                <div key={item.label} style={s.statCard(item.color)}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '14px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 8px', fontWeight: 600 }}>🎯 Your Responsibilities</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.7)', lineHeight: 2, fontSize: '14px' }}>
                <li>Update order status (processing → shipped → delivered)</li>
                <li>Assign delivery persons to orders</li>
                <li>Stock is automatically reduced when order is shipped</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Order Management</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Filter:</span>
                <select style={s.select} value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">All</option>
                  {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
                <button style={s.btn()} onClick={fetchOrders}>↻ Refresh</button>
              </div>
            </div>

            {loading ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p> : (
              filtered.length === 0
                ? <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '3rem' }}>No orders found</div>
                : filtered.map(order => (
                  <div key={order._id} style={s.orderCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600 }}>#{order._id.slice(-8)}</span>
                          <span style={{
                            background: `${STATUS_COLORS[order.status]}22`,
                            color: STATUS_COLORS[order.status] || '#fff',
                            padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          }}>{order.status}</span>
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                          Customer: <strong style={{ color: '#fff' }}>{order.userId?.name}</strong> · {order.userId?.email}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }}>
                          Total: <strong style={{ color: '#93c5fd' }}>₹{order.totalPrice}</strong> · {order.orderItems?.length} item(s)
                        </div>
                        {order.assignedDeliveryPerson && (
                          <div style={{ color: '#4ade80', fontSize: '12px', marginTop: '4px' }}>
                            🚚 Delivery: {order.assignedDeliveryPerson.name}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Update Status</div>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {STATUS_OPTIONS.map(st => (
                              <button
                                key={st}
                                style={{
                                  ...s.btn(order.status === st ? STATUS_COLORS[st] + '88' : 'rgba(255,255,255,0.08)'),
                                  opacity: order.status === st ? 1 : 0.8,
                                  fontSize: '11px', padding: '5px 10px',
                                }}
                                onClick={() => handleStatusUpdate(order._id, st)}
                              >{st}</button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Assign Delivery Person</div>
                          <select
                            style={{ ...s.select, width: '100%', opacity: order.assignedDeliveryPerson ? 0.6 : 1 }}
                            value={order.assignedDeliveryPerson?._id || ''}
                            onChange={e => handleAssignDelivery(order._id, e.target.value)}
                            disabled={!!order.assignedDeliveryPerson}
                          >
                            <option value="">{order.assignedDeliveryPerson ? order.assignedDeliveryPerson.name : '— Select —'}</option>
                            {deliveryPersons.map(dp => (
                              <option key={dp._id} value={dp._id}>
                                {dp.name} ({dp.activeDeliveries || 0} active)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
