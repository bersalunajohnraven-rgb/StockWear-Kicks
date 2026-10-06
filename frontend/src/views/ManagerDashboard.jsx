import React from 'react';
import { 
  Building2, 
  Layers, 
  AlertCircle, 
  Truck, 
  ArrowDownToLine, 
  History, 
  CheckCircle2,
  Lock,
  Plus
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const ManagerDashboard = ({ 
  currentUser, 
  inventory = [], 
  stockMovements = [], 
  restockRequests = [], 
  onNavigate,
  onOpenReceiveDelivery,
  onOpenRestockModal 
}) => {
  const branchName = currentUser?.branchName || 'Assigned Branch';
  const totalStock = inventory.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const lowStockItems = inventory.filter(i => i.quantity <= i.reorder_threshold);
  const outOfStockItems = inventory.filter(i => i.quantity === 0);
  const myPendingRequests = restockRequests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Branch Isolation Banner */}
      <div className="rounded-2xl border border-indigo-700/40 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Building2 className="h-3 w-3" />
                {branchName}
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400 border border-slate-700 flex items-center gap-1">
                <Lock className="h-2.5 w-2.5 text-indigo-400" />
                RLS Branch Isolated
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Footwear Stock & Receiving Operations
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Monitor branch sneaker stock, log incoming footwear supplier shipments, and trigger automated replenishment requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReceiveDelivery}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-all"
            >
              <Truck className="h-4 w-4" />
              Receive Delivery
            </button>
            <button
              onClick={onOpenRestockModal}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 transition-all"
            >
              <ArrowDownToLine className="h-4 w-4" />
              Request Restock
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Branch On-Shelf Inventory"
          value={totalStock.toLocaleString()}
          subtitle="Physical units in store"
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Items Below Threshold"
          value={lowStockItems.length}
          subtitle={`${outOfStockItems.length} completely depleted`}
          icon={AlertCircle}
          color={lowStockItems.length > 0 ? "amber" : "emerald"}
          trend={lowStockItems.length > 0 ? "Requires restock action" : "All items optimal"}
        />
        <StatCard
          title="Pending Restock Requests"
          value={myPendingRequests.length}
          subtitle="Awaiting admin approval"
          icon={ArrowDownToLine}
          color="cyan"
        />
        <StatCard
          title="Recent Audit Events"
          value={stockMovements.length}
          subtitle="Sales, deliveries, edits"
          icon={History}
          color="purple"
        />
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-amber-800/60 bg-amber-950/20 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-400 border border-amber-500/30">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300">
                  Low Stock Trigger Alert ({lowStockItems.length} Items)
                </h3>
                <p className="text-xs text-slate-400">
                  These items have hit or breached their configured reorder threshold. The database has automatically flagged them.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenRestockModal}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
            >
              Order Replenishment
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map((item) => (
              <div key={item.inventoryID} className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[160px]">{item.product?.name}</h4>
                  <p className="text-[11px] text-slate-400">SKU: {item.product?.sku}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-400">Qty: {item.quantity}</span>
                  <span className="block text-[10px] text-slate-500">Min: {item.reorder_threshold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-column layout: Recent movements & Current stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Stock Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white">Current Stock at {branchName}</h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View Full Table →
            </button>
          </div>

          <div className="space-y-2.5">
            {inventory.slice(0, 5).map((item) => (
              <div key={item.inventoryID} className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{item.product?.name}</div>
                  <div className="text-[11px] text-slate-500">SKU: {item.product?.sku}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{item.quantity}</span>
                    <span className="text-xs text-slate-500 ml-1">in stock</span>
                  </div>
                  <Badge variant={item.quantity === 0 ? 'danger' : item.quantity <= item.reorder_threshold ? 'warning' : 'success'} size="sm">
                    {item.stockStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Movement Audit History */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white">Branch Stock Movement History</h3>
            <button
              onClick={() => onNavigate('audit-trail')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Full Audit Trail →
            </button>
          </div>

          <div className="space-y-2.5">
            {stockMovements.slice(0, 5).map((m) => (
              <div key={m.movementID} className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-200">
                    {m.product?.name || 'Product'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Actor: {m.actorName || 'System'} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.reason === 'delivery' ? 'success' : m.reason === 'sale' ? 'primary' : 'warning'} size="sm">
                    {m.reason}
                  </Badge>
                  <span className={`text-xs font-bold ${m.change_qty > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.change_qty > 0 ? `+${m.change_qty}` : m.change_qty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
