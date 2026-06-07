import React, { useState, useEffect } from 'react';

export const NetworkStatus: React.FC = () => {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const resp = await fetch('http://127.0.0.1:1337/status');
        if (resp.ok) setStatus(await resp.json());
      } catch (e) { console.error(e); }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>{status.connected_peers} Peers</span>
      </div>
      <div>{status.node_id}</div>
      <div className="hidden sm:block">{status.protocol}</div>
    </div>
  );
};
