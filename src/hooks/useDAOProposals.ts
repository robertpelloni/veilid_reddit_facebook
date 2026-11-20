import { useState } from 'react';
import { DAOProposal } from '../components/DAO/DAOProposalList';
import { API_BASE } from '../config';

export const useDAOProposals = () => {
    const [daoProposals, setDAOProposals] = useState<DAOProposal[]>([]);

    const fetchDAOProposals = async () => {
        try {
            const resp = await fetch(`${API_BASE}/dao/proposals`);
            if (resp.ok) setDAOProposals(await resp.json());
        } catch (e) { console.error(e); }
    };

    return { daoProposals, fetchDAOProposals };
};
