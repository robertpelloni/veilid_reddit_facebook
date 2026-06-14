import { useState } from 'react';
import { API_BASE } from '../config';

export function useDiscovery() {
  const [discoveredKeys, setDiscoveredKeys] = useState<any[]>([]);

  const fetchDiscovery = async () => {
    try {
      const resp = await fetch(`${API_BASE}/discovery`);
      if (resp.ok) {
        const data = await resp.json();
        setDiscoveredKeys(data || []);
      }
    } catch (e) { console.error(e); }
  };

  return { discoveredKeys, fetchDiscovery };
}
