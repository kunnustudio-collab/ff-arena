import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { AdminApi } from '../services/api';
import { ShieldCheck, Check, X, FileText, User } from 'lucide-react';

export const KYCQueue: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const res = await AdminApi.getKycQueue();
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (kycId: string, status: 'VERIFIED' | 'REJECTED' | 'RETRY_REQUIRED') => {
    let reason: string | undefined = undefined;
    if (status === 'REJECTED' || status === 'RETRY_REQUIRED') {
      const input = prompt(`Enter rejection/correction reason for player:`, 'Government ID image is blurry');
      if (!input) return;
      reason = input;
    }
    try {
      await AdminApi.reviewKyc(kycId, status, reason);
      alert(`KYC marked as ${status}`);
      loadQueue();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-heading text-white">KYC VERIFICATION QUEUE</h2>
        <p className="text-xs text-gray-400">Review statutory government identity documents and payout accounts</p>
      </div>

      <GlassCard className="overflow-x-auto p-0">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-surfaceBorder text-gray-400 uppercase tracking-wider bg-surfaceBorder/20">
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4">Legal Name & DOB</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">ID Details</th>
              <th className="py-3 px-4">Payout Method</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surfaceBorder/60">
            {queue.map((k) => (
              <tr key={k.id} className="hover:bg-surfaceBorder/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{k.username || 'Player'}</div>
                  <div className="text-[10px] text-gray-400">{k.phone}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-white font-medium">{k.legal_name}</div>
                  <div className="text-[10px] text-gray-400">DOB: {k.date_of_birth}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-gray-300">{k.state}</div>
                  <div className="text-[10px] text-gray-500">{k.address}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-neonCyan font-semibold">{k.id_type}</div>
                  <div className="font-mono text-gray-300">{k.id_number_masked}</div>
                  {k.document_url && (
                    <a
                      href={k.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-neonGold underline flex items-center gap-1 mt-0.5"
                    >
                      <FileText size={10} /> View Document
                    </a>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="text-white font-mono">{k.payout_upi_id || 'UPI Not Set'}</div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={k.status === 'VERIFIED' ? 'green' : k.status === 'PENDING' ? 'gold' : 'red'}>
                    {k.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  {k.status !== 'VERIFIED' ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleReview(k.id, 'VERIFIED')}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-semibold"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => handleReview(k.id, 'REJECTED')}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-semibold"
                      >
                        <X size={12} /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-semibold">Verified on {new Date(k.verified_at).toLocaleDateString()}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};
