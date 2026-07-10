package core

import (
	"crypto/ed25519"
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

// GenerateVoteSignature creates a cryptographic signature for a vote payload.
func GenerateVoteSignature(v schema.DAOVote, privateKeyBase64 string) (string, error) {
	privKeyBytes, err := base64.StdEncoding.DecodeString(privateKeyBase64)
	if err != nil {
		return "", fmt.Errorf("invalid private key: %v", err)
	}

	if len(privKeyBytes) != ed25519.PrivateKeySize {
		return "", fmt.Errorf("invalid private key length")
	}

	privKey := ed25519.PrivateKey(privKeyBytes)

	payload := fmt.Sprintf("%s:%s:%f", v.ProposalID, v.VoterID, v.Weight)
	sig := ed25519.Sign(privKey, []byte(payload))

	return base64.StdEncoding.EncodeToString(sig), nil
}

// VerifySignature cryptographically validates the signature of a DAOVote using the voter's public key (VoterID).
func VerifySignature(payload string, signatureBase64 string, publicKeyBase64 string) bool {
	sig, err := base64.StdEncoding.DecodeString(signatureBase64)
	if err != nil {
		return false
	}

	pubKeyBytes, err := base64.StdEncoding.DecodeString(publicKeyBase64)
	if err != nil {
		return false
	}

	if len(pubKeyBytes) != ed25519.PublicKeySize {
		return false
	}

	pubKey := ed25519.PublicKey(pubKeyBytes)
	return ed25519.Verify(pubKey, []byte(payload), sig)
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
