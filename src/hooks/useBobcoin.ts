import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export function useBobcoin(dhtKey: string | undefined) {
    const [balance, setBalance] = useState(0);
    const [trust, setTrust] = useState(0);

    const fetchBalance = async () => {
        if (!dhtKey) return;
        try {
                const resp = await fetch(`${API_BASE}/bobcoin/balance?account=${dhtKey}`);
            if (resp.ok) {
                const data = await resp.json();
                setBalance(data.balance);
                setTrust(data.trust);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (dhtKey) {
            fetchBalance();
            const interval = setInterval(fetchBalance, 30000); // refresh every 30s
            return () => clearInterval(interval);
        }
    }, [dhtKey]);

    return { balance, trust, fetchBalance };
}
