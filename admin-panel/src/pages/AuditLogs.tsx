import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { AdminApi } from '../services/api';
import { FileText, Shield } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await AdminApi.getAuditLogs();
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-heading text-white">IMMUTABLE AUDIT TRAIL</h2>
        <p className="text-xs text-gray-400">Append-only compliance log recording every administrative mutation and ledger change</p>
      </div>

      <GlassCard className="overflow-x-auto p-0">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-surfaceBorder text-gray-400 uppercase tracking-wider bg-surfaceBorder/20">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor & Role</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Reason / Notes</th>
              <th className="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surfaceBorder/60">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-surfaceBorder/30 transition-colors">
                <td className="py-3 px-4 font-mono text-gray-400">
                  {new Date(l.created_at).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Shield size={12} className="text-neonCyan" /> {l.actor_role}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">{l.actor_id?.slice(0, 8) || 'SYSTEM'}...</div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono font-bold text-neonCyan">{l.action}</span>
                </td>
                <td className="py-3 px-4 font-mono text-gray-300">
                  {l.entity}:{l.entity_id?.slice(0, 8)}...
                </td>
                <td className="py-3 px-4 text-gray-300 max-w-xs truncate">
                  {l.reason || 'Routine operation'}
                </td>
                <td className="py-3 px-4 font-mono text-gray-500">
                  {l.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};
