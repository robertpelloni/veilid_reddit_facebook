import { useState } from 'react';
import { DAOProposal } from '../components/DAO/DAOProposalList';
import { API_BASE } from '../config';

export function useDAO() {
  const [daoProposals, setDAOProposals] = useState<DAOProposal[]>([]);
  const [showProposalForm, setShowProposalForm] = useState(false);

  const fetchDAOProposals = async () => {
    try {
        const resp = await fetch(`${API_BASE}/dao/proposals`);
        if (resp.ok) setDAOProposals(await resp.json());
    } catch (e) { console.error(e); }
  };

  const handleVote = async (identityKey: string, id: string, weight: number) => {
    try {
        await fetch(`${API_BASE}/dao/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proposal_id: id,
                voter_id: identityKey,
                weight
            })
        });
        fetchDAOProposals();
    } catch (e) { console.error(e); }
  };

  return {
    daoProposals,
    showProposalForm,
    setShowProposalForm,
    fetchDAOProposals,
    handleVote
  };
}
