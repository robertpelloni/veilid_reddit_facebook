import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

interface ProposalFormProps {
  proposerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DAOProposalForm: React.FC<ProposalFormProps> = ({ proposerId, onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:1337/dao/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `prop-${Date.now()}`,
          title,
          abstract,
          proposer_id: proposerId,
          status: 'ACTIVE_VOTING',
          votes_for: 0,
          votes_against: 0
        })
      });

      if (!response.ok) throw new Error('Failed to submit');
      onSuccess();
    } catch (err) {
      alert('Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-3xl p-8 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b pb-6">
         <h3 className="text-2xl font-bold text-slate-800">New Governance Proposal</h3>
         <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
         </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Proposal Title</label>
          <input
            required
            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all"
            placeholder="e.g. Upgrade network bandwidth"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Abstract Summary</label>
          <textarea
            required
            rows={4}
            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all resize-none"
            placeholder="Describe your proposal..."
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-6 border-t flex justify-end gap-4">
         <button
           type="button"
           onClick={onCancel}
           className="px-6 py-3 rounded-xl font-bold text-sm text-slate-400 hover:text-slate-600 transition-all"
         >
           Cancel
         </button>
         <button
           disabled={loading}
           className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
         >
           <Send size={18} />
           Publish to Veilid
         </button>
      </div>
    </form>
  );
};
