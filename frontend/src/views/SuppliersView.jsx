import React, { useState } from 'react';
import { Truck, Plus, Pencil, Trash2, Mail, Phone, Search, Building2, ExternalLink } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

const EMPTY_SUPPLIER = {
  name: '',
  contact_info: ''
};

export const SuppliersView = ({
  suppliers = [],
  purchaseOrders = [],
  currentUser,
  onSaveSupplier,
  onDeleteSupplier
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_SUPPLIER);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isOwnerOrAdmin = ['owner', 'admin'].includes(currentUser?.role_name);

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact_info && s.contact_info.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_SUPPLIER);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name || '',
      contact_info: supplier.contact_info || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await onSaveSupplier({ ...(editing || {}), ...form });
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const getPoCount = (supplierID) =>
    purchaseOrders.filter(po => po.supplierID === supplierID).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="h-6 w-6 text-orange-400" />
            Footwear Suppliers & Distributors
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official shoe brand wholesalers and logistics distributors authorized for purchase orders and inventory restocking.
          </p>
        </div>
        {isOwnerOrAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-950/40 hover:brightness-110 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by brand, distributor name, or contact details..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <Badge variant="default" size="sm">
          {filteredSuppliers.length} Authorized Supplier{filteredSuppliers.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm">
            No data yet. No footwear suppliers registered.
          </div>
        ) : (
          filteredSuppliers.map((supplier) => {
            const poCount = getPoCount(supplier.supplierID);
            return (
              <div
                key={supplier.supplierID}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-orange-950/50 border border-orange-500/20 p-2.5 text-orange-400">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-orange-300 transition-colors">
                          {supplier.name}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-500">
                          ID: {supplier.supplierID?.slice(0, 12)}…
                        </p>
                      </div>
                    </div>

                    {isOwnerOrAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(supplier)}
                          title="Edit Supplier"
                          className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) {
                              onDeleteSupplier?.(supplier.supplierID);
                            }
                          }}
                          title="Delete Supplier"
                          className="rounded-lg bg-slate-800 p-1.5 text-rose-400 hover:bg-rose-950/60 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-400">
                    <div className="flex items-start gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 break-all">
                        {supplier.contact_info || 'No contact details specified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="font-semibold text-white">{poCount}</span>
                    <span>Purchase Order{poCount !== 1 ? 's' : ''}</span>
                  </div>
                  <Badge variant={poCount > 0 ? "primary" : "default"} size="sm">
                    {poCount > 0 ? 'Active Partner' : 'Standby'}
                  </Badge>
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
        title={editing ? `Edit Supplier: ${editing.name}` : 'Register Footwear Supplier'}
        subtitle="Authorized partner for footwear wholesale restocking and fulfillment."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="rounded-xl bg-rose-950/60 border border-rose-800 p-2.5 text-xs text-rose-300">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Distributor / Supplier Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              required
              placeholder="e.g. Nike Philippines Logistics & Distribution"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Contact Details (Email, Hotline)</label>
            <input
              type="text"
              value={form.contact_info}
              onChange={(e) => setForm(f => ({ ...f, contact_info: e.target.value }))}
              placeholder="e.g. b2b-orders@brand.com | +63 2 8800 1234"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 px-4 py-2 font-semibold text-white hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Register Supplier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
