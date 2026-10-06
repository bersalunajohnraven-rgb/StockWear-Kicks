import React, { useState } from 'react';
import { Users, Plus, Pencil, Shield, Building2, Mail } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

const ROLE_VARIANTS = {
  owner: 'warning',
  admin: 'warning',
  branch_manager: 'primary',
  cashier: 'success'
};

const ROLE_LABELS = {
  owner: 'Owner / Admin',
  admin: 'Admin',
  branch_manager: 'Branch Manager',
  cashier: 'Cashier / Sales Staff'
};

const EMPTY_FORM = {
  full_name: '',
  email: '',
  password: '',
  role_name: 'cashier',
  branchID: ''
};

export const StaffView = ({ users = [], branches = [], currentUser, onSaveUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');

  const isOwnerOrAdmin = ['owner', 'admin'].includes(currentUser?.role_name);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, branchID: branches[0]?.branchID || '' });
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      full_name: user.full_name || '',
      email: user.email || '',
      password: '',
      role_name: user.role_name || 'cashier',
      branchID: user.branchID || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSaveUser({ ...(editing || {}), ...form });
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role_name === roleFilter;
    const matchBranch = branchFilter === 'ALL' || u.branchID === branchFilter;
    return matchRole && matchBranch;
  });

  const getBranch = (branchID) => branches.find(b => b.branchID === branchID);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            Staff Account Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage user accounts and role assignments. Access is enforced by RBAC middleware and Postgres RLS policies.
          </p>
        </div>
        {isOwnerOrAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <Shield className="h-4 w-4 text-slate-400 shrink-0" />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
        >
          <option value="ALL">All Roles</option>
          <option value="owner">Owner</option>
          <option value="branch_manager">Branch Manager</option>
          <option value="cashier">Cashier</option>
        </select>
        <Building2 className="h-4 w-4 text-slate-400" />
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
        >
          <option value="ALL">All Branches</option>
          {branches.map(b => (
            <option key={b.branchID} value={b.branchID}>{b.name}</option>
          ))}
        </select>
        <Badge variant="default" size="md">{filtered.length} accounts</Badge>
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Staff Member</th>
                <th className="px-4 py-3.5 font-semibold">Role</th>
                <th className="px-4 py-3.5 font-semibold">Assigned Branch</th>
                <th className="px-4 py-3.5 font-semibold">Email</th>
                <th className="px-4 py-3.5 font-semibold">Account Status</th>
                {isOwnerOrAdmin && <th className="px-5 py-3.5 font-semibold text-center">Edit</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No staff accounts match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const branch = getBranch(user.branchID);
                  const isMe = user.userID === currentUser?.userID;
                  return (
                    <tr key={user.userID} className={`hover:bg-slate-850/40 transition-colors ${isMe ? 'bg-indigo-950/20' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white shadow-md shrink-0">
                            {(user.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {user.full_name}
                              {isMe && <span className="ml-2 text-[10px] text-indigo-400 font-normal">(you)</span>}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500">{user.userID?.slice(0, 12)}…</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={ROLE_VARIANTS[user.role_name] || 'default'} size="sm">
                          {ROLE_LABELS[user.role_name] || user.role_name}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        {branch ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3 w-3 text-indigo-400 shrink-0" />
                            <span className="text-slate-300">{branch.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">— All Branches —</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Mail className="h-3 w-3 text-slate-500 shrink-0" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="success" size="sm">Active</Badge>
                      </td>
                      {isOwnerOrAdmin && (
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => openEdit(user)}
                            className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? `Edit: ${editing.full_name}` : 'Add Staff Member'}
        subtitle="Role assignment governs RBAC middleware and Postgres RLS policies."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
            <input type="text" value={form.full_name}
              onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
              required placeholder="e.g. Maria Santos"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required placeholder="maria@stockline.ph"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          {!editing && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Password</label>
              <input type="password" value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                required placeholder="At least 8 characters"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Role</label>
            <select value={form.role_name}
              onChange={(e) => setForm(f => ({ ...f, role_name: e.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="cashier">Cashier / Sales Staff</option>
              <option value="branch_manager">Branch Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Assigned Branch</label>
            <select value={form.branchID}
              onChange={(e) => setForm(f => ({ ...f, branchID: e.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">— All Branches (Owner) —</option>
              {branches.map(b => (
                <option key={b.branchID} value={b.branchID}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
