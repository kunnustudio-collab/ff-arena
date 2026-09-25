import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { AdminApi } from '../services/api';
import { Trophy, Plus, Key, XCircle, Award } from 'lucide-react';

export const Tournaments: React.FC = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTourn, setSelectedTourn] = useState<any>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState('SOLO');
  const [map, setMap] = useState('Bermuda');
  const [entryFee, setEntryFee] = useState(20);
  const [prizePool, setPrizePool] = useState(1000);
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Disburse winners state
  const [rank1User, setRank1User] = useState('00000000-0000-0000-0000-000000000010');
  const [rank1Prize, setRank1Prize] = useState(400);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const res = await AdminApi.getTournaments();
      setTournaments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AdminApi.createTournament({
        title,
        mode,
        map,
        entryFee: Number(entryFee),
        prizePool: Number(prizePool),
        maxParticipants: Number(maxParticipants),
        scoringRules: { killPoints: 10, placementPoints: { '1': 100, '2': 80, '3': 60 } },
        prizeDistribution: { '1': prizePool * 0.4, '2': prizePool * 0.25, '3': prizePool * 0.15 },
      });
      setShowCreateModal(false);
      loadTournaments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourn) return;
    try {
      await AdminApi.updateRoomCredentials(selectedTourn.id, {
        roomId,
        roomPassword,
        status: 'ROOM_OPEN',
      });
      setShowRoomModal(false);
      alert('Room credentials published securely to eligible participants.');
      loadTournaments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourn) return;
    try {
      await AdminApi.disbursePrizes(selectedTourn.id, [
        { userId: rank1User, rank: 1, prizeAmount: Number(rank1Prize) },
      ]);
      setShowDisburseModal(false);
      alert('Results verified & prizes disbursed directly to winner wallets with immutable ledger records.');
      loadTournaments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancel = async (tournId: string) => {
    const reason = prompt('Enter cancellation reason (Full refunds will be automatically credited):', 'Technical room error');
    if (!reason) return;
    try {
      await AdminApi.cancelTournament(tournId, reason);
      alert('Tournament cancelled. 100% entry fee refunded to registered players.');
      loadTournaments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-white">TOURNAMENT MANAGEMENT</h2>
          <p className="text-xs text-gray-400">Create, monitor rooms, release credentials, and disburse prizes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neonCyan text-black font-bold text-sm hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
          <Plus size={16} /> Create Tournament
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading tournaments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <GlassCard key={t.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={t.status === 'LIVE' ? 'red' : t.status === 'OPEN' ? 'green' : 'gray'}>
                    {t.status}
                  </Badge>
                  <span className="text-xs font-semibold text-neonCyan">{t.mode} • {t.map}</span>
                </div>
                <h3 className="text-lg font-bold font-heading text-white line-clamp-1">{t.title}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.description || 'Skill-based Free Fire tournament'}</p>

                <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-surfaceBorder/40 rounded-lg text-center">
                  <div>
                    <div className="text-[10px] uppercase text-gray-400">Entry Fee</div>
                    <div className="text-sm font-bold text-white">₹{t.entry_fee}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-400">Prize Pool</div>
                    <div className="text-sm font-bold text-neonGold">₹{t.prize_pool}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-400">Slots</div>
                    <div className="text-sm font-bold text-neonCyan">{t.current_participants}/{t.max_participants}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-surfaceBorder/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTourn(t);
                      setShowRoomModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surfaceBorder hover:bg-surfaceBorder/80 text-neonCyan text-xs font-semibold"
                  >
                    <Key size={14} /> Room Credentials
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTourn(t);
                      setShowDisburseModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surfaceBorder hover:bg-surfaceBorder/80 text-neonGold text-xs font-semibold"
                  >
                    <Award size={14} /> Verify & Pay
                  </button>
                </div>
                {t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancel(t.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 text-xs font-medium"
                  >
                    <XCircle size={14} /> Cancel & Refund All Entries
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal: Create Tournament */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surfaceBorder rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold font-heading text-white">Create New Tournament</h3>
            <form onSubmit={handleCreateTournament} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Tournament Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bermuda Masters Solo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                  >
                    <option value="SOLO">Solo (1 Player)</option>
                    <option value="DUO">Duo (2 Players)</option>
                    <option value="SQUAD">Squad (4 Players)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Map</label>
                  <select
                    value={map}
                    onChange={(e) => setMap(e.target.value)}
                    className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="NexTerra">NexTerra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Entry Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Prize Pool (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={prizePool}
                    onChange={(e) => setPrizePool(Number(e.target.value))}
                    className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Max Slots</label>
                  <input
                    type="number"
                    min="2"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-neonCyan text-black font-bold text-sm hover:brightness-110"
                >
                  Publish Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Room Credentials */}
      {showRoomModal && selectedTourn && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surfaceBorder rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold font-heading text-white">Release Custom Room Credentials</h3>
            <p className="text-xs text-gray-400">
              Credentials will be viewable strictly by confirmed participants for {selectedTourn.title}
            </p>
            <form onSubmit={handleUpdateRoom} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Free Fire Custom Room ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9812491"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Room Password</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TX2026"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-neonCyan text-black font-bold text-sm hover:brightness-110"
                >
                  Publish Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Disburse Prizes */}
      {showDisburseModal && selectedTourn && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surfaceBorder rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold font-heading text-white">Verify Results & Disburse Prizes</h3>
            <p className="text-xs text-gray-400">
              Credits prize directly into the winner's wallet with an immutable double-entry ledger entry.
            </p>
            <form onSubmit={handleDisburse} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Winner User ID (Rank #1)</label>
                <input
                  type="text"
                  value={rank1User}
                  onChange={(e) => setRank1User(e.target.value)}
                  className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Prize Amount (₹)</label>
                <input
                  type="number"
                  value={rank1Prize}
                  onChange={(e) => setRank1Prize(Number(e.target.value))}
                  className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonCyan"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-neonGold text-black font-bold text-sm hover:brightness-110"
                >
                  Confirm & Credit Prize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
