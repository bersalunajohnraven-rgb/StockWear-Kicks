import React, { useState } from 'react';
import { Building2, Plus, Pencil, MapPin, Phone, Users } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

const EMPTY_FORM = { name: '', city: '', region: '', phone: '' };

export const BranchesView = ({ branches = [], users = [], onSaveBranch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (branch) => {
    setEditing(branch);
    setForm({ name: branch.name, city: branch.city || '', region: branch.region || '', phone: branch.phone || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSaveBranch({ ...(editing || {}), ...form });
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getBranchStaff = (branchID) =>
    users.filter(u => u.branchID === branchID);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-400" />
            Branch Network Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure your store locations. Each branch has isolated inventory governed by RLS policies.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </button>
      </div>

      {/* Branch Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {branches.length === 0 ? (
          <div className="col-span-3 rounded-2xl border border-dashed border-slate-700 py-16 text-center text-slate-500 text-sm">
            No branches configured. Add your first branch.
          </div>
        ) : (
          branches.map((branch) => {
            const staff = getBranchStaff(branch.branchID);
            const manager = staff.find(u => u.role_name === 'branch_manager');
            return (
              <div key={branch.branchID}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl hover:border-indigo-700/50 transition-all group relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-900/40 p-2.5">
                      <Building2 className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{branch.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{branch.branchID?.slice(0, 12)}…</div>
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(branch)}
                    className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-400">
                  {(branch.city || branch.region) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                      <span>{[branch.city, branch.region].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-slate-500 shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-slate-500 shrink-0" />
                    <span>{staff.length} staff member{staff.length !== 1 ? 's' : ''}</span>
                    {manager && (
                      <Badge variant="primary" size="sm">
                        Mgr: {manager.full_name?.split(' ')[0]}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                  {staff.map(u => (
                    <div key={u.userID}
                      title={`${u.full_name} (${u.role_name})`}
                      className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                      {(u.full_name || '?').charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? `Edit Branch: ${editing.name}` : 'Add New Branch'}
        subtitle="Branches are the core data isolation unit in StockWear Kicks."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {[
            { label: 'Branch Name', key: 'name', placeholder: 'e.g. SM Megamall Branch', required: true },
            { label: 'City', key: 'city', placeholder: 'e.g. Mandaluyong' },
            { label: 'Region', key: 'region', placeholder: 'e.g. NCR' },
            { label: 'Phone / Contact', key: 'phone', placeholder: 'e.g. +63 2 8888 1234' },
          ].map(({ label, key, placeholder, required }) => (
            <div key={key}>
              <label className="block text-slate-400 mb-1 font-medium">{label}</label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Branch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
