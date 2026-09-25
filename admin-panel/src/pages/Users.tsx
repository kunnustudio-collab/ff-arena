import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { AdminApi } from '../services/api';
import { Users as UsersIcon, Search, Lock, Unlock, Slash, ShieldAlert, DollarSign } from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(100);
  const [adjustBalanceType, setAdjustBalanceType] = useState('DEPOSIT');
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustReason, setAdjustReason] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await AdminApi.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const reason = prompt(`Reason for setting status to ${nextStatus}:`, 'Compliance review');
    if (!reason) return;
    try {
      await AdminApi.updateUserStatus(userId, nextStatus, reason);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleFreeze = async (userId: string, isCurrentlyFrozen: boolean) => {
    const reason = prompt(`Reason for ${isCurrentlyFrozen ? 'unfreezing' : 'freezing'} wallet:`, 'Security hold');
    if (!reason) return;
    try {
      await AdminApi.toggleWalletFreeze(userId, !isCurrentlyFrozen, reason);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustReason) {
      alert('Mandatory audit reason must be supplied for financial ledger adjustments');
      return;
    }
    try {
      await AdminApi.adjustBalance(selectedUser.id, {
        amount: Number(adjustAmount),
        balanceType: adjustBalanceType,
        reason: adjustReason,
        type: adjustType,
      });
      setShowAdjustModal(false);
      alert('Balance adjusted and logged to immutable ledger.');
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.profile?.username?.toLowerCase().includes(q) ||
      u.profile?.ff_uid?.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-white">USER DIRECTORY & SECURITY</h2>
          <p className="text-xs text-gray-400">Manage player accounts, risk scoring, wallet freeze, and ledger adjustments</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by username, UID, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surfaceBorder/60 border border-surfaceBorder rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neonCyan"
          />
        </div>
      </div>

      <GlassCard className="overflow-x-auto p-0">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-surfaceBorder text-gray-400 uppercase tracking-wider bg-surfaceBorder/20">
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Free Fire Identity</th>
              <th className="py-3 px-4">KYC Status</th>
              <th className="py-3 px-4">Wallet Balance</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surfaceBorder/60">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-surfaceBorder/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{u.profile?.username || 'Player'}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{u.id.slice(0, 8)}...</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-gray-300">{u.phone}</div>
                  <div className="text-[10px] text-gray-500">{u.email}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-neonCyan font-mono">UID: {u.profile?.ff_uid || 'Not Set'}</div>
                  <div className="text-[10px] text-gray-400">IGN: {u.profile?.ff_ign || 'Not Set'}</div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={u.kycStatus === 'VERIFIED' ? 'green' : u.kycStatus === 'PENDING' ? 'gold' : 'gray'}>
                    {u.kycStatus}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-white">₹{u.wallet ? u.wallet.total : 0}</div>
                  <div className="text-[10px] text-gray-400">
                    Dep: ₹{u.wallet?.deposit || 0} | Win: ₹{u.wallet?.winnings || 0}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`font-bold ${
                      u.riskScore >= 50 ? 'text-red-400' : u.riskScore >= 20 ? 'text-yellow-400' : 'text-green-400'
                    }`}
                  >
                    {u.riskScore}/100
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={u.status === 'ACTIVE' ? 'green' : 'red'}>{u.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleToggleFreeze(u.id, u.wallet?.isFrozen)}
                      title={u.wallet?.isFrozen ? 'Unfreeze Wallet' : 'Freeze Wallet'}
                      className={`p-1.5 rounded bg-surfaceBorder hover:bg-surfaceBorder/80 ${
                        u.wallet?.isFrozen ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    >
                      {u.wallet?.isFrozen ? <Unlock size={14} /> : <Lock size={14} />}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u.id, u.status)}
                      title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Unsuspend Account'}
                      className={`p-1.5 rounded bg-surfaceBorder hover:bg-surfaceBorder/80 ${
                        u.status === 'ACTIVE' ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      <Slash size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowAdjustModal(true);
                      }}
                      title="Adjust Balance"
                      className="p-1.5 rounded bg-surfaceBorder hover:bg-surfaceBorder/80 text-neonGold"
                    >
                      <DollarSign size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Modal: Adjust Balance */}
      {showAdjustModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surfaceBorder rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold font-heading text-white">Adjust Financial Balance</h3>
            <p className="text-xs text-gray-400">
              User: <span className="text-white font-semibold">{selectedUser.profile?.username}</span> ({selectedUser.phone})
            </p>
            <form onSubmit={handleAdjustBalance} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Action Type</label>
                  <select
                    value={adjustType}
                    onChange={(e: any) => setAdjustType(e.target.value)}
                    className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="CREDIT">Credit Balance (+)</option>
                    <option value="DEBIT">Debit Balance (-)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Target Bucket</label>
                  <select
                    value={adjustBalanceType}
                    onChange={(e) => setAdjustBalanceType(e.target.value)}
                    className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="DEPOSIT">Deposit Balance</option>
                    <option value="WINNINGS">Winnings Balance</option>
                    <option value="BONUS">Bonus Balance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Mandatory Audit Reason</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Compensation for match connectivity dispute #DSP-102"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-neonCyan text-black font-bold text-sm hover:brightness-110"
                >
                  Confirm Ledger Mutation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
