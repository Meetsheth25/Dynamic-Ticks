import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Truck, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';
import { fetchMyOrders } from '@/store/slices/orderSlice';

const getStatusConfig = (status) => {
  const base = "text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-1.5 rounded-full border shadow-sm flex items-center gap-2";
  switch (status?.toLowerCase()) {
    case 'processing':       return { className: `${base} text-amber-600 bg-amber-50 border-amber-100`, label: 'Processing', icon: Clock };
    case 'shipped':          return { className: `${base} text-blue-600 bg-blue-50 border-blue-100`, label: 'In Transit', icon: Truck };
    default:                 return { className: `${base} text-gray-600 bg-gray-50 border-gray-100`, label: status, icon: Package };
  }
};

const ShippingStatus = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, isAuthenticated]);

  const activeShippingOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => 
      o.status?.toLowerCase() === 'shipped' || o.status?.toLowerCase() === 'processing'
    );
  }, [orders]);

  if (!isAuthenticated) {
    return (
      <div className="bg-[var(--bg-soft)] min-h-screen pt-40 pb-20 fade-in flex flex-col items-center justify-center">
        <div className="text-center bg-white p-16 border border-gray-100 shadow-xl max-w-lg w-full rounded-sm">
          <AlertCircle className="w-16 h-16 text-[var(--accent)] mx-auto mb-8" />
          <h2 className="text-2xl font-light tracking-[0.1em] uppercase text-black mb-4">Authentication Required</h2>
          <p className="text-gray-500 text-sm tracking-wide mb-10 leading-loose">
            Please log in first to view instructions, active logistics, and real-time shipping status for your timepieces.
          </p>
          <Button onClick={() => navigate('/login')} className="px-12 w-full py-4 uppercase tracking-[0.2em] font-bold text-xs">
            Proceed to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-soft)] min-h-screen pt-32 pb-20">
      <Container className="max-w-5xl">
        <div className="mb-16 fade-in text-center">
          <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] mb-3 block">Logistics Hub</span>
          <h1 className="text-4xl font-bold tracking-[0.05em] uppercase">Active Shipments</h1>
          <div className="w-20 h-1 bg-black mx-auto mt-8 mb-4" />
        </div>

        {loading && activeShippingOrders.length === 0 && (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-[1px] border-black border-t-transparent flex items-center justify-center rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {!loading && activeShippingOrders.length === 0 && (
          <div className="text-center py-32 bg-white border border-gray-100 shadow-xl fade-in">
            <Truck className="w-16 h-16 text-gray-200 mx-auto mb-8" />
            <h2 className="text-2xl font-bold uppercase tracking-widest text-black mb-4">No Active Shipments</h2>
            <p className="text-gray-500 text-sm tracking-wide mb-10 max-w-sm mx-auto">
              You currently do not have any orders in the shipping or processing stage. Discover your next masterpiece.
            </p>
            <Link to="/catalog">
              <Button className="px-12 py-4 shadow-md hover:shadow-xl transition-shadow uppercase tracking-widest text-[10px] font-bold">
                Explore Products
              </Button>
            </Link>
          </div>
        )}

        <div className="space-y-8 fade-in">
          {activeShippingOrders.map((order) => {
            const config = getStatusConfig(order.status);
            const StatusIcon = config.icon;
            return (
              <div key={order._id} className="bg-white border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-500 shadow-md">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 flex-1">
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-2">Reference No.</span>
                      <span className="text-xs font-bold font-mono tracking-widest uppercase">{order._id?.substring(0,12)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-2">Acquisition Date</span>
                      <span className="text-xs font-bold tracking-widest uppercase">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="hidden lg:block">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-2">Value</span>
                      <span className="text-xs font-bold tracking-widest uppercase">Rs. {order.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className={config.className}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </div>
                </div>

                <div className="p-8 bg-white">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-10 items-center py-6 border-b border-gray-50 last:border-0 first:pt-0 last:pb-0">
                      <div className="w-32 h-32 bg-[var(--bg-soft)] flex items-center justify-center p-6 transition-transform duration-500 hover:scale-105">
                        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain mix-blend-darken" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-bold mb-2 block">In Transit</span>
                        <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-2">{item.name}</h3>
                        <p className="text-xs text-gray-500 tracking-wide">Qty: {item.qty} • Precision Logistics</p>
                      </div>
                      <div className="flex flex-col gap-3 min-w-[160px]">
                        <Link to={`/order/${order._id}`}>
                          <Button variant="outline" className="w-full py-3 text-[9px] tracking-[0.2em] border-black/10 hover:border-black">
                            Track Shipment
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

export default ShippingStatus;
