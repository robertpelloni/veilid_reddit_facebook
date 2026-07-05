import React from 'react';
import { Users } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  dhtKey: string;
  avatarUrl?: string; // Using placeholder or generated avatars in future
}

// Mock data until real DHT friend connections are implemented
const mockTop8: Friend[] = [
  { id: '1', name: 'Satoshi', dhtKey: 'vld_key_sat1234...' },
  { id: '2', name: 'CyberPunk', dhtKey: 'vld_key_cyb9876...' },
  { id: '3', name: 'Alice', dhtKey: 'vld_key_ali5432...' },
  { id: '4', name: 'Bob', dhtKey: 'vld_key_bob7654...' },
  { id: '5', name: 'Eve', dhtKey: 'vld_key_eve0987...' },
  { id: '6', name: 'Zuko', dhtKey: 'vld_key_zuk1111...' },
  { id: '7', name: 'Aang', dhtKey: 'vld_key_aan2222...' },
  { id: '8', name: 'Katara', dhtKey: 'vld_key_kat3333...' },
];

export const Top8Friends: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-8">
      <div className="flex items-center gap-2 mb-4 text-orange-600 border-b pb-2 border-orange-100">
        <Users size={20} />
        <h2 className="text-xl font-bold font-sans tracking-tight">Top 8 Friends</h2>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {mockTop8.map((friend) => (
          <div key={friend.id} className="flex flex-col items-center justify-center p-2 group cursor-pointer transition-transform hover:scale-105">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 shadow-md flex items-center justify-center mb-2 border-2 border-white group-hover:border-orange-200 transition-colors overflow-hidden">
                <span className="text-white font-bold text-xl opacity-80">{friend.name.charAt(0)}</span>
            </div>
            <span className="text-sm font-bold text-blue-700 group-hover:underline truncate w-full text-center">{friend.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-right">
         <a href="#" className="text-xs text-blue-600 hover:underline">View All Friends</a>
      </div>
    </div>
  );
};
