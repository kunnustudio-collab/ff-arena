import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { AdminApi } from '../services/api';
import { ArrowDownToLine, Check, X } from 'lucide-react';

export const Withdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      const res = await AdminApi.getWithdrawals();
      setWithdrawals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'PAID' | 'REJECTED') => {
    const notes = prompt(`Admin note for ${status}:`, status === 'PAID' ? 'Processed via UPI gateway' : 'Invalid UPI VPA address');
    if (!notes) return;
    try {
      await AdminApi.processWithdrawal(id, status, notes);
      alert(`Withdrawal marked as ${status}`);
      loadWithdrawals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-heading text-white">PAYOUT & WITHDRAWAL QUEUE</h2>
        <p className="text-xs text-gray-400">Process verified player winnings payouts via UPI and IMPS bank transfer</p>
      </div>

      <GlassCard className="overflow-x-auto p-0">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-surfaceBorder text-gray-400 uppercase tracking-wider bg-surfaceBorder/20">
              <th className="py-3 px-4">Payout ID</th>
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4">Amount Requested</th>
              <th className="py-3 px-4">Fee & Net</th>
              <th className="py-3 px-4">Payout Destination</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surfaceBorder/60">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No pending withdrawal requests. All payouts settled.
                </td>
              </tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-surfaceBorder/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-neonCyan">{w.payout_id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{w.username || 'Player'}</div>
                    <div className="text-[10px] text-gray-400">{w.phone}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">₹{w.amount}</td>
                  <td className="py-3 px-4">
                    <div className="text-emerald-400 font-bold">₹{w.net_amount}</div>
                    <div className="text-[10px] text-gray-500">Fee: ₹{w.fee}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{w.payout_method}</div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {w.payout_details?.upi_id || w.payout_details?.bank_account}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={w.status === 'PAID' ? 'green' : w.status === 'UNDER_REVIEW' ? 'gold' : 'red'}>
                      {w.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {w.status === 'UNDER_REVIEW' || w.status === 'REQUESTED' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(w.payout_id, 'PAID')}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-semibold"
                        >
                          <Check size={12} /> Mark Paid
                        </button>
                        <button
                          onClick={() => handleAction(w.payout_id, 'REJECTED')}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-semibold"
                        >
                          <X size={12} /> Reject & Refund
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400">{w.admin_notes || 'Processed'}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};
