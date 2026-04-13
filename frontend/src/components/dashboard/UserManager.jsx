import React, { useState } from 'react';
import { Search, Trash2, Ban, Lock, Unlock } from 'lucide-react';

const UserManager = ({ users, dispatch, toggleBlockAction, deleteAction, makeAdminAction, removeAdminAction, showAdminActions = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id.includes(searchTerm)
  );

  const handleToggleBlock = (id, isBlocked) => {
    const actionLabel = isBlocked ? 'Unblock' : 'Block';
    if (window.confirm(`Are you sure you want to ${actionLabel} this client?`)) {
      dispatch(toggleBlockAction(id));
    }
  };

  return (
    <div className="space-y-12 fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Heritage Ledger</h3>
          <h2 className="text-2xl font-bold uppercase tracking-widest text-black">Client Registry</h2>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" />
          <input
            type="text"
            placeholder="Search by Identity or ID..."
            className="w-full bg-white border border-gray-100 pl-12 pr-6 py-4 text-[10px] uppercase tracking-widest font-bold focus:border-black outline-none transition-all placeholder:text-gray-200 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Beneficiary</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Authentication</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Acquisitions</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Access Status</th>
                {showAdminActions && (
                  <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Privilege</th>
                )}
                <th className="p-6 text-right text-[9px] uppercase tracking-[0.3em] font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user._id} className={`group hover:bg-[#FBFBFB] transition-colors duration-300 ${user.isBlocked ? 'opacity-70 bg-gray-50/50' : ''}`}>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      {user.isBlocked && <Lock className="w-3 h-3 text-rose-500" />}
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${user.isBlocked ? 'text-gray-400 line-through' : 'text-black'}`}>{user.name}</p>
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1 font-bold font-mono">ID: {user._id.substring(0, 10)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-xs font-medium text-gray-500 uppercase tracking-tight italic">{user.email}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-black">{user.totalOrders || 0}</span>
                      <div className="w-12 bg-gray-50 h-0.5"><div className="bg-black h-full" style={{ width: `${Math.min(100, (user.totalOrders || 0) * 20)}%` }} /></div>
                    </div>
                  </td>
                  <td className="p-6">
                    <button 
                      onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                      className={`text-[8px] font-bold uppercase tracking-widest px-4 py-2 transition-all duration-300 border flex items-center gap-2 ${
                        user.isBlocked 
                        ? 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100' 
                        : 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-black hover:text-white hover:border-black'
                      }`}
                    >
                      {user.isBlocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </button>
                  </td>
                  {showAdminActions && (
                    <td className="p-6">
                      {user.isAdmin ? (
                        <button onClick={() => { if (window.confirm('Revoke administrator status?')) dispatch(removeAdminAction(user._id)); }} className="text-[8px] font-bold text-purple-600 bg-purple-50 px-4 py-2 hover:bg-purple-100 transition-colors uppercase tracking-widest border border-purple-100">Master Admin</button>
                      ) : (
                        <button onClick={() => { if (window.confirm('Promote this client to Administrator?')) dispatch(makeAdminAction(user._id)); }} className="text-[8px] font-bold text-gray-400 bg-gray-50 px-4 py-2 hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-widest border border-gray-100">Authorize Staff</button>
                      )}
                    </td>
                  )}
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                       {deleteAction && (
                        <button
                          onClick={() => { if (window.confirm('Excommunicate this client?')) dispatch(deleteAction(user._id)) }}
                          className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 border border-transparent hover:border-rose-100 active:scale-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">No Match in Registry</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
