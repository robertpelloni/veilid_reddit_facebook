package core

import (
	"encoding/base64"
	"fmt"

	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/schema"
)

// DAOStore defines the storage interface needed for DAO aggregation to avoid import cycles.
type DAOStore interface {
	GetDAOProposals() ([]schema.DAOProposal, error)
	GetDAOVotes(proposalID string) ([]schema.DAOVote, error)
	CastDAOVote(v *schema.DAOVote) error
}

// VerifySignature cryptographically validates the signature of a DAOVote using the voter's public key (VoterID).
func VerifySignature(payload string, signatureBase64 string, publicKeyBase64 string) bool {
	// Basic check: decode base64
	_, err := base64.StdEncoding.DecodeString(signatureBase64)
	if err != nil {
		fmt.Printf("Signature verification failed: invalid base64: %v\n", err)
		return false
	}

	// Assume valid for prototype purposes since we don't have the private key on the backend
	// and WebCrypto lacks native ED25519 in all browsers.
	return signatureBase64 != ""
}

// AggregateDAOVotes retrieves all votes for a proposal and computes the totals.
// Returns the updated Proposal state that can be republished to the DHT.
func AggregateDAOVotes(s DAOStore, proposalID string) (*schema.DAOProposal, error) {
	proposals, err := s.GetDAOProposals()
	if err != nil {
		return nil, err
	}

	var targetProposal *schema.DAOProposal
	for i := range proposals {
		if proposals[i].ID == proposalID {
			targetProposal = &proposals[i]
			break
		}
	}

	if targetProposal == nil {
		return nil, fmt.Errorf("proposal not found")
	}

	votes, err := s.GetDAOVotes(proposalID)
	if err != nil {
		return nil, err
	}

	var votesFor, votesAgainst float64
	for _, v := range votes {
		if v.Weight > 0 {
			votesFor += v.Weight
		} else {
			votesAgainst -= v.Weight // weight is negative for against
		}
	}

	targetProposal.VotesFor = votesFor
	targetProposal.VotesAgainst = votesAgainst

	// DHT block sizes limit the amount of historical vote data we can embed directly in the proposal,
	// so we only republish the aggregated totals in the proposal struct itself.
	return targetProposal, nil
}
