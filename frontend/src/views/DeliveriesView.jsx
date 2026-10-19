import React, { useState } from 'react';
import { Truck, Plus, Package, Building2, User, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const DeliveriesView = ({ 
  currentUser, 
  deliveries = [], 
  purchaseOrders = [], 
  products = [], 
  onReceiveDelivery,
  isModalOpen,
  onOpenModal,
  onCloseModal 
}) => {
  const [selectedPO, setSelectedPO] = useState('');
  const [deliveryItems, setDeliveryItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const role = currentUser?.role_name;
  const isOwnerOrAdmin = role === 'owner' || role === 'admin';

  // Only open POs can receive deliveries
  const openPOs = purchaseOrders.filter(po => po.status === 'open');

  const handlePOChange = (poID) => {
    setSelectedPO(poID);
    const po = purchaseOrders.find(p => p.orderID === poID);
    if (po) {
      setDeliveryItems((po.items || []).map(it => ({
        productID: it.productID,
        productName: it.product?.name || 'Product',
        quantity_ordered: it.quantity_ordered,
        quantity_received: it.quantity_ordered // default to full delivery
      })));
    }
  };

  const updateQtyReceived = (productID, val) => {
    setDeliveryItems(prev => prev.map(it =>
      it.productID === productID ? { ...it, quantity_received: parseInt(val, 10) || 0 } : it
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedPO) { setError('Select a Purchase Order first.'); return; }
    if (deliveryItems.some(it => it.quantity_received <= 0)) {
      setError('All received quantities must be greater than 0.');
      return;
    }
    setSubmitting(true);
    try {
      const po = purchaseOrders.find(p => p.orderID === selectedPO);
      await onReceiveDelivery({
        orderID: selectedPO,
        branchID: po?.branchID || currentUser?.branchID,
        items: deliveryItems
      });
      setSelectedPO('');
      setDeliveryItems([]);
      onCloseModal();
    } catch (err) {
      setError(err.message || 'Failed to process delivery');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="h-6 w-6 text-emerald-400" />
            Supplier Delivery Receiving Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Recording a delivery auto-increments branch inventory via database trigger and reconciles the linked purchase order.
          </p>
        </div>
        <button
          onClick={onOpenModal}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Record Incoming Delivery
        </button>
      </div>

      {/* Deliveries Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Delivery ID</th>
                <th className="px-4 py-3.5 font-semibold">Branch Received At</th>
                <th className="px-4 py-3.5 font-semibold">Received By</th>
                <th className="px-4 py-3.5 font-semibold">Items Delivered</th>
                <th className="px-4 py-3.5 font-semibold">Linked PO</th>
                <th className="px-4 py-3.5 font-semibold">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No deliveries on record. Receive a delivery against an open Purchase Order.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del.deliveryID} className="hover:bg-slate-850/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-indigo-400 font-semibold text-[11px]">
                      {del.deliveryID}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span>{del.branch?.name || 'Branch'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{del.receiverName || 'Staff'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {(del.items || []).map((it, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <Package className="h-3 w-3 text-emerald-400 shrink-0" />
                            <span className="text-white font-medium">{it.quantity_received}×</span>
                            <span className="text-slate-300 truncate max-w-[180px]">
                              {it.product?.name || 'Product'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">
                      {del.orderID}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {del.received_at ? new Date(del.received_at).toLocaleString() : '—'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Delivery Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        title="Record Supplier Delivery Receipt"
        subtitle="Auto-increments inventory via trigger and marks PO as received"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-3 text-rose-300 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Link to Purchase Order (Open Orders Only)
            </label>
            <select
              value={selectedPO}
              onChange={(e) => handlePOChange(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">— Select a Purchase Order —</option>
              {openPOs.map(po => (
                <option key={po.orderID} value={po.orderID}>
                  {po.orderID} • {po.supplier?.name || 'Supplier'} → {po.branch?.name || 'Branch'}
                </option>
              ))}
            </select>
          </div>

          {deliveryItems.length > 0 && (
            <div className="space-y-3">
              <p className="font-semibold text-slate-300">Confirm Received Quantities:</p>
              {deliveryItems.map((it) => (
                <div key={it.productID} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{it.productName}</div>
                    <div className="text-slate-500 text-[11px]">PO Ordered: {it.quantity_ordered} units</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-slate-400">Received:</label>
                    <input
                      type="number"
                      min="0"
                      max={it.quantity_ordered}
                      value={it.quantity_received}
                      onChange={(e) => updateQtyReceived(it.productID, e.target.value)}
                      className="w-20 rounded-xl border border-slate-700 bg-slate-900 px-2 py-1.5 font-mono text-white text-center focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 text-[11px] text-slate-400">
            <strong className="text-emerald-300">Trigger Execution:</strong> Submitting this form triggers the database to add the received quantities to the branch's inventory rows and log each change in <code>stock_movements</code>.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCloseModal}
              className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !selectedPO}
              className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 shadow-md disabled:opacity-50">
              {submitting ? 'Processing...' : 'Confirm & Update Inventory'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
