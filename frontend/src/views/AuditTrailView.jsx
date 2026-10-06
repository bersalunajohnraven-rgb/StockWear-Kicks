import React, { useState } from 'react';
import { History, TrendingUp, TrendingDown, SlidersHorizontal, Building2, User } from 'lucide-react';
import { Badge } from '../components/Badge';

export const AuditTrailView = ({ currentUser, stockMovements = [], branches = [] }) => {
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');

  const isOwnerOrAdmin =
    currentUser?.role_name === 'owner' || currentUser?.role_name === 'admin';

  const filtered = stockMovements.filter(m => {
    const matchReason = reasonFilter === 'ALL' || m.reason === reasonFilter;
    const matchBranch = branchFilter === 'ALL' || m.branchID === branchFilter;
    return matchReason && matchBranch;
  });

  const reasonVariant = {
    sale: 'primary',
    delivery: 'success',
    manual_adjustment: 'warning'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="h-6 w-6 text-purple-400" />
            Stock Movement Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every inventory change — sale deductions, delivery increments, and manual edits — is logged automatically by the database trigger with actor ID, delta, and reference.
          </p>
        </div>
        <Badge variant="purple" size="md">{filtered.length} Logged Events</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Reason:</span>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="sale">Sale Deductions</option>
            <option value="delivery">Delivery Receipts</option>
            <option value="manual_adjustment">Manual Adjustments</option>
          </select>
        </div>
        {isOwnerOrAdmin && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      {/* Audit Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Movement ID</th>
                <th className="px-4 py-3.5 font-semibold">Product</th>
                {isOwnerOrAdmin && <th className="px-4 py-3.5 font-semibold">Branch</th>}
                <th className="px-4 py-3.5 font-semibold text-center">Quantity Δ</th>
                <th className="px-4 py-3.5 font-semibold text-center">Reason / Type</th>
                <th className="px-4 py-3.5 font-semibold">Actor (User)</th>
                <th className="px-4 py-3.5 font-semibold">Timestamp</th>
                <th className="px-4 py-3.5 font-semibold">Reference ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No audit events recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.movementID} className="hover:bg-slate-850/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[10px] text-purple-400">
                      {m.movementID}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{m.product?.name || 'Product'}</div>
                      <div className="font-mono text-[10px] text-slate-500">{m.product?.sku}</div>
                    </td>
                    {isOwnerOrAdmin && (
                      <td className="px-4 py-3.5 text-slate-300">{m.branch?.name || 'Branch'}</td>
                    )}
                    <td className="px-4 py-3.5 text-center">
                      <div className={`flex items-center justify-center gap-1 font-mono font-bold text-sm ${
                        m.change_qty > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {m.change_qty > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {m.change_qty > 0 ? `+${m.change_qty}` : m.change_qty}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={reasonVariant[m.reason] || 'default'} size="sm">
                        {m.reason?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <User className="h-3 w-3 text-slate-500 shrink-0" />
                        <span>{m.actorName || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[10px] text-slate-500">
                      {m.reference_id ? m.reference_id.slice(0, 12) + '...' : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
