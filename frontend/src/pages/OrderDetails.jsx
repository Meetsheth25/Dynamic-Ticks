import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '@/store/slices/orderSlice';
import { CheckCircle, Truck, Package, Download, ChevronLeft, RefreshCcw, XCircle, Clock, ShieldCheck, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';

const getStatusConfig = (status) => {
  const base = "flex flex-col items-center gap-4 text-center p-12";
  switch (status?.toLowerCase()) {
    case 'processing':   return { icon: Clock,       color: 'text-amber-500', label: 'Processing',        className: base };
    case 'shipped':      return { icon: Truck,        color: 'text-blue-500',   label: 'In Transit',        className: base };
    case 'delivered':    return { icon: CheckCircle,  color: 'text-emerald-500',  label: 'Delivered',        className: base };
    case 'completed':    return { icon: CheckCircle,  color: 'text-emerald-500',  label: 'Fulfilled',         className: base };
    case 'cancelled':    return { icon: XCircle,      color: 'text-rose-500',    label: 'Cancelled',         className: base };
    case 'return_requested': return { icon: RefreshCcw, color: 'text-orange-500', label: 'Return Req.',      className: base };
    default:             return { icon: Package,      color: 'text-gray-400',   label: status,              className: base };
  }
};

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { orders, loading, error } = useSelector(state => state.orders);
  const order = orders.find(o => o._id === id);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  if (loading && !order) return (
    <div className="min-h-screen pt-32 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-b-2 border-black rounded-full animate-spin"></div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-white text-center px-6">
      <h2 className="text-2xl font-bold uppercase tracking-widest text-black mb-4">Invoice Not Found</h2>
      <p className="text-gray-500 text-sm mb-10 tracking-wide">The requested dossier is restricted or does not exist in our registry.</p>
      <Link to="/orders"><Button>Return to Registry</Button></Link>
    </div>
  );

  const { icon: StatusIcon, color: statusColor, label: statusLabel, className: statusClass } = getStatusConfig(order.status);

  return (
    <div className="bg-[var(--bg-soft)] min-h-screen pt-32 pb-20">
      <Container className="max-w-6xl">
        
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content */}
          <div className="flex-1 space-y-8 fade-in">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
               <div>
                  <Link to="/orders" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-black transition-colors mb-6">
                    <ChevronLeft className="w-3 h-3" /> Back to Registry
                  </Link>
                  <h1 className="text-4xl font-bold uppercase tracking-tight text-black mb-2 leading-none">Order Dossier</h1>
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                     <span>Ref: #{order._id?.substring(0,12)}</span>
                     <span className="w-1 h-1 bg-gray-300 rounded-full" />
                     <span>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
               </div>
               <Button variant="outline" className="px-8 border-black/10 hover:border-black text-[10px] font-bold">
                  <Download className="w-3 h-3 mr-3"/> Download Invoice
               </Button>
            </div>

            {/* Status Card */}
            <div className="bg-white border border-gray-100 overflow-hidden">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-gray-50">
                  <div className="p-10 border-r border-gray-50 flex flex-col items-center justify-center text-center">
                     <StatusIcon className={`w-10 h-10 mb-6 ${statusColor}`} />
                     <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-2">Stage</span>
                     <span className="text-sm font-bold uppercase tracking-widest text-black">{statusLabel}</span>
                  </div>
                  <div className="p-10 border-r border-gray-50 flex flex-col items-center justify-center text-center">
                     <CreditCard className="w-10 h-10 mb-6 text-gray-300" />
                     <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-2">Payment</span>
                     <span className={`text-sm font-bold uppercase tracking-widest ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.isPaid ? 'Cleared' : 'Pending'}
                     </span>
                  </div>
                  <div className="p-10 border-r border-gray-50 flex flex-col items-center justify-center text-center">
                     <MapPin className="w-10 h-10 mb-6 text-gray-300" />
                     <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-2">Delivery</span>
                     <span className="text-sm font-bold uppercase tracking-widest text-black">Registered Courier</span>
                  </div>
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                     <ShieldCheck className="w-10 h-10 mb-6 text-[var(--accent)]" />
                     <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-2">Protection</span>
                     <span className="text-sm font-bold uppercase tracking-widest text-black">5-Year Global</span>
                  </div>
               </div>
            </div>

            {/* Line Items */}
            <div className="bg-white border border-gray-100 p-10">
               <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-10 border-b border-gray-50 pb-6">Acquired Pieces</h3>
               <div className="space-y-12">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-12 group">
                      <div className="w-40 h-40 bg-[var(--bg-soft)] flex items-center justify-center p-8 transition-transform duration-700 group-hover:scale-105">
                        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain mix-blend-darken" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] font-bold mb-3 block">Swiss Precision</span>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-black mb-3">{item.name}</h3>
                        <p className="text-xs text-gray-400 tracking-widest uppercase mb-4">Quantity: {item.qty} • Ref: {(typeof item.product === 'string' ? item.product : item.product?._id || 'N/A').substring(0,8)}</p>
                        {order.status === 'delivered' && (
                           <Link to={`/return/${order._id}`} className="text-[10px] uppercase tracking-[0.2em] font-bold text-black border-b border-black pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors inline-block">
                              Initiate Collection Review
                           </Link>
                        )}
                      </div>
                      <div className="text-lg font-bold tracking-widest text-black">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-96 space-y-8 fade-in flex flex-col">
             
             {/* Summary Card */}
             <div className="bg-black text-white p-12 shadow-2xl">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--accent)] mb-10 border-b border-white/10 pb-6">Financial Recap</h3>
                <div className="space-y-6 mb-12">
                   <div className="flex justify-between text-xs tracking-[0.1em] opacity-60">
                      <span>Acquisition Total</span>
                      <span>₹{order.itemsPrice?.toLocaleString() || order.totalPrice?.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-xs tracking-[0.1em] opacity-60">
                      <span>Concierge Shipping</span>
                      <span>Complimentary</span>
                   </div>
                   <div className="flex justify-between text-xs tracking-[0.1em] opacity-60">
                      <span>Registry Surcharge</span>
                      <span>N/A</span>
                   </div>
                </div>
                <div className="border-t border-white/20 pt-8 flex justify-between items-baseline mb-12">
                   <span className="text-lg font-bold uppercase tracking-[0.2em]">Total</span>
                   <span className="text-4xl font-bold tracking-tighter">₹{order.totalPrice?.toLocaleString()}</span>
                </div>
                
                {order.status === 'delivered' ? (
                   <Button onClick={() => navigate('/catalog')} className="w-full py-5 bg-white text-black hover:bg-[var(--accent)] hover:text-white border-none">
                      Explore More
                   </Button>
                ) : (
                   <Button variant="outline" className="w-full py-5 border-white/20 text-white hover:bg-white hover:text-black tracking-[0.3em]">
                      View Registry
                   </Button>
                )}
             </div>

             {/* Address Card */}
             <div className="bg-white border border-gray-100 p-12">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-8 pb-4 border-b border-gray-50">Delivery Destination</h3>
                <div className="space-y-2">
                   <p className="text-sm font-bold uppercase tracking-widest text-black mb-4">{order.userId?.name || 'Authorized Client'}</p>
                   <p className="text-xs text-gray-500 tracking-wide font-light leading-relaxed">
                      {order.shippingAddress?.address}<br/>
                      {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br/>
                      {order.shippingAddress?.country}
                   </p>
                </div>
             </div>

             {/* Protective Measures */}
             <div className="p-8 border-2 border-dashed border-gray-200 text-center">
                <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-4 italic">Bespoke Heritage Insured</p>
                <div className="flex justify-center gap-4">
                   <div className="w-1 h-1 bg-gray-300 rounded-full" />
                   <div className="w-1 h-1 bg-[var(--accent)] rounded-full" />
                   <div className="w-1 h-1 bg-gray-300 rounded-full" />
                </div>
             </div>

          </div>
        </div>
      </Container>
    </div>
  );
};

export default OrderDetails;
