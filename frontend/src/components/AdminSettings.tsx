import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminSettings({ token }: { token: string }) {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWhatsappNumber(data.whatsappNumber || '');
        setWhatsappApiKey(data.whatsappApiKey || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ whatsappNumber, whatsappApiKey })
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-8">Loading settings...</div>;

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10">
      <h2 className="text-2xl font-bold text-white mb-6">WhatsApp Notifications</h2>
      <p className="text-slate-400 text-sm mb-8 max-w-2xl">
        Receive an instant WhatsApp message whenever someone makes a booking online. We use the free CallMeBot API. 
        To get your API key, send the message <strong className="text-emerald-400">I allow callmebot to send me messages</strong> to the phone number <strong className="text-emerald-400">+34 699 15 36 36</strong> on WhatsApp.
      </p>

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Your WhatsApp Number (with country code)</label>
          <input 
            type="text" 
            placeholder="+919876543210" 
            value={whatsappNumber}
            onChange={e => setWhatsappNumber(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">CallMeBot API Key</label>
          <input 
            type="text" 
            placeholder="123456" 
            value={whatsappApiKey}
            onChange={e => setWhatsappApiKey(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
          />
        </div>
        <button 
          type="submit" 
          disabled={saving}
          className="bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
