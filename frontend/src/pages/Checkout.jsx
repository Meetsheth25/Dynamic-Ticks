import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCartState } from '@/store/slices/cartSlice';
import { createOrder } from '@/store/slices/orderSlice';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Wallet, MoveRight, ChevronRight } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';
import api from '@/services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, totalPrice } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  // Load Razorpay Script
  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOnlinePayment = async (orderData) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const { data: orderResponse } = await api.post('/payment/order', 
        { amount: totalPrice }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "Dynamic Ticks",
        description: "Secure Acquisition of Luxury Horology",
        image: "/logo.png",
        order_id: orderResponse.id,
        handler: async (response) => {
          try {
            setLoading(true);
            // Verify Payment
            const { data: verifyData } = await api.post('/payment/verify', 
              {
                ...response,
                amount: orderResponse.amount
              }
            );

            // Create Order in DB
            finalizeOrder({ 
              ...orderData, 
              isPaid: true, 
              paidAt: new Date(),
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id
            });
            
            toast.success("Payment successful! Heritage acquired.");
          } catch (error) {
            toast.error("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        toast.error("Transaction declined: " + response.error.description);
        setLoading(false);
      });

      paymentObject.open();
    } catch (error) {
      console.error("Razorpay Error Details:", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown Error";
      if (!window.Razorpay && !error.response) {
         toast.error("Gateway blocked! Please disable ad-blockers/Brave Shields.");
      } else {
         toast.error(`Secure gateway error: ${errorMsg}`);
      }
      setLoading(false);
    }
  };

  const finalizeOrder = (orderData) => {
    dispatch(createOrder(orderData))
      .unwrap()
      .then(() => {
        setLoading(false);
        dispatch(clearCartState());
        localStorage.removeItem("cartItems"); 
        toast.success("Shipment Registry Created Successfully");
        navigate('/orders', { state: { newOrder: true, total: totalPrice } });
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Acquisition Failed: " + (err.message || err));
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    const orderData = {
      orderItems: items.map(i => ({ 
        name: i.name, 
        qty: i.qty, 
        image: i.image, 
        price: i.price, 
        product: i.product 
      })),
      shippingAddress: { 
        address: shippingInfo.address, 
        city: shippingInfo.city, 
        postalCode: shippingInfo.postalCode, 
        country: shippingInfo.country 
      },
      paymentMethod: paymentMethod === 'COD' ? 'COD' : 'Online',
      isPaid: false,
      itemsPrice: totalPrice,
      shippingPrice: 0,
      totalPrice: totalPrice,
    };

    if (paymentMethod === 'Online') {
      handleOnlinePayment(orderData);
    } else {
      finalizeOrder(orderData);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 fade-in">
      <Container>
        <div className="mb-20">
           <span className="text-sm uppercase tracking-[0.4em] font-bold text-[var(--accent)] mb-4 block">Registry Fulfillment / Checkout</span>
           <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-[0.1em] text-black leading-tight">
             Secure Acquisition
           </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-24">
          
          {/* LEFT: Checkout Form */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-16">
              
              <section>
                <div className="flex items-center gap-6 mb-10">
                   <span className="text-3xl font-mono text-gray-200">01</span>
                   <h2 className="text-sm uppercase tracking-[0.4em] font-black text-black border-b border-black pb-1">Client Credentials</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-2">
                     <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">First Identification</label>
                     <input 
                      type="text" 
                      name="firstName" 
                      value={shippingInfo.firstName} 
                      onChange={handleInputChange} 
                      placeholder="Gautam" 
                      className="w-full bg-transparent border-b border-gray-100 py-3 text-sm uppercase font-bold tracking-widest focus:border-black outline-none transition-colors" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Last Identification</label>
                     <input 
                      type="text" 
                      name="lastName" 
                      value={shippingInfo.lastName} 
                      onChange={handleInputChange} 
                      placeholder="Singhania" 
                      className="w-full bg-transparent border-b border-gray-100 py-3 text-sm uppercase font-bold tracking-widest focus:border-black outline-none transition-colors" 
                      required 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Shipping Destination</label>
                     <input 
                      type="text" 
                      name="address" 
                      value={shippingInfo.address} 
                      onChange={handleInputChange} 
                      placeholder="123 Heritage Tower, Marine Drive" 
                      className="w-full bg-transparent border-b border-gray-100 py-3 text-sm uppercase font-bold tracking-widest focus:border-black outline-none transition-colors" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">City / Jurisdiction</label>
                     <input 
                      type="text" 
                      name="city" 
                      value={shippingInfo.city} 
                      onChange={handleInputChange} 
                      placeholder="Mumbai" 
                      className="w-full bg-transparent border-b border-gray-100 py-3 text-sm uppercase font-bold tracking-widest focus:border-black outline-none transition-colors" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Registry Code (ZIP)</label>
                     <input 
                      type="text" 
                      name="postalCode" 
                      value={shippingInfo.postalCode} 
                      onChange={handleInputChange} 
                      placeholder="400001" 
                      className="w-full bg-transparent border-b border-gray-100 py-3 text-sm uppercase font-bold tracking-widest focus:border-black outline-none transition-colors" 
                      required 
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-6 mb-10">
                   <span className="text-3xl font-mono text-gray-200">02</span>
                   <h2 className="text-sm uppercase tracking-[0.4em] font-black text-black border-b border-black pb-1">Settlement Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => setPaymentMethod('Online')}
                    className={`relative p-8 border cursor-pointer transition-all duration-500 group ${paymentMethod === 'Online' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <CreditCard className={`w-8 h-8 mb-4 ${paymentMethod === 'Online' ? 'text-black' : 'text-gray-300'}`} />
                    <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-black mb-1">Encrypted Gateway</h3>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-medium italic">Instant Authorization</p>
                    {paymentMethod === 'Online' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('COD')}
                    className={`relative p-8 border cursor-pointer transition-all duration-500 group ${paymentMethod === 'COD' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <Wallet className={`w-8 h-8 mb-4 ${paymentMethod === 'COD' ? 'text-black' : 'text-gray-300'}`} />
                    <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-black mb-1">Manual Settlement</h3>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-medium italic">Payment on Delivery</p>
                    {paymentMethod === 'COD' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                  </div>
                </div>

                {paymentMethod === 'Online' && (
                  <div className="mt-12 space-y-4 animate-fade-in p-6 bg-gray-50 border border-gray-100">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold text-center leading-relaxed">
                      You will be redirected to the secure Razorpay payment gateway to complete your transaction after clicking Authorize Acquisition.
                    </p>
                  </div>
                )}
              </section>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-6 text-sm font-bold uppercase tracking-[0.4em] hover:bg-[var(--accent)] transition-all duration-500 shadow-xl flex items-center justify-center gap-6 group disabled:bg-gray-400"
              >
                {loading ? 'Authenticating...' : `Authorize Acquisition • ₹${totalPrice.toLocaleString()}`}
                {!loading && <MoveRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
              </button>

              <div className="flex justify-center items-center gap-4 opacity-30">
                 <ShieldCheck className="w-5 h-5 text-black" />
                 <span className="text-xs uppercase tracking-[0.5em] font-black text-black">256-BIT ENCRYPTED CRYPTO-LEDGER</span>
              </div>
            </form>
          </div>

          {/* RIGHT: Order Review Box */}
          <div className="w-full lg:w-[450px] shrink-0">
            <div className="sticky top-32">
              <div className="bg-[#FBFBFB] p-10">
                <h2 className="text-sm uppercase tracking-[0.4em] font-bold text-black mb-10 pb-4 border-b border-gray-100">Asset Manifest</h2>
                
                <div className="space-y-10 mb-12">
                  {items.map(item => (
                    <div key={item._id} className="flex gap-8 items-start">
                      <div className="w-24 h-24 bg-white p-4 flex items-center justify-center shrink-0">
                        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain mix-blend-darken" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-black uppercase tracking-widest mb-2 leading-tight truncate">{item.name}</h4>
                        <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-400 uppercase tracking-widest font-bold font-mono">Qty: {item.qty}</span>
                           <span className="text-sm font-bold text-black tracking-widest">₹{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-6 pt-10 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">Inventory Subtotal</span>
                    <span className="text-sm font-bold text-black tracking-widest">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">Concierge Fulfillment</span>
                    <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-[0.3em] italic">Complimentary</span>
                  </div>
                  
                  <div className="pt-8 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm uppercase tracking-[0.4em] font-black text-black">Total Acquisition</span>
                    <span className="text-3xl font-bold text-black tracking-widest">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-8 border border-gray-50 flex items-center gap-6">
                 <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                 </div>
                 <div>
                    <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-black mb-1">Lifetime Authenticity</h4>
                    <p className="text-xs text-gray-400 uppercase tracking-[0.1em] font-medium">Verified heritage documentation included</p>
                 </div>
              </div>
            </div>
          </div>
          
        </div>
      </Container>
    </div>
  );
};

export default Checkout;
;
