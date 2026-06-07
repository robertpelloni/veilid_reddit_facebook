import { useState, useEffect } from 'react';

export function useDiscovery() {
  const [discoveredKeys, setDiscoveredKeys] = useState<any[]>([]);

  const fetchDiscovery = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:1337/discovery');
      if (resp.ok) {
        const data = await resp.json();
        setDiscoveredKeys(data || []);
      }
    } catch (e) { console.error(e); }
  };

  return { discoveredKeys, fetchDiscovery };
}
