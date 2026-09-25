import React from 'react';
import { Bell, Shield, Download } from 'lucide-react';
import { AdminApi } from '../services/api';

interface NavbarProps {
  currentTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab }) => {
  return (
    <header className="h-16 border-b border-surfaceBorder bg-surface/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold font-heading text-white tracking-wide uppercase">
          {currentTab.replace('-', ' ')}
        </h2>
        <span className="text-xs px-2 py-0.5 rounded bg-neonCyan/10 border border-neonCyan/20 text-neonCyan font-semibold">
          LIVE V1.0
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* CSV Export Dropdown */}
        <div className="flex items-center gap-2">
          <a
            href={AdminApi.downloadReportUrl('users')}
            download
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surfaceBorder/80 hover:bg-surfaceBorder text-gray-300 border border-surfaceBorder"
          >
            <Download size={14} /> Export Users CSV
          </a>
          <a
            href={AdminApi.downloadReportUrl('transactions')}
            download
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surfaceBorder/80 hover:bg-surfaceBorder text-gray-300 border border-surfaceBorder"
          >
            <Download size={14} /> Export Ledger CSV
          </a>
        </div>

        {/* Admin status pill */}
        <div className="flex items-center gap-3 pl-4 border-l border-surfaceBorder">
          <div className="w-8 h-8 rounded-full bg-neonCyan/20 border border-neonCyan flex items-center justify-center text-neonCyan">
            <Shield size={16} />
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-white">Super Admin</div>
            <div className="text-[10px] text-gray-400">admin@tournamentx.com</div>
          </div>
        </div>
      </div>
    </header>
  );
};
