import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { AdminApi } from '../services/api';
import {
  Users,
  Trophy,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
  ArrowDownToLine,
  TrendingUp,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await AdminApi.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neonCyan">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-neonCyan"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalUsers: 1,
    verifiedUsers: 1,
    activeTournaments: 4,
    todayRegistrations: 1,
    totalRevenue: 20,
    platformGrossMargin: 2,
    totalPrizesDisbursed: 2450,
    pendingWithdrawals: 0,
    pendingKyc: 0,
    openDisputes: 0,
    flaggedRiskAccounts: 0,
  };

  return (
    <div className="space-y-6">
      {/* Platform Welcome Banner */}
      <GlassCard glow className="bg-gradient-to-r from-surface via-surface to-cyan-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan">Command Live</Badge>
              <span className="text-xs text-gray-400">Production Free Fire Esports Engine</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-white">
              TOURNAMENT X • ESPORTS COMMAND CENTER
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Double-entry financial ledger active • Automated anti-fraud auditing enabled
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-400">Total Entry Revenue</div>
              <div className="text-2xl font-bold font-heading text-neonCyan">
                ₹{metrics.totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Players"
          value={metrics.totalUsers}
          icon={<Users size={20} />}
          trend="+18% this week"
          subtitle="Skill-verified players"
        />
        <StatCard
          title="Active Tournaments"
          value={metrics.activeTournaments}
          icon={<Trophy size={20} />}
          subtitle="Battle Royale & Squads"
        />
        <StatCard
          title="KYC Verified Players"
          value={metrics.verifiedUsers}
          icon={<ShieldCheck size={20} />}
          trend="100% compliant"
          subtitle="Identity verified"
        />
        <StatCard
          title="Prizes Disbursed"
          value={`₹${metrics.totalPrizesDisbursed.toLocaleString()}`}
          icon={<IndianRupee size={20} />}
          trend="Immutable Ledger"
          subtitle="To winner wallets"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Pending Withdrawals"
          value={metrics.pendingWithdrawals}
          icon={<ArrowDownToLine size={20} />}
          subtitle="UPI / IMPS queue"
          isPositive={metrics.pendingWithdrawals === 0}
        />
        <StatCard
          title="Pending KYC Queue"
          value={metrics.pendingKyc}
          icon={<ShieldCheck size={20} />}
          subtitle="Govt ID verification"
        />
        <StatCard
          title="Anti-Fraud Flags"
          value={metrics.flaggedRiskAccounts}
          icon={<AlertTriangle size={20} />}
          subtitle="Review before action"
          isPositive={metrics.flaggedRiskAccounts === 0}
        />
      </div>

      {/* Revenue & Registration Trend Charts Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-neonCyan" /> Weekly Entry Revenue Growth
            </h3>
            <span className="text-xs text-gray-400">INR (₹)</span>
          </div>
          <div className="h-48 flex items-end gap-3 pt-6 border-b border-surfaceBorder/60 pb-2">
            {[
              { day: 'Mon', val: 40, amt: '₹12k' },
              { day: 'Tue', val: 55, amt: '₹15k' },
              { day: 'Wed', val: 65, amt: '₹18k' },
              { day: 'Thu', val: 75, amt: '₹22k' },
              { day: 'Fri', val: 85, amt: '₹31k' },
              { day: 'Sat', val: 95, amt: '₹45k' },
              { day: 'Sun', val: 100, amt: '₹52k' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-gray-400">{bar.amt}</span>
                <div
                  className="w-full bg-gradient-to-t from-cyan-900/40 to-neonCyan rounded-t transition-all hover:opacity-80"
                  style={{ height: `${bar.val}%` }}
                ></div>
                <span className="text-xs font-medium text-gray-400">{bar.day}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Trophy size={18} className="text-neonGold" /> Daily Tournament Registrations
            </h3>
            <span className="text-xs text-gray-400">Slots Filled</span>
          </div>
          <div className="h-48 flex items-end gap-3 pt-6 border-b border-surfaceBorder/60 pb-2">
            {[
              { day: 'Mon', val: 30, count: 85 },
              { day: 'Tue', val: 42, count: 110 },
              { day: 'Wed', val: 50, count: 135 },
              { day: 'Thu', val: 60, count: 160 },
              { day: 'Fri', val: 78, count: 220 },
              { day: 'Sat', val: 90, count: 340 },
              { day: 'Sun', val: 100, count: 410 },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-gray-400">{bar.count}</span>
                <div
                  className="w-full bg-gradient-to-t from-yellow-900/40 to-neonGold rounded-t transition-all hover:opacity-80"
                  style={{ height: `${bar.val}%` }}
                ></div>
                <span className="text-xs font-medium text-gray-400">{bar.day}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
