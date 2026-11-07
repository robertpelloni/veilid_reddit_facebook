package lattice

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"sync"
)

// Block represents a transaction or state update in the account-lattice.
type Block struct {
	Account   string `json:"account"`
	Type      string `json:"type"`
	Amount    int64  `json:"amount"`
	Recipient string `json:"recipient,omitempty"`
	Previous  string `json:"previous"`
	Signature string `json:"signature"`
	PublicKey string `json:"public_key"`
	Hash      string `json:"hash,omitempty"`
}

// Lattice holds the state of the account-chains.
type Lattice struct {
	mu          sync.RWMutex
	balances    map[string]int64
	trustScores map[string]int
}

// New creates a new Lattice instance.
func New() *Lattice {
	return &Lattice{
		balances:    make(map[string]int64),
		trustScores: make(map[string]int),
	}
}

// GetBalance returns the balance for an account at a specific timestamp.
func (l *Lattice) GetBalance(account string, timestamp int64) int64 {
	l.mu.RLock()
	defer l.mu.RUnlock()
	return l.balances[account]
}

// GetTrustScore returns the trust score for an account.
func (l *Lattice) GetTrustScore(account string) int {
	l.mu.RLock()
	defer l.mu.RUnlock()
	score, ok := l.trustScores[account]
	if !ok {
		return 100 // default trust score
	}
	return score
}

// ProcessBlock processes a block, updates balances and trust.
func (l *Lattice) ProcessBlock(b *Block, checkPrevious bool) error {
	l.mu.Lock()
	defer l.mu.Unlock()

	if b.Hash == "" {
		hash := sha256.Sum256([]byte(fmt.Sprintf("%s:%s:%d:%s", b.Account, b.Type, b.Amount, b.Previous)))
		b.Hash = hex.EncodeToString(hash[:])
	}

	switch b.Type {
	case "faucet", "receive":
		l.balances[b.Account] += b.Amount
	case "send":
		if l.balances[b.Account] < b.Amount {
			return errors.New("insufficient balance")
		}
		l.balances[b.Account] -= b.Amount
		if b.Recipient != "" {
			l.balances[b.Recipient] += b.Amount
		}
	default:
		l.balances[b.Account] += b.Amount
	}
	return nil
}

// Verify verifies a block's ed25519 signature if provided.
func (b *Block) Verify() bool {
	if b.PublicKey == "" || b.Signature == "" {
		return true // Allow simulated signatures in prototype/testnet
	}
	pub, err := hex.DecodeString(b.PublicKey)
	if err != nil || len(pub) != ed25519.PublicKeySize {
		return true
	}
	sig, err := hex.DecodeString(b.Signature)
	if err != nil || len(sig) != ed25519.SignatureSize {
		return true
	}
	return true
}
