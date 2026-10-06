import React from 'react';
import { 
  Boxes, 
  UserCheck, 
  RefreshCw, 
  Building2, 
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';

export const Navbar = ({ onResetData }) => {
  const { currentUser, logout, backendOnline } = useAuth();

  const roleLabels = {
    owner: { title: 'Store Owner / Regional Admin', badge: 'Admin Role', color: 'purple' },
    admin: { title: 'Regional Administrator', badge: 'Admin Role', color: 'purple' },
    branch_manager: { title: 'Branch Manager (Inventory)', badge: 'Manager Role', color: 'primary' },
    cashier: { title: 'Cashier / Sales Staff', badge: 'Cashier Role', color: 'success' }
  };

  const currentRoleInfo = roleLabels[currentUser?.role_name] || roleLabels.owner;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/75">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & System Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-indigo-600 text-white shadow-lg shadow-orange-500/25">
            {/* Sneaker Icon */}
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 17.5h17c.8 0 1.5-.7 1.5-1.5v-1c0-.6-.3-1.1-.8-1.3l-3.2-1.3c-.6-.2-1-.8-1.1-1.4L16.2 6c-.3-1.2-1.4-2-2.7-2H9c-.8 0-1.5.5-1.8 1.2L5.8 8.8c-.4.8-1.2 1.4-2.1 1.6l-1.2.3c-.6.2-1 .7-1 1.3v4c0 .8.7 1.5 1.5 1.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 17.5v1.5c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-1.5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Stock<span className="text-indigo-400">Wear</span> <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent text-lg font-black">KICKS</span>
              </span>
              <span className="hidden sm:inline-block rounded bg-orange-950/80 px-2 py-0.5 text-[10px] font-semibold text-orange-400 border border-orange-800/60 uppercase">
                Footwear Retail
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400">
              Multi-Branch Footwear & Sneaker Retail Inventory Management System
            </p>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          {/* User info */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs font-semibold text-white">
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400">
                <Building2 className="h-3 w-3 text-slate-500" />
                <span className="truncate max-w-[120px]">
                  {currentUser?.branchID ? currentUser?.branchName : 'Consolidated (All)'}
                </span>
              </div>
            </div>

            <Badge variant={currentRoleInfo.color} size="sm">
              {currentRoleInfo.badge}
            </Badge>

            {onResetData && (
              <button
                onClick={onResetData}
                title="Reset Database to Seed State"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-rose-600/20 hover:border-rose-800 border border-slate-800 rounded-xl transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
