import React, { useState } from 'react';
import { IdentityVault, SovereignIdentity } from '../services/identity';
import { Shield, Lock, Key, Ghost } from 'lucide-react';

interface AuthProps {
  onAuthenticated: (id: SovereignIdentity) => void;
}

export const SovereignOnboarding: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleCreate = async () => {
    if (!username || !passphrase) {
        alert("Username and Pin required for encryption");
        return;
    }
    setIsGenerating(true);
    try {
        const id = await IdentityVault.generate(username, passphrase);
        setMnemonic(id.mnemonic);
    } catch (e) { alert("Generation failed"); }
    finally { setIsGenerating(false); }
  };

  const handleImport = async () => {
    if (!username || !importMnemonic || !passphrase) return;
    setIsGenerating(true);
    try {
        const id = await IdentityVault.import(username, importMnemonic, passphrase);
        onAuthenticated(id);
    } catch (e) {
        alert("Failed to restore identity. Check mnemonic/pin.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleFinish = async () => {
    const id = await IdentityVault.get(passphrase);
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
          Your sovereign keys have been generated and encrypted with your pin.
          Write down this mnemonic phrase. It is the <span className="text-slate-200 font-semibold">only way</span> to recover your identity.
        </p>
        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 font-mono text-sm mb-8 break-words select-all text-emerald-200">
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
        <p className="text-slate-400 text-center text-sm">No servers. No registration. Just your keys.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Sovereign Handle</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Satoshi"
              className="w-full p-4 pl-12 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <Ghost className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Vault Pin / Passphrase</label>
          <div className="relative">
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Secure pin for local encryption"
              className="w-full p-4 pl-12 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={isGenerating || !username || !passphrase}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          {isGenerating ? 'Forging Keys...' : 'Generate Sovereign Identity'}
        </button>

        <div className="pt-6 border-t border-slate-800 text-center">
          <button
            onClick={() => setShowImport(!showImport)}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors underline decoration-slate-700"
          >
            {showImport ? 'Back to Creation' : 'Or import existing mnemonic'}
          </button>
        </div>

        {showImport && (
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 animate-in fade-in slide-in-from-top-2">
                <textarea
                    value={importMnemonic}
                    onChange={(e) => setImportMnemonic(e.target.value)}
                    placeholder="Enter your 12 or 24 word mnemonic phrase..."
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500 min-h-[100px] mb-4"
                />
                <button
                    onClick={handleImport}
                    disabled={isGenerating || !importMnemonic || !passphrase}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm transition-all"
                >
                    Restore Identity
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
