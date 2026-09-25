import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { AdminApi } from '../services/api';
import { Scale, Check, X, ExternalLink } from 'lucide-react';

export const Disputes: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      const res = await AdminApi.getDisputes();
      setDisputes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    const notes = prompt(`Resolution summary for ${status}:`, status === 'RESOLVED' ? 'Screenshot verified. Score adjusted.' : 'Insufficient evidence submitted.');
    if (!notes) return;
    try {
      await AdminApi.resolveDispute(id, status, notes);
      alert(`Dispute ${status}`);
      loadDisputes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-heading text-white">MATCH & PAYMENT DISPUTES</h2>
        <p className="text-xs text-gray-400">Investigate player appeals, screenshot proof, and adjudicate decisions</p>
      </div>

      <div className="space-y-4">
        {disputes.length === 0 ? (
          <GlassCard className="text-center py-8 text-gray-400">
            No active disputes. All matches verified and completed amicably.
          </GlassCard>
        ) : (
          disputes.map((d) => (
            <GlassCard key={d.id}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={d.status === 'OPEN' ? 'gold' : d.status === 'RESOLVED' ? 'green' : 'gray'}>
                      {d.status}
                    </Badge>
                    <span className="text-xs text-neonCyan font-mono">{d.dispute_number}</span>
                    <span className="text-xs text-gray-500">• {new Date(d.created_at).toLocaleString()}</span>
                  </div>
                  <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                    <Scale size={16} className="text-neonCyan" /> Category: {d.category}
                  </h3>
                  <p className="text-xs text-gray-300 mt-2">{d.reason}</p>

                  {d.evidence_url && (
                    <a
                      href={d.evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neonGold underline mt-2"
                    >
                      <ExternalLink size={12} /> View Uploaded Match Screenshot Evidence
                    </a>
                  )}

                  {d.resolution_notes && (
                    <div className="mt-3 p-2 bg-surfaceBorder/30 rounded text-xs text-emerald-300 border border-emerald-500/20">
                      <strong>Admin Resolution:</strong> {d.resolution_notes}
                    </div>
                  )}
                </div>

                {d.status === 'OPEN' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolve(d.id, 'RESOLVED')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold"
                    >
                      <Check size={14} /> Resolve & Award
                    </button>
                    <button
                      onClick={() => handleResolve(d.id, 'DISMISSED')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-semibold"
                    >
                      <X size={14} /> Dismiss Dispute
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
