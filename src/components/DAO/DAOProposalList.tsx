import React from 'react';
import { Vote } from 'lucide-react';

export interface DAOProposal {
  id: string;
  title: string;
  abstract: string;
  proposer_id: string;
  status: string;
  votes_for: number;
  votes_against: number;
  created_at: string;
}

interface ProposalListProps {
  proposals: DAOProposal[];
  onVote: (id: string, weight: number) => void;
}

export const DAOProposalList: React.FC<ProposalListProps> = ({ proposals, onVote }) => {
  return (
    <div className="grid gap-4">
      {proposals.map((p) => (
        <div
          key={p.id}
          className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow group"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{p.title}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700`}>
              {p.status}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{p.abstract}</p>

          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                    <Vote size={16} />
                    <span>For: <span className="font-semibold text-green-600">{p.votes_for}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Vote size={16} className="rotate-180" />
                    <span>Against: <span className="font-semibold text-red-600">{p.votes_against}</span></span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onVote(p.id, 1)}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-xs font-bold"
                >
                    +1 (QV)
                </button>
                <button
                    onClick={() => onVote(p.id, -1)}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-xs font-bold"
                >
                    -1 (QV)
                </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
