import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, addToCart } from '@/store/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, MoveRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';

const Cart = () => {
  const { items, totalPrice, totalQuantity } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleQuantity = (id, current, change) => {
    const newQuantity = current + change;
    if (newQuantity > 0) {
      dispatch(addToCart({ ...items.find(i => i._id === id), qty: change }));
    }
  };

  if (items.length === 0) {
    return (
      <Container className="min-h-[80vh] flex flex-col items-center justify-center pt-32 text-center fade-in">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-10">
           <ShoppingBag className="w-8 h-8 text-gray-200" />
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-[0.2em] text-black mb-6">Your Collection is Empty</h2>
        <p className="text-gray-400 max-w-sm mx-auto mb-12 text-xs uppercase tracking-[0.2em] font-medium leading-relaxed">
          The registry awaits your selection. Explore our heritage timepieces to begin your acquisition.
        </p>
        <Link to="/catalog">
          <button className="bg-black text-white text-[10px] uppercase tracking-[0.4em] font-bold px-12 py-5 hover:bg-[var(--accent)] transition-all duration-500 shadow-xl">
            Return to Registry
          </button>
        </Link>
      </Container>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 fade-in">
      <Container>
        <div className="mb-20 pb-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-end gap-6">
           <div>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--accent)] mb-4 block">Acquisition / Bag</span>
              <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-[0.1em] text-black leading-tight">
                Shopping Bag
              </h1>
           </div>
           <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">
             {totalQuantity} Timepieces Reserved
           </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Cart Items List */}
          <div className="flex-1">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-8 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">
              <div className="col-span-7">Heritage Item</div>
              <div className="col-span-2 text-center">Batch</div>
              <div className="col-span-3 text-right">Valuation</div>
            </div>

            <div className="divide-y divide-gray-50 border-t border-gray-50">
              {items.map(item => (
                <div key={item._id} className="py-12 grid grid-cols-1 sm:grid-cols-12 gap-8 items-center group">
                  
                  {/* Product Column */}
                  <div className="col-span-7 flex gap-10 items-center">
                    <div className="w-32 h-32 bg-[#FBFBFB] p-6 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-105">
                      <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain mix-blend-darken" />
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-[var(--accent)] mb-2 block">{item.category || 'Luxury'}</span>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-3 leading-tight">{item.name}</h3>
                      <p className="text-[10px] font-bold text-black tracking-widest border-b border-black w-fit pb-0.5">₹{item.price?.toLocaleString()}</p>
                      
                      {item.config && (
                        <div className="mt-4 flex flex-wrap gap-4">
                           <div className="flex flex-col">
                              <span className="text-[7px] uppercase tracking-widest text-gray-400 font-bold">Strap</span>
                              <span className="text-[9px] uppercase tracking-wider text-black font-bold">{item.config.strapMaterial}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[7px] uppercase tracking-widest text-gray-400 font-bold">Finish</span>
                              <span className="text-[9px] uppercase tracking-wider text-black font-bold">{item.config.color}</span>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quantity Column */}
                  <div className="col-span-12 sm:col-span-2 flex justify-start sm:justify-center items-center">
                    <div className="flex items-center border border-gray-100 p-1">
                      <button 
                        onClick={() => handleQuantity(item._id, item.qty, -1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-black transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-[10px] font-bold text-black font-mono">{item.qty}</span>
                      <button 
                        onClick={() => handleQuantity(item._id, item.qty, 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-black transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Total & Action Column */}
                  <div className="col-span-12 sm:col-span-3 flex justify-between sm:flex-col sm:justify-center items-center sm:items-end gap-4 text-right">
                    <span className="text-lg font-bold text-black tracking-widest">₹{(item.price * item.qty).toLocaleString()}</span>
                    <button 
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="text-gray-300 hover:text-rose-500 transition-colors uppercase text-[8px] font-bold tracking-[0.3em] flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" /> Remove Asset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Summary Panel */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-32 bg-black p-10 shadow-2xl">
              <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-500 mb-10 pb-6 border-b border-white/10">Investment Summary</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">Inventory Subtotal</span>
                  <span className="text-sm font-bold text-white tracking-widest">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">Concierge Shipping</span>
                  <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-[0.3em] italic">Complimentary</span>
                </div>
                
                <div className="pt-8 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white">Total Valuation</span>
                    <span className="text-3xl font-bold text-white tracking-widest">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-[7px] uppercase tracking-widest text-gray-500 mt-2 italic">*All duties and taxes included in valuation</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-[var(--accent)] text-black py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all duration-500 shadow-xl mb-10 flex items-center justify-center gap-4 group"
              >
                Secure Acquisition <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
              
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/5 opacity-40">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span className="text-[7px] uppercase tracking-[0.4em] text-white font-bold">Encrypted Transaction Ledger</span>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
};

export default Cart;
