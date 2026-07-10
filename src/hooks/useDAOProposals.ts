import { useState } from 'react';
import { DAOProposal } from '../components/DAO/DAOProposalList';

export const useDAOProposals = () => {
    const [daoProposals, setDAOProposals] = useState<DAOProposal[]>([]);

    const fetchDAOProposals = async () => {
        try {
            const resp = await fetch('http://127.0.0.1:1337/dao/proposals');
            if (resp.ok) setDAOProposals(await resp.json());
        } catch (e) { console.error(e); }
    };

    return { daoProposals, fetchDAOProposals };
};
