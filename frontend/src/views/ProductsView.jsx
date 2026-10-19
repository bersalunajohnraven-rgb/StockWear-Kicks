import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Percent, 
  Barcode 
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const ProductsView = ({ products = [], onCreateProduct, onUpdateProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Lifestyle');
  const [unitCost, setUnitCost] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setSku('');
    setName('');
    setCategory('Lifestyle');
    setUnitCost('');
    setUnitPrice('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!sku || !name || !unitCost || !unitPrice) return;
    await onCreateProduct({
      sku,
      name,
      category,
      unit_cost: parseFloat(unitCost),
      unit_price: parseFloat(unitPrice)
    });
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    await onUpdateProduct(editingProduct.productID, {
      name,
      category,
      unit_cost: parseFloat(unitCost),
      unit_price: parseFloat(unitPrice)
    });
    setEditingProduct(null);
    resetForm();
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setSku(product.sku);
    setName(product.name);
    setCategory(product.category || 'General');
    setUnitCost(product.unit_cost.toString());
    setUnitPrice(product.unit_price.toString());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-400" />
            Central Product Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Master SKU catalog with normalized price metrics and synchronized branch stock allocations.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Product Name, SKU code, or Category..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <Badge variant="primary" size="md">
          {filteredProducts.length} Catalog Items
        </Badge>
      </div>

      {/* Catalog Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">SKU</th>
                <th className="px-4 py-3.5 font-semibold">Product Description</th>
                <th className="px-4 py-3.5 font-semibold">Category</th>
                <th className="px-4 py-3.5 font-semibold text-right">Supplier Unit Cost</th>
                <th className="px-4 py-3.5 font-semibold text-right">Retail Selling Price</th>
                <th className="px-4 py-3.5 font-semibold text-right">Gross Margin</th>
                <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cost = parseFloat(p.unit_cost) || 0;
                  const price = parseFloat(p.unit_price) || 0;
                  const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : 0;
                  return (
                    <tr key={p.productID} className="hover:bg-slate-850/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-indigo-400 font-semibold">
                        {p.sku}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-500">ID: {p.productID.slice(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="default" size="sm">{p.category || 'General'}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                        ₱{cost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                        ₱{price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-cyan-400 font-semibold">
                        {margin}%
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${p.name}? This will remove related branch inventory rows.`)) {
                                onDeleteProduct(p.productID);
                              }
                            }}
                            className="rounded-lg bg-rose-950/60 p-1.5 text-rose-400 hover:bg-rose-900 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Catalog Product"
          subtitle="Automatically creates inventory rows for all active branches"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">SKU (Unique Barcode)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SKU-007"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Basketball">Basketball</option>
                  <option value="Running">Running</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Casual / Canvas">Casual / Canvas</option>
                  <option value="Skateboarding">Skateboarding</option>
                  <option value="Training & Gym">Training & Gym</option>
                  <option value="Slip-Ons & Slides">Slip-Ons & Slides</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Footwear Model & Size Specifications</label>
              <input
                type="text"
                required
                placeholder="e.g. Nike Dunk Low Retro 'Panda' (US 9.5)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Supplier Cost (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="120.00"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Retail Selling Price (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="190.00"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 shadow-md"
              >
                Save Product
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title={`Edit Product: ${editingProduct.sku}`}
          subtitle="Updates master catalog pricing"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Supplier Cost (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Retail Selling Price (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 shadow-md"
              >
                Update Details
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
