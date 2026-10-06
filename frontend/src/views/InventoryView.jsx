import React, { useState } from 'react';
import { 
  Search, 
  Layers, 
  AlertTriangle, 
  Edit3, 
  SlidersHorizontal, 
  Plus, 
  Minus, 
  Building2, 
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const InventoryView = ({ 
  currentUser, 
  inventory = [], 
  branches = [], 
  onAdjustStock,
  onUpdateThreshold 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal states
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState('');
  const [adjustReason, setAdjustReason] = useState('manual_adjustment');
  const [thresholdItem, setThresholdItem] = useState(null);
  const [newThreshold, setNewThreshold] = useState('');

  const isOwnerOrAdmin = currentUser?.role_name === 'owner' || currentUser?.role_name === 'admin';
  const isCashier = currentUser?.role_name === 'cashier';

  // Filter items
  const filteredInventory = inventory.filter(item => {
    const p = item.product || {};
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBranch = 
      selectedBranch === 'ALL' || item.branchID === selectedBranch;

    const matchesStatus = 
      statusFilter === 'ALL' 
        ? true 
        : statusFilter === 'LOW' 
        ? item.quantity <= item.reorder_threshold 
        : item.quantity === 0;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustingItem || !adjustDelta) return;
    const delta = parseInt(adjustDelta, 10);
    if (isNaN(delta) || delta === 0) return;

    await onAdjustStock(adjustingItem.inventoryID, delta, adjustReason);
    setAdjustingItem(null);
    setAdjustDelta('');
  };

  const handleThresholdSubmit = async (e) => {
    e.preventDefault();
    if (!thresholdItem || !newThreshold) return;
    const thresh = parseInt(newThreshold, 10);
    if (isNaN(thresh) || thresh < 0) return;

    await onUpdateThreshold(thresholdItem.inventoryID, thresh);
    setThresholdItem(null);
    setNewThreshold('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-orange-400" />
            Footwear Stock & Reorder Thresholds
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-branch sneaker inventory with automated Postgres stock trigger monitors and row-level locking.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">
            Total Records: {filteredInventory.length}
          </Badge>
          <Badge variant="warning" size="sm">
            Low Stock: {inventory.filter(i => i.quantity <= i.reorder_threshold).length}
          </Badge>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU or Product name..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Branch Filter (Only accessible by owner/admin) */}
        {isOwnerOrAdmin && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Branches (Consolidated)</option>
              {branches.map(b => (
                <option key={b.branchID} value={b.branchID}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Stock Status Filter */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="LOW">Low Stock (≤ Threshold)</option>
            <option value="OUT">Out of Stock (= 0)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">SKU / Product</th>
                <th className="px-4 py-3.5 font-semibold">Branch Location</th>
                <th className="px-4 py-3.5 font-semibold text-right">Physical Quantity</th>
                <th className="px-4 py-3.5 font-semibold text-right">Reorder Threshold</th>
                <th className="px-4 py-3.5 font-semibold text-center">Status</th>
                {!isCashier && (
                  <>
                    <th className="px-4 py-3.5 font-semibold text-right">Selling Price</th>
                    {isOwnerOrAdmin && <th className="px-4 py-3.5 font-semibold text-right">Cost Price</th>}
                    <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
                  </>
                )}
                {isCashier && (
                  <th className="px-4 py-3.5 font-semibold text-right">Retail Price</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No inventory records matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = item.quantity <= item.reorder_threshold;
                  const isOut = item.quantity === 0;
                  return (
                    <tr key={item.inventoryID} className="hover:bg-slate-850/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-white">{item.product?.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{item.product?.sku}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-indigo-400" />
                          <span>{item.branch?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-sm">
                        <span className={isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                        {item.reorder_threshold} units
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge 
                          variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}
                          size="sm"
                        >
                          {isOut ? 'Depleted' : isLow ? 'Low Stock Alert' : 'Healthy'}
                        </Badge>
                      </td>

                      {/* Financial info hidden for Cashier to enforce data protection */}
                      {!isCashier && (
                        <>
                          <td className="px-4 py-3.5 text-right font-mono text-white">
                            ₱{parseFloat(item.product?.unit_price || 0).toFixed(2)}
                          </td>
                          {isOwnerOrAdmin && (
                            <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                              ₱{parseFloat(item.product?.unit_cost || 0).toFixed(2)}
                            </td>
                          )}
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setAdjustingItem(item);
                                  setAdjustDelta('');
                                }}
                                className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                title="Adjust Stock (Auto logs audit trail)"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setThresholdItem(item);
                                  setNewThreshold(item.reorder_threshold.toString());
                                }}
                                className="rounded-lg bg-indigo-950/70 p-1.5 text-indigo-300 hover:bg-indigo-900 border border-indigo-800/40 transition-colors"
                                title="Set Trigger Reorder Threshold"
                              >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}

                      {isCashier && (
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                          ₱{parseFloat(item.product?.unit_price || 0).toFixed(2)}
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

      {/* Adjust Stock Modal */}
      {adjustingItem && (
        <Modal
          isOpen={true}
          onClose={() => setAdjustingItem(null)}
          title={`Adjust Stock: ${adjustingItem.product?.name}`}
          subtitle={`Branch: ${adjustingItem.branch?.name} • Current Quantity: ${adjustingItem.quantity}`}
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Quantity Delta (Use negative for deduction, positive for addition)
              </label>
              <input
                type="number"
                required
                value={adjustDelta}
                onChange={(e) => setAdjustDelta(e.target.value)}
                placeholder="e.g. +10 or -5"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Audit Reason</label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="manual_adjustment">Manual Adjustment (Inventory Audit)</option>
                <option value="delivery">Supplier Delivery Receipt</option>
                <option value="sale">Damaged / Expired Shelf Removal</option>
              </select>
            </div>

            <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3 text-slate-400 text-[11px]">
              <strong>Automated Trigger Notice:</strong> This adjustment will record a row in <code>stock_movements</code> with your user ID. If the new stock drops below the threshold ({adjustingItem.reorder_threshold}), a restock alert is generated.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 shadow-md"
              >
                Apply & Log Mutation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Threshold Modal */}
      {thresholdItem && (
        <Modal
          isOpen={true}
          onClose={() => setThresholdItem(null)}
          title={`Configure Trigger Threshold`}
          subtitle={`Product: ${thresholdItem.product?.name} at ${thresholdItem.branch?.name}`}
        >
          <form onSubmit={handleThresholdSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Minimum Reorder Threshold (Units)
              </label>
              <input
                type="number"
                min="0"
                required
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Whenever physical branch stock drops to or below this number, the database trigger automatically flags a restock request.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setThresholdItem(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 shadow-md"
              >
                Save Threshold
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
