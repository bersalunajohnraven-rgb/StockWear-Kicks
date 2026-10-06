import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Truck, 
  ClipboardList, 
  Building2, 
  Users, 
  History, 
  ArrowDownToLine,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role_name || 'owner';

  // Navigation items scoped by user role
  const getNavItems = () => {
    if (role === 'owner' || role === 'admin') {
      return [
        { id: 'admin-dashboard', label: 'Footwear Executive Hub', icon: LayoutDashboard },
        { id: 'inventory', label: 'Shoe Stock (Cross-Branch)', icon: Layers },
        { id: 'products', label: 'Sneaker & Shoe Catalog', icon: Package },
        { id: 'purchase-orders', label: 'Restock & Purchase Orders', icon: ClipboardList },
        { id: 'deliveries', label: 'Footwear Shipments', icon: Truck },
        { id: 'sales-history', label: 'Consolidated Sales', icon: ShoppingCart },
        { id: 'branches', label: 'Footwear Outlets', icon: Building2 },
        { id: 'staff', label: 'Staff Accounts & Roles', icon: Users },
        { id: 'audit-trail', label: 'Stock Movements (Audit)', icon: History }
      ];
    }

    if (role === 'branch_manager') {
      return [
        { id: 'manager-dashboard', label: 'Branch Store Hub', icon: LayoutDashboard },
        { id: 'inventory', label: 'Shoe Stock & Low-Alerts', icon: Layers },
        { id: 'restock-requests', label: 'Shoe Restock Requests', icon: ArrowDownToLine },
        { id: 'deliveries', label: 'Receive Footwear Deliveries', icon: Truck },
        { id: 'sales-history', label: 'Branch Sales History', icon: ShoppingCart },
        { id: 'audit-trail', label: 'Branch Movement History', icon: History }
      ];
    }

    if (role === 'cashier') {
      return [
        { id: 'pos', label: 'Sneaker POS Terminal', icon: CreditCard, highlight: true },
        { id: 'inventory', label: 'Branch Shoe Stock', icon: Layers },
        { id: 'sales-history', label: 'My Sales Receipts', icon: History }
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {role === 'owner' || role === 'admin'
              ? 'Regional Operations'
              : role === 'branch_manager'
              ? `${currentUser?.branchName || 'Branch'} Portal`
              : 'Sales Terminal'}
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                        : 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                      : item.highlight
                      ? 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Role Notice */}
      <div className="border-t border-slate-800 pt-3">
        <div className="text-[11px] text-slate-500">
          Scoped Persona:
          <span className="block font-medium text-slate-300 capitalize">
            {currentUser?.firstName} {currentUser?.lastName}
          </span>
          <span className="text-[10px] text-indigo-400">
            {role === 'owner' ? 'Global Admin Privileges' : `Isolated: ${currentUser?.branchName}`}
          </span>
        </div>
      </div>
    </aside>
  );
};
