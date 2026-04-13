import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, returnUserOrder } from '@/store/slices/orderSlice';
import { CheckCircle, ShieldAlert, History, MoveRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Container } from '@/components/common/Container';

const ReturnProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [reason, setReason] = useState('Damaged product');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { orders, loading } = useSelector(state => state.orders);
  const order = orders.find(o => o._id === id);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setSubmitError('Please provide a brief justification.');
      return;
    }
    setSubmitting(true);

    try {
      await dispatch(returnUserOrder({ 
        id, 
        data: { reason, description } 
      })).unwrap();
      setSubmitted(true);
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      setSubmitError(err || 'Failed to authorize return request.');
      setSubmitting(false);
    }
  };

  if (loading && !order) return (
    <div className="pt-60 flex flex-col items-center justify-center">
       <div className="w-12 h-12 border border-gray-100 border-t-black rounded-full animate-spin mb-4" />
       <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-300">Syncing Ledger...</span>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-white flex items-center justify-center fade-in">
      <div className="text-center max-w-sm px-10">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-10">
           <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold uppercase tracking-[0.15em] text-black mb-6">Request Dispatched</h2>
        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] leading-relaxed mb-10">
          Our concierge team has received your request. We will audit the asset and provide a resolution shortly.
        </p>
        <div className="h-0.5 bg-gray-50 overflow-hidden w-40 mx-auto">
           <div className="bg-black h-full animate-progress-fast" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 fade-in">
      <Container className="max-w-2xl">
        <div className="mb-20 text-center">
           <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--accent)] mb-4 block">Concierge Service / Returns</span>
           <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-[0.1em] text-black leading-tight mb-6">
             Asset Restoration
           </h1>
           <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium max-w-md mx-auto">Please provide the necessary justification for the return of your heritage timepiece.</p>
        </div>

        <div className="bg-[#FBFBFB] p-12 border border-gray-50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-black flex items-center gap-3">
                <ShieldAlert className="w-3.5 h-3.5 text-gray-300" /> Primary Reason
              </label>
              <div className="relative group">
                <select 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white border border-gray-100 p-5 text-[10px] uppercase font-bold tracking-widest focus:border-black outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Damaged product">Asset Irregularity</option>
                  <option value="Wrong item">Mismatched Fulfillment</option>
                  <option value="Not satisfied">Standard Preference</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-black transition-colors">
                   <MoveRight className="w-3 h-3 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-black flex items-center gap-3">
                <History className="w-3.5 h-3.5 text-gray-300" /> Detailed Justification
              </label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
                className="w-full bg-white border border-gray-100 p-5 text-[10px] uppercase font-bold tracking-wider focus:border-black outline-none transition-all resize-none placeholder:text-gray-200"
                placeholder="Brief our concierge team on the situation..."
              />
            </div>

            {submitError && (
              <div className="p-4 border border-rose-100 bg-rose-50/50">
                 <p className="text-[9px] uppercase tracking-widest text-rose-500 font-bold">{submitError}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--accent)] transition-all duration-500 shadow-xl flex items-center justify-center gap-6 group disabled:bg-gray-400"
            >
              {submitting ? 'Dispatching...' : 'Dispatch Request'}
              {!submitting && <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[8px] uppercase tracking-[0.3em] text-gray-300 font-bold">
             All requests are audited within 24 business hours.
           </p>
        </div>
      </Container>
    </div>
  );
};

export default ReturnProduct;
