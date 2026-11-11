import React, { useState, useEffect } from 'react';
import { BrowserVeilidClient } from '../services/browser_veilid';

export const NetworkStatus: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [isBrowserFallback, setIsBrowserFallback] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const resp = await fetch('http://127.0.0.1:1337/status');
        if (resp.ok) {
          setStatus(await resp.json());
          setIsBrowserFallback(false);
          return;
        }
      } catch (e) {
        // Native sidecar unreachable -> Fallback gracefully to BrowserVeilidClient
      }
      setStatus(BrowserVeilidClient.getStatus());
      setIsBrowserFallback(true);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
      <div
        className="flex items-center gap-1.5 cursor-help"
        title={isBrowserFallback ? "Running in Browser-Only WebClient Mode (Simulated P2P WebCrypto Fallback)" : "Connected to Native Go Veilid Daemon on 127.0.0.1:1337"}
      >
        <div className={`w-2 h-2 rounded-full animate-pulse ${isBrowserFallback ? 'bg-amber-500' : 'bg-green-500'}`}></div>
        <span className="font-semibold text-gray-700">
          {isBrowserFallback ? 'Browser-Only Mode' : 'Native Daemon'}
        </span>
      </div>
      <div className="flex items-center gap-1" title="Connected Peers in Veilid DHT">
        <span>{status.connected_peers ?? 0} Peers</span>
      </div>
      <div className="hidden md:block truncate max-w-[120px]" title={`Node ID: ${status.node_id}`}>
        {status.node_id}
      </div>
      <div className="hidden sm:block text-gray-400">
        {status.protocol}
      </div>
    </div>
  );
};
