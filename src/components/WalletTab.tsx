import React, { useState } from 'react';
import { Wallet, RefreshCw, Send, ShieldCheck, History, ArrowRightLeft } from 'lucide-react';
import { IdentityVault } from '../services/identity';

interface WalletTabProps {
    account: string;
    balance: number;
    trust: number;
    onRefresh: () => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({ account, balance, trust, onRefresh }) => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState(0);
    const [isSending, setIsSending] = useState(false);

    const handleTransfer = async () => {
        if (!recipient || amount <= 0) return;
        setIsSending(true);
        try {
            const idObj = await IdentityVault.get();
            if (!idObj) return;

            const blockData = {
                type: "send",
                account: account,
                link: recipient,
                payload: { amount }
            };

            const signResp = await fetch('http://127.0.0.1:1337/identity/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    private_key: idObj.private_key,
                    message: JSON.stringify(blockData)
                })
            });
            const { signature } = await signResp.json();

            const resp = await fetch('http://127.0.0.1:1337/bobcoin/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...blockData,
                    signature,
                    hash: "simulated_hash_v2"
                })
            });
            if (resp.ok) {
                alert("Transfer successful");
                setRecipient('');
                setAmount(0);
                onRefresh();
            } else {
                alert("Transfer failed: " + await resp.text());
            }
        } catch (e) { console.error(e); }
        finally { setIsSending(false); }
    };

    const handleFaucet = async () => {
        try {
            await fetch(`http://127.0.0.1:1337/bobcoin/faucet?account=${account}`);
            onRefresh();
            alert("Requested 1000 BOB from Faucet (Simulated)");
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
                    <div className="flex justify-between items-start mb-10">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <Wallet size={32} />
                        </div>
                        <button onClick={onRefresh} className="hover:rotate-180 transition-transform duration-500">
                            <RefreshCw size={20} />
                        </button>
                    </div>
                    <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-1">Available Balance</p>
                    <h3 className="text-5xl font-black mb-6 tracking-tighter">{balance.toFixed(2)} <span className="text-2xl font-normal opacity-80">BOB</span></h3>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10 font-mono text-xs truncate">
                        {account}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800">Trust Score</h4>
                            <p className="text-sm text-gray-500">Determines your DAO weight</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-5xl font-black text-gray-900">{trust.toFixed(0)}</span>
                        <span className="text-xl text-gray-400 font-bold mb-1">/ 100</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${trust}%` }} />
                    </div>
                </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <Send size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Transfer Currency</h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Recipient Account (DHT Key or Address)</label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="vld_key_..."
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Amount</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="0.00"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-300">BOB</span>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleTransfer}
                            disabled={isSending || !recipient || amount <= 0}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                            <ArrowRightLeft size={20} />
                            Send Payment
                        </button>
                        <button
                            onClick={handleFaucet}
                            className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all border border-gray-200"
                        >
                            Faucet
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <History size={24} className="text-blue-400" />
                    <h3 className="text-2xl font-black tracking-tight">Lattice Activity</h3>
                </div>
                <div className="border-t border-white/5 pt-6">
                    <p className="text-gray-400 text-sm italic">Transaction history integration pending synchronization with local Bobcoin node...</p>
                </div>
            </section>
        </div>
    );
};
