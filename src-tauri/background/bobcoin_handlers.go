package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"github.com/robertpelloni/bobcoin/go-lattice"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/core"
)

func (s *AppState) handleBobcoinBalance(w http.ResponseWriter, r *http.Request) {
	account := r.URL.Query().Get("account")
	if account == "" {
		http.Error(w, "Missing account", http.StatusBadRequest)
		return
	}

	// Convert social hex key to bobcoin b58 if needed
	b58Account, err := core.HexToBase58(account)
	if err != nil {
		b58Account = account // assume already b58
	}

	balance := s.Lattice.GetBalance(b58Account, time.Now().UnixMilli())
	trust := s.Lattice.GetTrustScore(b58Account)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"balance": balance,
		"trust":   trust,
	})
}

func (s *AppState) handleBobcoinTransfer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST required", http.StatusMethodNotAllowed)
		return
	}
	var b lattice.Block
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

    // MANDATORY SECURITY CHECK: Ensure block is signed and verified
    // The bobcoin-lattice library's Verify() checks the ED25519 signature
    if !b.Verify() {
        http.Error(w, "Cryptographic verification failed for Bobcoin block", http.StatusUnauthorized)
        return
    }

	if err := s.Lattice.ProcessBlock(&b, false); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "hash": b.Hash})
}

func (s *AppState) handleBobcoinFaucet(w http.ResponseWriter, r *http.Request) {
	account := r.URL.Query().Get("account")
	if account == "" {
		http.Error(w, "Missing account", http.StatusBadRequest)
		return
	}
	// Simulated faucet for testnet
	fmt.Printf("[Faucet] Sending 1000 BOB to %s\n", account)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "simulated_success"})
}
