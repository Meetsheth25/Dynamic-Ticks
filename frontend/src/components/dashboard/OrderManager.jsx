import React from 'react';
import { XCircle } from 'lucide-react';
import { updateOrderStatus, cancelOrder } from '@/store/slices/adminSlice';
import { updateEstimatedDeliveryDate } from '@/store/slices/orderSlice';
import { updateStaffOrderStatus } from '@/store/slices/employeeSlice';

const OrderManager = ({ orders, dispatch, deliveryPersons, fetchOrders }) => {
  return (
    <div className="space-y-12 fade-in">
      <div className="border-b border-gray-100 pb-10">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Transaction Ledger</h3>
        <h2 className="text-2xl font-bold uppercase tracking-widest text-black">Acquisition Fulfillment</h2>
      </div>

      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Ref ID</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Beneficiary</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Asset Value</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Configuration</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Status</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Delivery Staff</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Timeline</th>
                <th className="p-6 text-right text-[9px] uppercase tracking-[0.3em] font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order._id} className="group hover:bg-[#FBFBFB] transition-colors duration-300">
                  <td className="p-6 text-[10px] font-bold text-black border-r border-gray-50 uppercase tracking-widest bg-gray-50/30 font-mono">
                    {order._id.substring(0, 12)}...
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-black uppercase tracking-wider">{order.userId?.name || 'Exclusive Client'}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1 font-bold">{order.userId?.email || 'Unauthorized'}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-black tracking-widest">Rs. {order.totalPrice?.toLocaleString()}</p>
                    <span className="text-[8px] uppercase tracking-widest text-emerald-500 font-bold">Authorized</span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-3">
                      {order.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                          <span className="text-[10px] font-bold text-black uppercase tracking-tight">{item.name}</span>
                          <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Units: {item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-6">
                    <select
                      value={order.status}
                      onChange={(e) => dispatch(updateOrderStatus({ id: order._id, status: e.target.value }))}
                      className={`text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-sm border-0 outline-none shadow-sm cursor-pointer transition-colors appearance-none text-center min-w-[120px] ${order.status === 'processing' ? 'bg-amber-50 text-amber-600' :
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                        'bg-emerald-50 text-emerald-600'
                        }`}
                    >
                      <option value="processing">Awaiting Prep</option>
                      <option value="shipped">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Voided</option>
                    </select>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      <select
                        style={{
                          background: 'rgba(0,0,0,0.03)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: '#000',
                          appearance: 'none',
                          cursor: 'pointer'
                        }}
                        value={order.assignedDeliveryPerson?._id || ''}
                        onChange={async (e) => {
                          if (!e.target.value) return;
                          try {
                            await dispatch(updateStaffOrderStatus({ id: order._id, data: { assignedDeliveryPerson: e.target.value } })).unwrap();
                            if (fetchOrders) fetchOrders();
                          } catch (err) { alert(err || 'Failed to assign delivery person'); }
                        }}
                      >
                        <option value="">— Assign Delivery Person —</option>
                        {deliveryPersons.map(dp => (
                          <option key={dp._id} value={dp._id}>{dp.name} ({dp.activeDeliveries || 0} active)</option>
                        ))}
                      </select>
                      {order.assignedDeliveryPerson && (
                        <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest text-center mt-1">Currently: {order.assignedDeliveryPerson.name}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2 min-w-[130px]">
                      <input
                        type="date"
                        className="bg-gray-50/50 border border-gray-100 p-2 text-[9px] font-bold uppercase focus:outline-none focus:border-black"
                        value={order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : ''}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={async (e) => {
                          try {
                            await dispatch(updateEstimatedDeliveryDate({ id: order._id, dateData: { estimatedDeliveryDate: e.target.value } })).unwrap();
                            if (fetchOrders) fetchOrders();
                          } catch (err) { alert(err || 'Early delivery only'); }
                        }}
                      />
                      {order.estimatedDeliveryDate && (
                        <span className="text-[7px] text-gray-400 uppercase tracking-widest text-center">Early only</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    {order.status !== 'cancelled' && (
                      <button
                        onClick={() => dispatch(cancelOrder(order._id))}
                        className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 border border-transparent hover:border-rose-100"
                        title="Void Transaction"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">No Transactions in Ledger</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;
