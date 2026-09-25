import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Trophy,
  Wallet,
  ArrowDownToLine,
  AlertTriangle,
  LifeBuoy,
  Scale,
  FileText,
  Sliders,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'tournaments', label: 'Tournaments', icon: <Trophy size={18} /> },
    { id: 'users', label: 'User Directory', icon: <Users size={18} /> },
    { id: 'kyc', label: 'KYC Approvals', icon: <ShieldCheck size={18} /> },
    { id: 'withdrawals', label: 'Payout Requests', icon: <ArrowDownToLine size={18} /> },
    { id: 'antifraud', label: 'Anti-Fraud Shield', icon: <AlertTriangle size={18} /> },
    { id: 'disputes', label: 'Match Disputes', icon: <Scale size={18} /> },
    { id: 'audit', label: 'Audit Trail', icon: <FileText size={18} /> },
    { id: 'settings', label: 'Platform Config', icon: <Sliders size={18} /> },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-surfaceBorder min-h-screen flex flex-col justify-between p-4 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-surfaceBorder/80">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-black text-xl shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            X
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg tracking-wider text-white">TOURNAMENT X</h1>
            <p className="text-[10px] uppercase tracking-widest text-neonCyan font-semibold">Admin Command</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-neonCyan/15 text-neonCyan border border-neonCyan/30 font-semibold shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-surfaceBorder/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout / Admin info */}
      <div className="pt-4 border-t border-surfaceBorder/80">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
