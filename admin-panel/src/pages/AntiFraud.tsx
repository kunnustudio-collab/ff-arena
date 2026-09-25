import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { AdminApi } from '../services/api';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export const AntiFraud: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await AdminApi.getRiskEvents();
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, action: string) => {
    try {
      await AdminApi.reviewRiskEvent(id, action);
      alert(`Action '${action}' recorded in audit log.`);
      loadEvents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-heading text-white">ANTI-FRAUD & RISK SHIELD</h2>
        <p className="text-xs text-gray-400">
          Automated heuristic engine detecting multi-account collusion, geo-blocking, and suspicious devices
        </p>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <GlassCard className="text-center py-8 text-gray-400">
            No active risk flags. All player traffic and devices verified.
          </GlassCard>
        ) : (
          events.map((e) => (
            <GlassCard key={e.id} glow={e.severity === 'CRITICAL' || e.severity === 'HIGH'}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={e.severity === 'CRITICAL' || e.severity === 'HIGH' ? 'red' : 'gold'}>
                      {e.severity} RISK
                    </Badge>
                    <span className="text-xs text-gray-400 font-mono">User: {e.user_id.slice(0, 8)}...</span>
                    <span className="text-xs text-gray-500">• {new Date(e.created_at).toLocaleString()}</span>
                  </div>
                  <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-400" /> {e.event_type}
                  </h3>
                  <div className="mt-2 text-xs text-gray-300 space-y-1">
                    {e.details?.reasons?.map((r: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 text-red-300">
                        • {r}
                      </div>
                    ))}
                    {e.details?.context && (
                      <pre className="mt-2 p-2 bg-background/80 rounded border border-surfaceBorder text-[10px] text-gray-400 overflow-x-auto">
                        {JSON.stringify(e.details.context, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Risk Score</span>
                    <div className="text-xl font-bold font-heading text-red-400">{e.risk_score}/100</div>
                  </div>

                  {!e.is_reviewed ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReview(e.id, 'CLEARED')}
                        className="px-3 py-1.5 rounded bg-surfaceBorder hover:bg-surfaceBorder/80 text-xs text-emerald-400 font-semibold"
                      >
                        Clear Flag
                      </button>
                      <button
                        onClick={() => handleReview(e.id, 'FREEZE_WALLET')}
                        className="px-3 py-1.5 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 text-xs font-semibold"
                      >
                        Freeze Wallet
                      </button>
                      <button
                        onClick={() => handleReview(e.id, 'SUSPEND_USER')}
                        className="px-3 py-1.5 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-semibold"
                      >
                        Suspend User
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle size={14} /> Reviewed ({e.action_taken || 'CLEARED'})
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
