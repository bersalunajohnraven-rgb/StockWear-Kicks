import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { apiClient } from './api/apiClient';

// Views
import { AdminDashboard } from './views/AdminDashboard';
import { ManagerDashboard } from './views/ManagerDashboard';
import { InventoryView } from './views/InventoryView';
import { ProductsView } from './views/ProductsView';
import { POSView } from './views/POSView';
import { PurchaseOrdersView } from './views/PurchaseOrdersView';
import { SalesHistoryView } from './views/SalesHistoryView';
import { DeliveriesView } from './views/DeliveriesView';
import { AuditTrailView } from './views/AuditTrailView';
import { BranchesView } from './views/BranchesView';
import { StaffView } from './views/StaffView';

// ─── Login Screen (Footwear & Sneaker Retail) ──────────────────────────────
const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) setError(result.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic ambient sneaker glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-600/25 to-rose-600/15 blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/20 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full bg-amber-500/10 blur-[180px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-7">
        {/* Footwear Brand Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-3xl bg-gradient-to-tr from-orange-500 via-rose-600 to-indigo-600 p-0.5 shadow-2xl shadow-orange-950/60 ring-1 ring-white/20">
            <div className="h-full w-full rounded-[22px] bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
              {/* Sneaker Silhouette Icon */}
              <svg className="h-11 w-11 text-orange-400 drop-shadow-[0_4px_12px_rgba(249,115,22,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 17.5h17c.8 0 1.5-.7 1.5-1.5v-1c0-.6-.3-1.1-.8-1.3l-3.2-1.3c-.6-.2-1-.8-1.1-1.4L16.2 6c-.3-1.2-1.4-2-2.7-2H9c-.8 0-1.5.5-1.8 1.2L5.8 8.8c-.4.8-1.2 1.4-2.1 1.6l-1.2.3c-.6.2-1 .7-1 1.3v4c0 .8.7 1.5 1.5 1.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 17.5v1.5c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 8.5h4M9.5 11.5h3.5" />
              </svg>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-950/40 px-3 py-1 text-[11px] font-semibold text-orange-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
            Footwear & Sneaker Retail ERP
          </div>
          
          <h1 className="text-3xl font-black tracking-tight text-white">
            StockWear <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">KICKS</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Multi-Branch Footwear Inventory, POS & Automated Restock System
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/85 backdrop-blur-2xl shadow-2xl p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Employee Login</h2>
            <p className="mt-0.5 text-xs text-slate-400">Sign in with your branch staff credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Staff Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@stockwearkicks.com"
                required
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            
            {error && (
              <div className="rounded-xl border border-rose-900 bg-rose-950/50 p-3.5 text-xs text-rose-300 flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-rose-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <span>Access Portal</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Footwear Retail Platform • Multi-Branch Operations • Real-time POS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Loading Spinner ──────────────────────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div className="h-10 w-10 rounded-full border-4 border-indigo-600/30 border-t-indigo-500 animate-spin" />
    <span className="text-xs text-slate-400 animate-pulse">Loading inventory data…</span>
  </div>
);

// ─── Main Application Shell ───────────────────────────────────────────────────
const AppShell = () => {
  const { currentUser } = useAuth();
  const role = currentUser?.role_name || 'owner';

  // Default active tab per role
  const defaultTab = role === 'cashier'
    ? 'pos'
    : role === 'branch_manager'
    ? 'manager-dashboard'
    : 'admin-dashboard';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  // ── Global state ──────────────────────────────────────────────────────────
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);

  // Modal state lifted up (some views need controlled modal)
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [poModalOpen, setPoModalOpen] = useState(false);

  // ── Load all data on mount / user switch ─────────────────────────────────
  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [br, pr, us, sup, inv, sl, po, del, mv] = await Promise.all([
        apiClient.getBranches(),
        apiClient.getProducts(),
        apiClient.getUsers(),
        apiClient.getSuppliers(),
        apiClient.getInventory(currentUser),
        apiClient.getSales(currentUser),
        apiClient.getPurchaseOrders(currentUser),
        apiClient.getDeliveries(currentUser),
        apiClient.getStockMovements(currentUser),
      ]);
      setBranches(br || []);
      setProducts(pr || []);
      setUsers(us || []);
      setSuppliers(sup || []);
      setInventory(inv || []);
      setSales(sl || []);
      setPurchaseOrders(po || []);
      setDeliveries(del || []);
      setStockMovements(mv || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    setActiveTab(defaultTab);
    loadData();
  }, [currentUser?.userID]);

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleSale = async (saleData) => {
    const result = await apiClient.processSale(saleData, currentUser);
    await loadData();
    return result;
  };

  const handleCreatePO = async (poData) => {
    const result = await apiClient.createPurchaseOrder(poData, currentUser);
    await loadData();
    setPoModalOpen(false);
    return result;
  };

  const handleApprovePO = async (orderID) => {
    const result = await apiClient.approvePurchaseOrder(orderID, currentUser);
    await loadData();
    return result;
  };

  const handleReceiveDelivery = async (delivData) => {
    const result = await apiClient.receiveDelivery(delivData, currentUser);
    await loadData();
    return result;
  };

  const handleSaveProduct = async (productData) => {
    if (productData.productID) {
      const { productID, ...rest } = productData;
      await apiClient.updateProduct(productID, rest);
    } else {
      await apiClient.createProduct(productData);
    }
    await loadData();
  };

  const handleSaveUser = async (userData) => {
    if (userData.userID) {
      await apiClient.updateUser(userData);
    } else {
      await apiClient.createUser(userData);
    }
    await loadData();
  };

  const handleSaveBranch = async (branchData) => {
    if (branchData.branchID) {
      await apiClient.updateBranch(branchData);
    } else {
      await apiClient.createBranch(branchData);
    }
    await loadData();
  };

  const handleManualAdj = async (adjData) => {
    await apiClient.manualAdjustment(adjData, currentUser);
    await loadData();
  };

  // ── View renderer ─────────────────────────────────────────────────────────
  const renderView = () => {
    if (loadingData) return <LoadingSpinner />;

    switch (activeTab) {
      case 'admin-dashboard':
        return (
          <AdminDashboard
            currentUser={currentUser}
            branches={branches}
            inventory={inventory}
            products={products}
            sales={sales}
            purchaseOrders={purchaseOrders}
            stockMovements={stockMovements}
            setActiveTab={setActiveTab}
          />
        );
      case 'manager-dashboard':
        return (
          <ManagerDashboard
            currentUser={currentUser}
            inventory={inventory.filter(i => i.branchID === currentUser?.branchID)}
            products={products}
            sales={sales.filter(s => s.branchID === currentUser?.branchID)}
            purchaseOrders={purchaseOrders.filter(po => po.branchID === currentUser?.branchID)}
            stockMovements={stockMovements.filter(m => m.branchID === currentUser?.branchID)}
            setActiveTab={setActiveTab}
          />
        );
      case 'pos':
        return (
          <POSView
            currentUser={currentUser}
            inventory={inventory.filter(i =>
              !currentUser?.branchID || i.branchID === currentUser.branchID
            )}
            products={products}
            onProcessSale={handleSale}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            currentUser={currentUser}
            inventory={inventory}
            products={products}
            branches={branches}
            onManualAdjustment={handleManualAdj}
          />
        );
      case 'products':
        return (
          <ProductsView
            currentUser={currentUser}
            products={products}
            onSaveProduct={handleSaveProduct}
          />
        );
      case 'purchase-orders':
      case 'restock-requests':
        return (
          <PurchaseOrdersView
            currentUser={currentUser}
            purchaseOrders={purchaseOrders}
            products={products}
            branches={branches}
            suppliers={suppliers}
            inventory={inventory}
            onCreatePO={handleCreatePO}
            onApprovePO={handleApprovePO}
            isModalOpen={poModalOpen}
            onOpenModal={() => setPoModalOpen(true)}
            onCloseModal={() => setPoModalOpen(false)}
          />
        );
      case 'deliveries':
        return (
          <DeliveriesView
            currentUser={currentUser}
            deliveries={deliveries}
            purchaseOrders={purchaseOrders}
            products={products}
            onReceiveDelivery={handleReceiveDelivery}
            isModalOpen={deliveryModalOpen}
            onOpenModal={() => setDeliveryModalOpen(true)}
            onCloseModal={() => setDeliveryModalOpen(false)}
          />
        );
      case 'sales-history':
        return (
          <SalesHistoryView
            currentUser={currentUser}
            sales={sales}
          />
        );
      case 'branches':
        return (
          <BranchesView
            branches={branches}
            users={users}
            currentUser={currentUser}
            onSaveBranch={handleSaveBranch}
          />
        );
      case 'staff':
        return (
          <StaffView
            users={users}
            branches={branches}
            currentUser={currentUser}
            onSaveUser={handleSaveUser}
          />
        );
      case 'audit-trail':
        return (
          <AuditTrailView
            currentUser={currentUser}
            stockMovements={stockMovements}
            branches={branches}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Select a section from the sidebar to begin.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-200 flex flex-col">
      <Navbar
        onResetData={() => {
          apiClient.resetState();
          loadData();
        }}
      />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  const { currentUser } = useAuth();

  // Authentication required — users must log in with valid credentials.
  // currentUser starts as null until successful authentication.
  if (!currentUser) {
    return <LoginScreen />;
  }

  return <AppShell />;
}

export default App;
