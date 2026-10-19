import React, { useState } from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Truck, 
  Building2, 
  Plus, 
  FileText, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const PurchaseOrdersView = ({ 
  currentUser, 
  purchaseOrders = [], 
  restockRequests = [], 
  suppliers = [], 
  products = [], 
  branches = [], 
  onApproveRequest 
}) => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'orders'
  const [approvingReq, setApprovingReq] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  const isOwnerOrAdmin = currentUser?.role_name === 'owner' || currentUser?.role_name === 'admin';

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approvingReq) return;
    await onApproveRequest(approvingReq.requestID, selectedSupplier);
    setApprovingReq(null);
    setSelectedSupplier('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-indigo-400" />
            Restock Requests & Purchase Orders
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Stored procedure automation: Transform low-stock alerts into authorized supplier purchase orders.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-1">
          <button
            onClick={() => setActiveTab('requests')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Restock Requests ({restockRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Supplier Purchase Orders ({purchaseOrders.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Restock Requests Queue */}
      {activeTab === 'requests' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="border-b border-slate-800 bg-slate-950/40 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Branch Replenishment Queue</h3>
              <p className="text-xs text-slate-400">Triggered by inventory dipping below reorder thresholds or manager requests.</p>
            </div>
            <Badge variant="purple" size="sm">Stored Procedure: fulfill_restock()</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Request ID / Product</th>
                  <th className="px-4 py-3.5 font-semibold">Target Branch</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Requested Quantity</th>
                  <th className="px-4 py-3.5 font-semibold">Trigger / Audit Reason</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Admin Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {restockRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      No restock requests generated yet.
                    </td>
                  </tr>
                ) : (
                  restockRequests.map((req) => (
                    <tr key={req.requestID} className="hover:bg-slate-850/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-white">{req.product?.name || 'Product'}</div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {req.requestID} • SKU: {req.product?.sku}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Building2 className="h-3 w-3 text-indigo-400" />
                          <span>{req.branch?.name || 'Branch'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-indigo-300">
                        {req.request_qty} units
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate">
                        {req.trigger_reason}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge 
                          variant={req.status === 'approved' ? 'success' : req.status === 'fulfilled' ? 'purple' : 'warning'}
                          size="sm"
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {req.status === 'pending' ? (
                          isOwnerOrAdmin ? (
                            <button
                              onClick={() => {
                                setApprovingReq(req);
                                setSelectedSupplier(suppliers[0]?.supplierID || '');
                              }}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-900/30 transition-all text-xs"
                            >
                              Approve → Create PO
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">Pending Admin Review</span>
                          )
                        ) : (
                          <span className="text-emerald-400 flex items-center justify-center gap-1 text-[11px] font-medium">
                            <CheckCircle className="h-3 w-3" /> Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Supplier Purchase Orders */}
      {activeTab === 'orders' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="border-b border-slate-800 bg-slate-950/40 p-4">
            <h3 className="text-sm font-bold text-white">Authorized Supplier Purchase Orders</h3>
            <p className="text-xs text-slate-400">Formal purchase orders linked to external suppliers for branch fulfillment.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">PO #</th>
                  <th className="px-4 py-3.5 font-semibold">Supplier Name</th>
                  <th className="px-4 py-3.5 font-semibold">Branch Destination</th>
                  <th className="px-4 py-3.5 font-semibold">Ordered Line Items</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Total Est. Cost</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Fulfillment Status</th>
                  <th className="px-4 py-3.5 font-semibold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      No purchase orders registered.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => {
                    const totalCost = (po.items || []).reduce(
                      (sum, item) => sum + (item.quantity_ordered * parseFloat(item.unit_cost || 0)), 
                      0
                    );
                    return (
                      <tr key={po.orderID} className="hover:bg-slate-850/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-semibold text-indigo-400">
                          {po.orderID}
                        </td>
                        <td className="px-4 py-3.5 text-white font-medium">
                          {po.supplier?.name || 'Apex Wholesale Ltd.'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">
                          {po.branch?.name || 'Branch'}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            {(po.items || []).map((it, idx) => (
                              <div key={idx} className="text-slate-300">
                                <strong>{it.quantity_ordered}x</strong> {it.product?.name || 'Product'}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-white">
                          ₱{totalCost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Badge 
                            variant={po.status === 'received' ? 'success' : po.status === 'open' ? 'info' : 'warning'}
                            size="sm"
                          >
                            {po.status === 'received' ? 'Delivered & Received' : po.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                          {new Date(po.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve Restock Modal */}
      {approvingReq && (
        <Modal
          isOpen={true}
          onClose={() => setApprovingReq(null)}
          title="Approve Restock & Generate Purchase Order"
          subtitle="Atomic Stored Procedure will convert this request into a vendor PO"
        >
          <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
            <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/30 p-3.5 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Product:</span>
                <span className="font-semibold text-white">{approvingReq.product?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Store:</span>
                <span className="font-semibold text-white">{approvingReq.branch?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requested Volume:</span>
                <span className="font-bold text-indigo-300 font-mono">{approvingReq.request_qty} units</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Select Supplier Vendor</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                {suppliers.map(s => (
                  <option key={s.supplierID} value={s.supplierID}>
                    {s.name} ({s.contact_info})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApprovingReq(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-900/30"
              >
                Execute Procedure & Issue PO
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
