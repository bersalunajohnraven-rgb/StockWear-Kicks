import React from 'react';
import { 
  Building2, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart, 
  Truck, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Clock
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const AdminDashboard = ({ 
  branches = [], 
  inventory = [], 
  products = [], 
  sales = [], 
  restockRequests = [], 
  onApproveRequest, 
  onNavigate 
}) => {
  // Compute consolidated metrics
  const totalStockItems = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockCount = inventory.filter(item => item.quantity <= item.reorder_threshold).length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
  const totalRevenue = sales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0);
  const pendingRestocks = restockRequests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Top Banner: Regional Consolidation Notice */}
      <div className="rounded-2xl border border-indigo-800/40 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-300 border border-orange-500/30">
                Footwear Retail Executive Console
              </span>
              <span className="text-xs text-slate-400">Consolidating {branches.length} Active Outlets</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Footwear Inventory & Restocking Hub
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Cross-branch operational monitoring for sneaker stock levels, automated Postgres restock triggers, and centralized purchase order authorization.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate('inventory')}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-950/40 hover:brightness-110 transition-all"
            >
              View Global Shoe Stock
            </button>
            <button
              onClick={() => onNavigate('purchase-orders')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              Restock Approvals ({pendingRestocks.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Units Across Branches"
          value={totalStockItems.toLocaleString()}
          subtitle={`${products.length} catalog products`}
          icon={Package}
          color="indigo"
          trend="+12% from last delivery"
        />
        <StatCard
          title="Gross Sales Revenue"
          value={`₱${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${sales.length} logged transactions`}
          icon={ShoppingCart}
          color="emerald"
          trend="Real-time sales logging"
        />
        <StatCard
          title="Low-Stock Alerts"
          value={lowStockCount}
          subtitle={`${outOfStockCount} items at zero stock`}
          icon={AlertTriangle}
          color={lowStockCount > 0 ? "amber" : "emerald"}
          trend="Auto-triggered by threshold"
        />
        <StatCard
          title="Operational Branches"
          value={branches.length}
          subtitle="All isolated via RLS"
          icon={Building2}
          color="cyan"
          trend="Central DB Synced"
        />
      </div>

      {/* Pending Restock Requests Approval Queue (Store Owner capability) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Central Restock Approval Queue</h3>
              <Badge variant="warning">{pendingRestocks.length} Pending</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated triggers created these requests when branch quantities dropped below reorder thresholds.
            </p>
          </div>
          <button
            onClick={() => onNavigate('purchase-orders')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            Manage All Orders <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {pendingRestocks.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-500 mb-2 opacity-80" />
            No pending restock requests. All branch inventory levels are currently above reorder thresholds!
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-800/80">
            {pendingRestocks.map((req) => (
              <div key={req.requestID} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {req.product?.name || 'Product'}
                    </span>
                    <Badge variant="primary" size="sm">
                      SKU: {req.product?.sku || 'SKU'}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      at <strong className="text-indigo-300">{req.branch?.name || 'Branch'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="text-amber-400 font-medium">
                      Requested Qty: {req.request_qty} units
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 truncate max-w-md">
                      {req.trigger_reason}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApproveRequest(req.requestID)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-900/30 transition-all"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve & Generate PO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cross-Branch Stock Distribution Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Stock Breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <h3 className="text-base font-bold text-white mb-1">Branch Stock Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Stock health and active alerts by store location</p>

          <div className="space-y-3">
            {branches.map((b) => {
              const branchInv = inventory.filter(i => i.branchID === b.branchID);
              const branchUnits = branchInv.reduce((sum, i) => sum + i.quantity, 0);
              const branchLows = branchInv.filter(i => i.quantity <= i.reorder_threshold).length;
              return (
                <div key={b.branchID} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">{b.name}</h4>
                      <p className="text-xs text-slate-500">{b.address}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-white">{branchUnits} <span className="text-xs font-normal text-slate-400">units</span></div>
                      {branchLows > 0 ? (
                        <Badge variant="warning" size="sm">{branchLows} Low Stock Items</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Optimal Stock</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Database Architectural Safeguards Card */}
        <div className="rounded-2xl border border-indigo-900/50 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-3">
              <ShieldCheck className="h-5 w-5" />
              <span>Database Safeguards Active</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>Row-Level Locks:</strong> Prevents overselling during concurrent transactions with <code>SELECT ... FOR UPDATE</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <span><strong>Automated Triggers:</strong> Low stock thresholds immediately generate restock requests.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span><strong>Audit Movements:</strong> Every sale, delivery, and manual edit is logged with actor ID and delta.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <span><strong>RLS Branch Isolation:</strong> Managers and cashiers are confined to their branch data.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigate('database-defense')}
              className="w-full rounded-xl bg-indigo-600/30 border border-indigo-500/40 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-center"
            >
              Open Technical Defense Blueprint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
