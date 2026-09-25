import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { AdminApi } from '../services/api';
import { Sliders, Save, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    appName: 'Tournament X',
    tagline: 'Compete. Climb. Win.',
    accentColor: '#00F0FF',
    maintenanceMode: false,
    minDeposit: 50,
    maxDeposit: 10000,
    minWithdrawal: 100,
    maxWithdrawal: 25000,
    withdrawalFeePercent: 2,
    platformFeePercent: 10,
    minAge: 18,
    restrictedStates: ['andhra pradesh', 'assam', 'nagaland', 'odisha', 'sikkim', 'telangana'],
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await AdminApi.getSettings();
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AdminApi.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold font-heading text-white">PLATFORM CONFIGURATION & COMPLIANCE</h2>
        <p className="text-xs text-gray-400">Manage remote branding, financial controls, age/geo boundaries, and maintenance mode</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding */}
        <GlassCard>
          <h3 className="font-heading font-bold text-base text-white mb-4">Esports Branding & Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400">Application Name</label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Accent Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-10 h-9 bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-full bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Financial Limits */}
        <GlassCard>
          <h3 className="font-heading font-bold text-base text-white mb-4">Financial Limits & Platform Fees</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400">Min Deposit (₹)</label>
              <input
                type="number"
                value={settings.minDeposit}
                onChange={(e) => setSettings({ ...settings, minDeposit: Number(e.target.value) })}
                className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max Deposit (₹)</label>
              <input
                type="number"
                value={settings.maxDeposit}
                onChange={(e) => setSettings({ ...settings, maxDeposit: Number(e.target.value) })}
                className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Min Withdrawal (₹)</label>
              <input
                type="number"
                value={settings.minWithdrawal}
                onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
                className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max Withdrawal (₹)</label>
              <input
                type="number"
                value={settings.maxWithdrawal}
                onChange={(e) => setSettings({ ...settings, maxWithdrawal: Number(e.target.value) })}
                className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Withdrawal Fee (%)</label>
              <input
                type="number"
                value={settings.withdrawalFeePercent}
                onChange={(e) => setSettings({ ...settings, withdrawalFeePercent: Number(e.target.value) })}
                className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Platform Commission (%)</label>
              <input
                type="number"
                value={settings.platformFeePercent}
                onChange={(e) => setSettings({ ...settings, platformFeePercent: Number(e.target.value) })}
                className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
        </GlassCard>

        {/* Player Protection & Compliance */}
        <GlassCard>
          <h3 className="font-heading font-bold text-base text-white mb-4">Player Protection & Regulatory Boundaries</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-surfaceBorder/30 rounded-lg">
              <div>
                <div className="text-sm font-semibold text-white">Maintenance Mode</div>
                <div className="text-xs text-gray-400">Temporarily suspend app registrations and match entries for upgrades</div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 accent-neonCyan cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400">Geo-Restricted Indian States (Comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(settings.restrictedStates) ? settings.restrictedStates.join(', ') : settings.restrictedStates}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    restrictedStates: e.target.value.split(',').map((s) => s.trim().toLowerCase()),
                  })
                }
                className="w-full mt-1 bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Players with KYC/IP originating from these jurisdictions are automatically prohibited from joining real-money brackets.
              </span>
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neonCyan text-black font-bold text-sm hover:brightness-110 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Settings Saved Live!' : 'Apply System Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
