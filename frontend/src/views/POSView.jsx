import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Lock, 
  CreditCard, 
  Receipt, 
  Printer, 
  AlertCircle 
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const POSView = ({ currentUser, inventory = [], onProcessSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [cashTendered, setCashTendered] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cashier only sees products stocked at their branch
  const availableItems = inventory.filter(item => {
    const p = item.product || {};
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (invItem) => {
    setErrorMessage('');
    const existing = cart.find(c => c.productID === invItem.productID);
    const currentQtyInCart = existing ? existing.quantity : 0;

    // Concurrency / stock check against physical branch quantity
    if (currentQtyInCart + 1 > invItem.quantity) {
      setErrorMessage(`Cannot add more! Only ${invItem.quantity} unit(s) available on shelf.`);
      return;
    }

    if (existing) {
      setCart(cart.map(c => 
        c.productID === invItem.productID 
          ? { ...c, quantity: c.quantity + 1 } 
          : c
      ));
    } else {
      setCart([...cart, {
        productID: invItem.productID,
        sku: invItem.product?.sku,
        name: invItem.product?.name,
        unit_price: parseFloat(invItem.product?.unit_price) || 0,
        quantity: 1,
        maxStock: invItem.quantity
      }]);
    }
  };

  const updateQuantity = (productID, delta) => {
    setErrorMessage('');
    setCart(cart.map(item => {
      if (item.productID === productID) {
        const nextQty = item.quantity + delta;
        if (nextQty > item.maxStock) {
          setErrorMessage(`Insufficient shelf stock! Max available: ${item.maxStock}`);
          return item;
        }
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productID) => {
    setCart(cart.filter(item => item.productID !== productID));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const tax = subtotal * 0.12; // 12% standard VAT
  const totalDue = subtotal; // Gross already includes VAT
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - totalDue);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (tenderedNum < totalDue) {
      setErrorMessage(`Cash tendered (₱${tenderedNum}) is less than total amount (₱${totalDue.toFixed(2)})`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const salePayload = {
        branchID: currentUser.branchID,
        items: cart.map(c => ({
          productID: c.productID,
          quantity: c.quantity,
          unit_price: c.unit_price,
          productName: c.name
        }))
      };

      const result = await onProcessSale(salePayload);
      setCompletedSale({
        ...result,
        cashTendered: tenderedNum,
        changeDue,
        items: cart
      });
      setCart([]);
      setCashTendered('');
    } catch (err) {
      setErrorMessage(err.message || 'Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: POS Status & Concurrency Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-900/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              Cashier Terminal #{currentUser?.userID?.slice(-4) || '01'}
            </span>
            <span className="text-xs text-slate-400">
              Operating at: <strong className="text-white">{currentUser?.branchName || 'Main Branch'}</strong>
            </span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-white">Sales & Stock Deduction Counter</h2>
        </div>

        {/* Database Locking Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-cyan-800/40 bg-cyan-950/30 px-3.5 py-2 text-xs text-cyan-300">
          <Lock className="h-4 w-4 text-cyan-400 shrink-0" />
          <div>
            <div className="font-semibold">Row-Lock (SELECT FOR UPDATE)</div>
            <div className="text-[11px] text-cyan-400/80">Guarantees zero negative stock under race conditions</div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-800/80 bg-rose-950/40 p-4 text-xs font-medium text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* POS Grid: Left is Products, Right is Cart / Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Selector */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search bar & Category chips */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sneakers by SKU, Name, or Category..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Footwear Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['All', 'Basketball', 'Lifestyle', 'Running', 'Skateboarding', 'Casual / Canvas'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md shadow-orange-950/40'
                      : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {availableItems.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
                No sneakers found matching your filter criteria.
              </div>
            ) : (
              availableItems.map((inv) => {
                const isOutOfStock = inv.quantity <= 0;
                const isLow = inv.quantity <= inv.reorder_threshold;
                return (
                  <div
                    key={inv.inventoryID}
                    onClick={() => !isOutOfStock && addToCart(inv)}
                    className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                      isOutOfStock
                        ? 'border-slate-800/60 bg-slate-950/40 opacity-50 cursor-not-allowed'
                        : 'border-slate-800 bg-slate-900/90 hover:border-orange-500/60 hover:bg-slate-850 hover:shadow-xl hover:shadow-orange-950/20 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-orange-400/90 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-900/40">
                          {inv.product?.sku}
                        </span>
                        <Badge 
                          variant={isOutOfStock ? 'danger' : isLow ? 'warning' : 'success'} 
                          size="sm"
                        >
                          {isOutOfStock ? 'Sold Out' : `${inv.quantity} pairs in stock`}
                        </Badge>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                          {inv.product?.category || 'Footwear'}
                        </span>
                      </div>

                      <h4 className="mt-1.5 text-sm font-semibold text-white group-hover:text-orange-300 transition-colors line-clamp-2">
                        {inv.product?.name}
                      </h4>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Retail Price</span>
                        <span className="text-base font-bold text-emerald-400">
                          ₱{parseFloat(inv.product?.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <button
                        disabled={isOutOfStock}
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 p-2 text-white hover:brightness-110 disabled:opacity-50 transition-all shadow-md shadow-orange-950/40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Cart & Checkout Register */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Active Order Cart</h3>
              </div>
              <span className="text-xs text-slate-400">{cart.length} item line(s)</span>
            </div>

            {/* Cart Items List */}
            <div className="mt-3 divide-y divide-slate-800/80 max-h-[260px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <ShoppingCart className="mx-auto h-8 w-8 text-slate-600 mb-2 opacity-50" />
                  Cart is empty. Click any product from the catalog to begin sales entry.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productID} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                      <div className="text-[11px] text-emerald-400 font-mono">
                        ₱{item.unit_price.toFixed(2)} × {item.quantity} = <strong>₱{(item.unit_price * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.productID, -1)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productID, 1)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productID)}
                        className="ml-1 rounded p-1 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment & Total Register */}
          <div className="mt-4 border-t border-slate-800 pt-4 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-300">₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (Included 12%):</span>
                <span className="font-mono text-slate-300">₱{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800">
                <span>Total Amount Due:</span>
                <span className="font-mono text-emerald-400">₱{totalDue.toFixed(2)}</span>
              </div>
            </div>

            {/* Cash Tendered Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-400">Cash Received (₱)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder={`Min ₱${totalDue.toFixed(2)}`}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              {tenderedNum > 0 && (
                <div className="flex justify-between text-xs pt-1 font-semibold">
                  <span className="text-slate-400">Change Due:</span>
                  <span className={`font-mono ${changeDue >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    ₱{changeDue.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing || tenderedNum < totalDue}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isProcessing ? 'Locking Rows & Processing...' : `Complete Sale (₱${totalDue.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>

      {/* Official Receipt Modal */}
      {completedSale && (
        <Modal
          isOpen={true}
          onClose={() => setCompletedSale(null)}
          title="Transaction Receipt"
          subtitle="Sale logged and inventory auto-deducted"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 space-y-3">
              <div className="text-center border-b border-dashed border-slate-700 pb-3">
                <h4 className="font-bold text-sm text-white">StockLine Retail Chain</h4>
                <p className="text-[11px] text-slate-400">{completedSale.branchName}</p>
                <p className="text-[10px] text-slate-500">Trans ID: {completedSale.saleID}</p>
                <p className="text-[10px] text-slate-500">{new Date(completedSale.created_at).toLocaleString()}</p>
              </div>

              <div className="divide-y divide-slate-800">
                {completedSale.items.map((it, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between">
                    <div>
                      <div>{it.name}</div>
                      <div className="text-[10px] text-slate-500">{it.quantity} @ ₱{it.unit_price.toFixed(2)}</div>
                    </div>
                    <div className="font-bold">₱{(it.quantity * it.unit_price).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-700 pt-2 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>TOTAL:</span>
                  <span>₱{completedSale.total_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cash Tendered:</span>
                  <span>₱{completedSale.cashTendered?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cyan-400 font-bold">
                  <span>Change:</span>
                  <span>₱{completedSale.changeDue?.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-500 border-t border-slate-800">
                Cashier: {completedSale.cashierName} • Row Locked Successfully
              </div>
            </div>

            <button
              onClick={() => setCompletedSale(null)}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Start New Sale
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
