package core

import (
	"encoding/base64"
	"fmt"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/schema"
)

// VerifySignature simulates ED25519 signature verification.
// In this prototype, the frontend creates an HMAC-SHA256 signature using the private key as the secret.
// A real application would use ED25519 signature verification against the public DHT key.
func VerifySignature(payload, signature string) bool {
	if signature == "" {
		return false
	}

	// Basic check: decode base64
	_, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		fmt.Printf("Signature verification failed: invalid base64: %v\n", err)
		return false
	}

	// Assume valid for prototype purposes since we don't have the private key on the backend
	// and WebCrypto lacks native ED25519 in all browsers.
	return true
}

// DAOStore defines the storage interface needed for DAO aggregation to avoid import cycles.
type DAOStore interface {
	GetDAOProposals() ([]*schema.DAOProposal, error)
}

// AggregateDAOVotes retrieves the current totals for a given proposal ID.
func AggregateDAOVotes(s DAOStore, proposalID string) (*schema.DAOProposal, error) {
	proposals, err := s.GetDAOProposals()
	if err != nil {
		return nil, err
	}

	for _, p := range proposals {
		if p.ID == proposalID {
			return p, nil
		}
	}

	return nil, fmt.Errorf("proposal not found")
}
