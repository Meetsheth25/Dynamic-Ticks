import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, RefreshCcw, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';
import { fetchMyOrders } from '@/store/slices/orderSlice';

const getStatusConfig = (status) => {
  const base = "text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-1.5 rounded-full border shadow-sm flex items-center gap-2";
  switch (status?.toLowerCase()) {
    case 'processing':       return { className: `${base} text-amber-600 bg-amber-50 border-amber-100`, label: 'Processing', icon: Clock };
    case 'shipped':          return { className: `${base} text-blue-600 bg-blue-50 border-blue-100`, label: 'In Transit', icon: Truck };
    case 'delivered':        return { className: `${base} text-emerald-600 bg-emerald-50 border-emerald-100`, label: 'Delivered', icon: CheckCircle };
    case 'completed':        return { className: `${base} text-emerald-600 bg-emerald-50 border-emerald-100`, label: 'Fulfilled', icon: CheckCircle };
    case 'cancelled':        return { className: `${base} text-rose-600 bg-rose-50 border-rose-100`, label: 'Cancelled', icon: XCircle };
    case 'return_requested': return { className: `${base} text-orange-600 bg-orange-50 border-orange-100`, label: 'Return Req.', icon: RefreshCcw };
    default:                 return { className: `${base} text-gray-600 bg-gray-50 border-gray-100`, label: status, icon: Package };
  }
};

const Orders = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const newOrder = location.state?.newOrder;
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="bg-[var(--bg-soft)] min-h-screen pt-32 pb-20">
      <Container className="max-w-5xl">
        
        {newOrder && (
          <div className="bg-white border border-[var(--accent)]/30 p-12 text-center mb-16 fade-in shadow-xl">
            <div className="w-16 h-16 bg-[var(--bg-soft)] flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <h2 className="text-3xl font-bold uppercase tracking-[0.2em] text-black mb-4">Masterpiece Secured</h2>
            <p className="text-gray-500 text-sm tracking-wide mb-10 max-w-md mx-auto">
              Your selection is being prepared by our master watchmakers. A confirmation email has been sent to your registry.
            </p>
            <Link to="/catalog">
               <Button variant="outline" className="px-12">Continue Exploring</Button>
            </Link>
          </div>
        )}

        <div className="mb-16 fade-in">
          <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] mb-3 block">Private Registry</span>
          <h1 className="text-4xl font-bold tracking-[0.05em] uppercase">Order History</h1>
        </div>

        {loading && orders.length === 0 && (
          <div className="flex justify-center py-32">
            <div className="w-6 h-6 border-b-2 border-black rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-32 bg-white border border-gray-100">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-8" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-black mb-4">No Acquisitions</h2>
            <p className="text-gray-500 text-sm tracking-wide mb-10">Your collection is currently empty. Begin your journey today.</p>
            <Link to="/catalog"><Button className="px-12">Browse Collection</Button></Link>
          </div>
        )}

        <div className="space-y-8 fade-in">
          {orders.map((order) => {
            const config = getStatusConfig(order.status);
            const StatusIcon = config.icon;
            return (
              <div key={order._id} className="bg-white border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-500">
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
                        <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-bold mb-2 block">Fine Watchmaking</span>
                        <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-2">{item.name}</h3>
                        <p className="text-xs text-gray-500 tracking-wide">Qty: {item.qty} • Precision Caliber System</p>
                      </div>
                      <div className="flex flex-col gap-3 min-w-[160px]">
                        <Link to={`/order/${order._id}`}>
                          <Button variant="outline" className="w-full py-3 text-[9px] tracking-[0.2em] border-black/10 hover:border-black">
                            Order Dossier
                          </Button>
                        </Link>
                        {order.status === 'delivered' && (
                          <Link to={`/return/${order._id}`}>
                            <Button className="w-full py-3 text-[9px] tracking-[0.2em] bg-black text-white hover:bg-rose-900 border-none transition-colors">
                              Initiate Return
                            </Button>
                          </Link>
                        )}
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

export default Orders;
