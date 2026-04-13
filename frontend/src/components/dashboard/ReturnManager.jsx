import React from 'react';
import { getImageUrl } from '@/utils/image';
import { approveReturn, rejectReturn } from '@/store/slices/adminSlice';

const ReturnManager = ({ orders, dispatch }) => {
  const returnOrders = orders.filter(o => o.returnRequest);

  return (
    <div className="space-y-12 fade-in">
      <div className="border-b border-gray-100 pb-10">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Concierge Service</h3>
        <h2 className="text-2xl font-bold uppercase tracking-widest text-black">Asset Returns & Exchanges</h2>
      </div>

      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Ref ID</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Client</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Asset</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Justification</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Resolution</th>
                <th className="p-6 text-right text-[9px] uppercase tracking-[0.3em] font-bold text-white">Finalize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {returnOrders.map((order) => (
                <tr key={order._id} className="group hover:bg-[#FBFBFB] transition-colors duration-300">
                  <td className="p-6 text-[10px] font-bold text-gray-400 border-r border-gray-50 uppercase tracking-widest font-mono">
                    {order._id.substring(0, 8)}...
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-black uppercase tracking-wider">{order.userId?.name || 'Authorized Client'}</p>
                    <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-sm ${order.returnRequest?.adminDecision === 'exchange' ? 'bg-blue-50 text-blue-600' : order.returnRequest?.adminDecision === 'refund' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                      {order.returnRequest?.adminDecision || 'Pending Audit'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-3">
                      {order.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[var(--bg-soft)] rounded-sm p-2">
                            <img src={getImageUrl(item.image)} className="w-full h-full object-contain mix-blend-darken" />
                          </div>
                          <span className="text-[10px] font-bold text-black uppercase tracking-tight">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-[10px] font-bold text-black uppercase tracking-wider mb-1">{order.returnRequest?.reason || 'Asset Quality'}</p>
                    <p className="text-[9px] text-gray-400 font-medium leading-relaxed max-w-[200px]">{order.returnRequest?.description || 'No detailed brief provided.'}</p>
                  </td>
                  <td className="p-6 text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    {new Date(order.returnRequest?.requestedAt || order.updatedAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-6 text-right">
                    {order.status === 'return_requested' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => dispatch(approveReturn({ id: order._id, adminDecision: 'refund' }))} className="text-[8px] font-bold text-amber-600 bg-amber-50 px-4 py-2 hover:bg-amber-100 transition-colors uppercase tracking-widest">
                          Liquidate
                        </button>
                        <button onClick={() => dispatch(approveReturn({ id: order._id, adminDecision: 'exchange' }))} className="text-[8px] font-bold text-blue-600 bg-blue-50 px-4 py-2 hover:bg-blue-100 transition-colors uppercase tracking-widest">
                          Exchange
                        </button>
                        <button onClick={() => dispatch(rejectReturn(order._id))} className="text-[8px] font-bold text-rose-600 bg-rose-50 px-4 py-2 hover:bg-rose-100 transition-colors uppercase tracking-widest">
                          Deny
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {returnOrders.length === 0 && (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">No Outstanding Claims</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReturnManager;
