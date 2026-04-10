import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutEmployee } from '@/store/slices/employeeSlice';
import api from '@/services/api';
import { getImageUrl } from '@/utils/image';

const SIDEBAR = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'products', label: 'Products', icon: '📦' },
  { key: 'returns', label: 'Return Requests', icon: '↩️' },
];

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', padding: '1.5rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: '12px',
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '22px', flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>{value}</div>
    </div>
  </div>
);

export default function ManagerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employee } = useSelector(s => s.employee);

  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', category: '', description: '', countInStock: '', returnAvailable: false });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!employee || employee.role !== 'manager') navigate('/login');
  }, [employee, navigate]);

  useEffect(() => {
    if (tab === 'products') fetchProducts();
    if (tab === 'returns') fetchReturns();
  }, [tab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees/manager/products');
      setProducts(data);
    } finally { setLoading(false); }
  };

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees/manager/returns');
      setReturns(data);
    } finally { setLoading(false); }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(productForm).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append('images', f));

      if (editingProduct) {
        await api.put(`/employees/manager/products/${editingProduct._id}`, fd);
        setMsg('✅ Product updated');
      } else {
        await api.post('/employees/manager/products', fd);
        setMsg('✅ Product created');
      }
      setShowProductForm(false); setEditingProduct(null);
      setProductForm({ name: '', price: '', category: '', description: '', countInStock: '', returnAvailable: false });
      setFiles([]);
      fetchProducts();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/employees/manager/products/${id}`);
    setMsg('🗑️ Product deleted');
    fetchProducts();
  };

  const handleReturnDecision = async (orderId, decision) => {
    try {
      await api.put(`/employees/manager/returns/${orderId}/approve`, { adminDecision: decision });
      setMsg(`✅ Return ${decision === 'refund' ? 'approved (refund)' : 'approved (exchange)'}`);
      fetchReturns();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectReturn = async (orderId) => {
    try {
      await api.put(`/employees/manager/returns/${orderId}/reject`);
      setMsg('🚫 Return rejected');
      fetchReturns();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #1a1030, #0d1520)',
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
      background: active ? 'rgba(123,97,255,0.2)' : 'transparent',
      color: active ? '#a78bfa' : 'rgba(255,255,255,0.6)',
      fontWeight: active ? 600 : 400,
      fontSize: '14px',
      border: active ? '1px solid rgba(123,97,255,0.3)' : '1px solid transparent',
      transition: 'all 0.2s',
    }),
    btn: (color = '#7b61ff') => ({
      background: color, border: 'none', borderRadius: '8px',
      padding: '8px 16px', color: '#fff', fontSize: '13px',
      fontWeight: 600, cursor: 'pointer',
    }),
    input: {
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px', padding: '10px 14px',
      color: '#fff', fontSize: '14px', width: '100%', boxSizing: 'border-box',
    },
    card: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', padding: '1.25rem',
      marginBottom: '12px',
    },
  };

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={{ padding: '0 20px', marginBottom: '2rem' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Manager Portal</div>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>{employee?.name}</div>
          <div style={{
            display: 'inline-block', marginTop: '6px',
            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '20px', padding: '2px 10px',
            color: '#4ade80', fontSize: '11px', fontWeight: 600,
          }}>Manager</div>
        </div>

        {SIDEBAR.map(item => (
          <div key={item.key} style={s.navItem(tab === item.key)} onClick={() => setTab(item.key)}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}

        <div style={{ flex: 1 }} />
        <div
          style={{ ...s.navItem(false), margin: '0 12px', color: '#f87171', cursor: 'pointer' }}
          onClick={() => { dispatch(logoutEmployee()); navigate('/login'); }}
        >
          🚪 Logout
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        {msg && (
          <div style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem',
            color: '#e2e8f0', fontSize: '13px',
          }} onClick={() => setMsg('')}>
            {msg} <span style={{ float: 'right', opacity: 0.5, cursor: 'pointer' }}>✕</span>
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '24px', fontWeight: 700 }}>Dashboard Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard icon="📦" label="Products" value={products.length || '—'} color="rgba(123,97,255,0.2)" />
              <StatCard icon="↩️" label="Pending Returns" value={returns.filter(r => r.returnRequest?.status === 'pending').length || '—'} color="rgba(251,146,60,0.2)" />
            </div>
            <div style={{ ...s.card, background: 'rgba(123,97,255,0.07)' }}>
              <h3 style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '16px' }}>🎯 Your Responsibilities</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.7)', lineHeight: 2, fontSize: '14px' }}>
                <li>Add, edit, and delete products</li>
                <li>Manage product stock / inventory</li>
                <li>Review return requests from customers</li>
                <li>Approve refunds or exchanges</li>
              </ul>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Product Management</h2>
              <button style={s.btn()} onClick={() => { setShowProductForm(true); setEditingProduct(null); }}>+ Add Product</button>
            </div>

            {showProductForm && (
              <div style={{ ...s.card, marginBottom: '1.5rem', borderColor: 'rgba(123,97,255,0.3)' }}>
                <h3 style={{ margin: '0 0 1rem', fontWeight: 600 }}>{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                <form onSubmit={handleProductSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    ['Name', 'name', 'text'],
                    ['Price', 'price', 'number'],
                    ['Category', 'category', 'text'],
                    ['Stock', 'countInStock', 'number'],
                  ].map(([label, key, type]) => (
                    <div key={key}>
                      <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>{label}</label>
                      <input style={s.input} type={type} value={productForm[key]} onChange={e => setProductForm(p => ({ ...p, [key]: e.target.value }))} required />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>Description</label>
                    <textarea style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>Images</label>
                    <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: '8px' }}>
                    <button type="submit" style={s.btn()} disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</button>
                    <button type="button" style={s.btn('rgba(255,255,255,0.1)')} onClick={() => setShowProductForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {loading ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading…</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {p.images?.[0] && <img src={getImageUrl(p.images[0])} style={{ width: 40, height: 40, borderRadius: '8px', objectFit: 'cover' }} alt="" />}
                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.6)' }}>{p.category}</td>
                        <td style={{ padding: '10px 12px', color: '#a78bfa', fontWeight: 600 }}>₹{p.price}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            background: p.countInStock > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: p.countInStock > 0 ? '#4ade80' : '#f87171',
                            padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          }}>{p.countInStock}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button style={s.btn('rgba(123,97,255,0.5)')} onClick={() => {
                              setEditingProduct(p);
                              setProductForm({ name: p.name, price: p.price, category: p.category, description: p.description, countInStock: p.countInStock, returnAvailable: p.returnAvailable });
                              setShowProductForm(true);
                            }}>Edit</button>
                            <button style={s.btn('rgba(239,68,68,0.4)')} onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>No products found.</p>}
              </div>
            )}
          </div>
        )}

        {/* RETURNS */}
        {tab === 'returns' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '22px', fontWeight: 700 }}>Return Requests</h2>
            {loading ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading…</p> : (
              returns.length === 0
                ? <div style={{ ...s.card, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No pending return requests 🎉</div>
                : returns.map(order => (
                  <div key={order._id} style={s.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Order #{order._id.slice(-8)}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Customer: {order.userId?.name} ({order.userId?.email})</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>
                          Reason: <span style={{ color: '#fbbf24' }}>{order.returnRequest?.reason}</span>
                        </div>
                        {order.returnRequest?.description && (
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>"{order.returnRequest.description}"</div>
                        )}
                        <div style={{ marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                          Total: <strong style={{ color: '#fff' }}>₹{order.totalPrice}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button style={s.btn('rgba(34,197,94,0.4)')} onClick={() => handleReturnDecision(order._id, 'refund')}>✅ Approve Refund</button>
                        <button style={s.btn('rgba(251,146,60,0.4)')} onClick={() => handleReturnDecision(order._id, 'exchange')}>🔄 Exchange</button>
                        <button style={s.btn('rgba(239,68,68,0.4)')} onClick={() => handleRejectReturn(order._id)}>❌ Reject</button>
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
