import React, { useState } from 'react';
import { ShoppingCart, Search, Eye, Building2, Clock, User } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const SalesHistoryView = ({ currentUser, sales = [] }) => {
  const [search, setSearch] = useState('');
  const [viewingSale, setViewingSale] = useState(null);

  const role = currentUser?.role_name || 'owner';
  const isOwnerOrAdmin = role === 'owner' || role === 'admin';

  const filteredSales = sales.filter(s => {
    const matchSearch =
      s.saleID?.toLowerCase().includes(search.toLowerCase()) ||
      s.cashierName?.toLowerCase().includes(search.toLowerCase()) ||
      s.branchName?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const totalRevenue = filteredSales.reduce(
    (sum, s) => sum + (parseFloat(s.total_amount) || 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-emerald-400" />
            {isOwnerOrAdmin ? 'Consolidated Sales Ledger' : role === 'branch_manager' ? 'Branch Sales Log' : 'My Logged Transactions'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {role === 'cashier'
              ? 'Your personal transaction history. Stock deductions are logged automatically by the database trigger.'
              : 'Every sale auto-deducts stock via trigger and records the cashier, branch, and timestamp.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            {filteredSales.length} Transactions
          </Badge>
          <Badge variant="primary" size="md">
            ₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} Gross
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        <Search className="absolute left-7.5 top-6.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Sale ID, Cashier name, or Branch..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Transaction ID</th>
                {isOwnerOrAdmin && <th className="px-4 py-3.5 font-semibold">Branch</th>}
                {role !== 'cashier' && <th className="px-4 py-3.5 font-semibold">Cashier</th>}
                <th className="px-4 py-3.5 font-semibold text-right">Total Amount</th>
                <th className="px-4 py-3.5 font-semibold text-center">Line Items</th>
                <th className="px-4 py-3.5 font-semibold">Transaction Time</th>
                <th className="px-5 py-3.5 font-semibold text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No sales records found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.saleID} className="hover:bg-slate-850/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-indigo-400 font-semibold text-[11px]">
                      {sale.saleID}
                    </td>
                    {isOwnerOrAdmin && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-indigo-400 shrink-0" />
                          <span className="text-slate-300">{sale.branchName}</span>
                        </div>
                      </td>
                    )}
                    {role !== 'cashier' && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{sale.cashierName}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400 text-sm">
                      ₱{parseFloat(sale.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="default" size="sm">
                        {(sale.sale_items || []).length} items
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {new Date(sale.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => setViewingSale(sale)}
                        className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {viewingSale && (
        <Modal
          isOpen={true}
          onClose={() => setViewingSale(null)}
          title={`Sale Detail: ${viewingSale.saleID}`}
          subtitle={`${viewingSale.branchName || 'Branch'} • Cashier: ${viewingSale.cashierName || 'Staff'}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="border-b border-slate-800 pb-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Transaction Time:</span>
                  <span className="text-white">{new Date(viewingSale.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="divide-y divide-slate-800/80">
                {(viewingSale.sale_items || []).map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">{item.productName || item.name || 'Product'}</div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        {item.quantity} × ₱{parseFloat(item.unit_price || 0).toFixed(2)}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      ₱{(item.quantity * parseFloat(item.unit_price || 0)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-base text-white">
                <span>TOTAL:</span>
                <span className="font-mono text-emerald-400">₱{parseFloat(viewingSale.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3 text-[11px] text-slate-400">
              <strong className="text-indigo-300">Database Trigger Executed:</strong> Stock was atomically deducted from inventory and a <code>stock_movements</code> audit row was inserted by the server-side trigger for each item in this sale.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
