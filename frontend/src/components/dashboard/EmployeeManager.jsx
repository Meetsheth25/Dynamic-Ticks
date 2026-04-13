import React, { useState } from 'react';
import { Plus, XCircle, Edit, Trash2 } from 'lucide-react';
import { createEmployee, updateEmployee, deleteEmployee } from '@/store/slices/employeeSlice';

const EmployeeManager = ({ employees, dispatch }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', isActive: true });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEmp) {
      dispatch(updateEmployee({ id: editingEmp._id, ...form }));
    } else {
      dispatch(createEmployee(form));
    }
    setShowForm(false);
  };

  const startEdit = (emp) => {
    setEditingEmp(emp);
    setForm({ name: emp.name, email: emp.email, role: emp.role, isActive: emp.isActive, password: '' });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this employee?')) dispatch(deleteEmployee(id));
  };

  const toggleActive = (emp) => {
    dispatch(updateEmployee({ id: emp._id, isActive: !emp.isActive }));
  };

  const ROLE_STYLES = {
    manager: 'text-purple-600 bg-purple-50 border-purple-100',
    staff: 'text-blue-600 bg-blue-50 border-blue-100',
    delivery: 'text-amber-600 bg-amber-50 border-amber-100',
  };

  return (
    <div className="space-y-12 fade-in">
      <div className="flex justify-between items-end border-b border-gray-100 pb-10">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Human Resources</h3>
          <h2 className="text-2xl font-bold uppercase tracking-widest text-black">Staff Control Panel</h2>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditingEmp(null); setForm({ name: '', email: '', password: '', role: 'staff', isActive: true }); }}
            className="bg-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[var(--accent)] transition-all duration-300 flex items-center gap-3">
            <Plus className="w-3 h-3" /> Onboard Staff
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 p-10 relative">
          <button type="button" onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black border-b border-gray-50 pb-4 mb-8">
            {editingEmp ? 'Modify Employee Record' : 'New Employee Onboarding'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Email Address', key: 'email', type: 'email' },
              { label: editingEmp ? 'New Password (leave blank to keep)' : 'Password', key: 'password', type: 'password' },
            ].map(({ label, key, type }) => (
              <div key={key} className="group">
                <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">{label}</label>
                <input type={type} required={!editingEmp || key !== 'password'}
                  className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors"
                  value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="group">
              <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Role Assignment</label>
              <select className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer"
                value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="delivery">Delivery Person</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="emp-active" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-black w-4 h-4 cursor-pointer" />
              <label htmlFor="emp-active" className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 cursor-pointer">Active Employee</label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[var(--accent)] transition-all duration-500 shadow-xl">
                {editingEmp ? 'Update Record' : 'Register Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                {['Employee', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map(emp => (
                <tr key={emp._id} className="group hover:bg-[#FBFBFB] transition-colors duration-300">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs font-bold text-black uppercase tracking-wider">{emp.name}</p>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-gray-500 italic">{emp.email}</td>
                  <td className="p-6">
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 border ${ROLE_STYLES[emp.role] || 'text-gray-600 bg-gray-50 border-gray-100'}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <button onClick={() => toggleActive(emp)}
                      className={`text-[8px] font-bold uppercase tracking-widest px-4 py-2 transition-colors ${emp.isActive ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                        }`}>
                      {emp.isActive ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(emp)} className="p-3 text-gray-300 hover:text-black hover:bg-white transition-all duration-300 border border-transparent hover:border-gray-100">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(emp._id)} className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 border border-transparent hover:border-rose-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan="5" className="p-20 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">No Employees Registered</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManager;
