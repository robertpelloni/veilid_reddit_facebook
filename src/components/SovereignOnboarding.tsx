import React, { useState } from 'react';
import { IdentityVault, SovereignIdentity } from '../services/identity';
import { Shield, Lock, Key, Ghost } from 'lucide-react';

interface AuthProps {
  onAuthenticated: (id: SovereignIdentity) => void;
}

export const SovereignOnboarding: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!username) return;
    setIsGenerating(true);
    const id = await IdentityVault.generate(username);
    setMnemonic(id.mnemonic);
    setIsGenerating(false);
  };

  const handleFinish = () => {
    const id = IdentityVault.get();
    if (id) onAuthenticated(id);
  };

  if (mnemonic) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100">
        <div className="flex items-center gap-3 mb-6 text-emerald-400">
          <Shield size={32} />
          <h1 className="text-2xl font-bold tracking-tight">Identity Secured</h1>
        </div>
        <p className="text-slate-400 mb-6 leading-relaxed">
          Your sovereign keys have been generated. Write down this mnemonic phrase.
          It is the <span className="text-slate-200 font-semibold">only way</span> to recover your identity.
        </p>
        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 font-mono text-sm mb-8 break-words select-all">
          {mnemonic}
        </div>
        <button
          onClick={handleFinish}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Lock size={20} /> Enter the Stealth Network
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
          <Ghost size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Initialize Sovereign Space</h1>
        <p className="text-slate-400 text-center">No servers. No registration. Just your keys.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Handle / Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Satoshi"
              className="w-full p-4 pl-12 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={isGenerating || !username}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          {isGenerating ? 'Forging Keys...' : 'Generate Sovereign Identity'}
        </button>

        <div className="pt-6 border-t border-slate-800 text-center">
          <button className="text-slate-500 hover:text-slate-300 text-sm transition-colors underline decoration-slate-700">
            Or import existing mnemonic
          </button>
        </div>
      </div>
    </div>
  );
};
