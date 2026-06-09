import React, { useState } from 'react';
import { Coins } from 'lucide-react';
import { IdentityVault } from '../services/identity';

interface TipButtonProps {
    recipientAccount: string;
    senderAccount: string;
    onSuccess?: () => void;
}

export const TipButton: React.FC<TipButtonProps> = ({ recipientAccount, senderAccount, onSuccess }) => {
    const [isTipping, setIsTipping] = useState(false);
    const [amount, setAmount] = useState(10);

    const handleTip = async () => {
        if (recipientAccount === senderAccount) {
            alert("You cannot tip yourself!");
            return;
        }

        setIsTipping(true);
        try {
            const idObj = await IdentityVault.get();
            if (!idObj) return;

            // 1. Create block data
            const blockData = {
                type: "send",
                account: senderAccount,
                link: recipientAccount,
                payload: { tip: true, amount }
            };

            // 2. Request sidecar to sign the block (requires real private key)
            const signResp = await fetch('http://127.0.0.1:1337/identity/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    private_key: idObj.private_key,
                    message: JSON.stringify(blockData)
                })
            });
            const { signature } = await signResp.json();

            // 3. Submit the signed block
            const resp = await fetch('http://127.0.0.1:1337/bobcoin/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...blockData,
                    signature: signature,
                    hash: "simulated_hash_for_prototype" // In production, this is calculated by sidecar
                })
            });

            if (resp.ok) {
                alert(`Successfully tipped ${amount} BOB!`);
                onSuccess?.();
            } else {
                alert(`Tip failed: ${await resp.text()}`);
            }
        } catch (e) {
            console.error(e);
            alert("Network error during tipping");
        } finally {
            setIsTipping(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-12 text-[10px] bg-white border border-gray-200 rounded px-1 outline-none"
            />
            <button
                onClick={handleTip}
                disabled={isTipping}
                className="flex items-center gap-1 bg-amber-50 text-amber-600 hover:bg-amber-100 px-2 py-1 rounded-md text-[10px] font-bold border border-amber-200 transition-all"
            >
                <Coins size={12} />
                {isTipping ? '...' : 'Tip BOB'}
            </button>
        </div>
    );
};
