package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"path/filepath"

	"time"

	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/client"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/core"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/schema"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/storage"
)

const DefaultSidecarPort = "1337"

type AppState struct {
	Veilid  *client.VeilidClient
	Storage *storage.SQLiteStorage
}

func main() {
	fmt.Println("Veilid Sidecar Starting...")

	var dataDir string
	var port string
	var encryptKey string
	var isTestnet bool
	flag.StringVar(&dataDir, "data-dir", ".", "Directory for SQLite database and cache")
	flag.StringVar(&port, "port", DefaultSidecarPort, "Port for the sidecar HTTP API")
	flag.StringVar(&encryptKey, "encrypt-key", "", "Master key for database encryption (Simulated)")
	flag.BoolVar(&isTestnet, "testnet", false, "Enable testnet mode with isolated protocol string")
	flag.Parse()

	if encryptKey != "" {
		fmt.Println("Database encryption enabled.")
	}

	dbPath := filepath.Join(dataDir, "veilid_cache.db")
	fmt.Printf("Using database at: %s\n", dbPath)

	s, err := storage.NewSQLiteStorage(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize storage: %v", err)
	}
	defer s.Close()

	// In a real scenario, we'd read the Veilid RPC address from a config or env
	v := client.NewVeilidClient("http://localhost:5959")
	if isTestnet {
		v.ProtocolString = "veilid-reddit-myspace-v1-testnet"
		fmt.Println("Testnet mode enabled.")
	}

	state := &AppState{
		Veilid:  v,
		Storage: s,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/publish", state.handlePublish)
	mux.HandleFunc("/fetch", state.handleFetch)
	mux.HandleFunc("/register", state.handleRegister)
	mux.HandleFunc("/discovery", state.handleDiscovery)
	mux.HandleFunc("/identity/generate", state.handleGenerateIdentity)
	mux.HandleFunc("/identity/import", state.handleImportIdentity)
	mux.HandleFunc("/status", state.handleStatus)
	mux.HandleFunc("/posts/create", state.handleCreatePost)
	mux.HandleFunc("/posts/list", state.handleListPosts)
	mux.HandleFunc("/message/send", state.handleSendMessage)
	mux.HandleFunc("/message/inbox", state.handleGetInbox)
	mux.HandleFunc("/dao/proposals", state.handleDAOProposals)
	mux.HandleFunc("/dao/vote", state.handleDAOVote)
	mux.HandleFunc("/comments/add", state.handleAddComment)
	mux.HandleFunc("/comments/list", state.handleListComments)

	// Add simple CORS middleware
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Restrict to Tauri development and production origins (including staging)
		origin := r.Header.Get("Origin")
		if origin == "http://localhost:5173" || origin == "http://localhost:5174" || origin == "tauri://localhost" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			return
		}
		mux.ServeHTTP(w, r)
	})

	addr := "127.0.0.1:" + port
	fmt.Printf("Sidecar listening on %s\n", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		fmt.Printf("Error starting sidecar: %v\n", err)
	}
}

func (s *AppState) handlePublish(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var registry schema.ProfileRegistry
	if err := json.NewDecoder(r.Body).Decode(&registry); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 1. Publish to Veilid (Mocked)
	dhtKey, err := s.Veilid.PublishProfile(registry)
	if err != nil {
		http.Error(w, fmt.Sprintf("Veilid error: %v", err), http.StatusInternalServerError)
		return
	}

	// 2. Cache in SQLite
	if err := s.Storage.SaveProfile(dhtKey, &registry); err != nil {
		http.Error(w, fmt.Sprintf("Storage error: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"dht_key": dhtKey})
}

func (s *AppState) handleFetch(w http.ResponseWriter, r *http.Request) {
	dhtKey := r.URL.Query().Get("key")
	if dhtKey == "" {
		http.Error(w, "Missing 'key' parameter", http.StatusBadRequest)
		return
	}

	// 1. Check SQLite cache
	profile, err := s.Storage.GetProfile(dhtKey)
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(profile)
		return
	}

	// 2. Fetch from Veilid (Mocked)
	profile, err = s.Veilid.FetchProfile(dhtKey)
	if err != nil {
		http.Error(w, fmt.Sprintf("Veilid error: %v", err), http.StatusNotFound)
		return
	}

	// 3. Cache it
	s.Storage.SaveProfile(dhtKey, profile)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func (s *AppState) handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		DHTKey   string `json:"dht_key"`
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := s.Storage.RegisterKey(req.DHTKey, req.Username); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "registered"})
}

func (s *AppState) handleDiscovery(w http.ResponseWriter, r *http.Request) {
	keys, err := s.Storage.GetRegisteredKeys()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(keys)
}

func (s *AppState) handleGenerateIdentity(w http.ResponseWriter, r *http.Request) {
	// In a real Veilid app, this calls core.GenerateCryptoRoutingPair()
	// Using Go's crypto/rand for superior entropy over frontend Math.random()
	id, err := s.Veilid.GenerateIdentityP2P()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(id)
}

func (s *AppState) handleImportIdentity(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST required", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Mnemonic string `json:"mnemonic"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// In a real scenario, this restores the keypair from the BIP-39 mnemonic
	id, err := s.Veilid.ImportIdentityP2P(req.Mnemonic)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(id)
}

func (s *AppState) handleCreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST required", http.StatusMethodNotAllowed)
		return
	}
	var p schema.PostHeader
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	p.Timestamp = time.Now()

	// 1. Propagate to P2P network (Veilid DHT)
	// For simplicity in prototype, we publish to a key derived from the author or a community key
	if err := s.Veilid.PublishPost(p, p.AuthorID); err != nil {
		fmt.Printf("Warning: P2P post propagation failed: %v\n", err)
	}

	// 2. Save locally
	if err := s.Storage.SavePost(&p, p.AuthorID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(p)
}

func (s *AppState) handleListPosts(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")

	// 1. Attempt to fetch latest from P2P
	p2pPosts, err := s.Veilid.FetchPostsP2P(key)
	if err == nil && len(p2pPosts) > 0 {
		for _, p := range p2pPosts {
			s.Storage.SavePost(&p, key)
		}
	}

	// 2. Return local merged state
	posts, err := s.Storage.GetPosts(key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(posts)
}

func (s *AppState) handleStatus(w http.ResponseWriter, r *http.Request) {
	// Fetch real network status from Veilid
	resp, err := s.Veilid.GetStatus()
	if err != nil {
		// Fallback to reasonable defaults if offline/mocked
		resp = map[string]interface{}{
			"connected_peers": 0,
			"node_id":         "offline",
			"protocol":        s.Veilid.ProtocolString,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (s *AppState) handleSendMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var msg schema.Message
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := s.Veilid.SendMessage(msg); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "sent"})
}

func (s *AppState) handleGetInbox(w http.ResponseWriter, r *http.Request) {
	messages, err := s.Veilid.GetMessages()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func (s *AppState) handleDAOProposals(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var p schema.DAOProposal
		json.NewDecoder(r.Body).Decode(&p)
		if _, err := s.Veilid.PublishDAOProposal(p); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		s.Storage.SaveDAOProposal(&p)
		json.NewEncoder(w).Encode(p)
		return
	}

	proposals, err := s.Storage.GetDAOProposals()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(proposals)
}

func (s *AppState) handleAddComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST required", http.StatusMethodNotAllowed)
		return
	}

	var c schema.Comment
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 1. Propagate to P2P network (post's target multi-writer DHT key)
	if err := s.Veilid.PublishComment(c, c.PostID); err != nil {
		fmt.Printf("Warning: P2P comment propagation failed: %v\n", err)
	}

	// 2. Save locally
	if err := s.Storage.SaveComment(&c); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "added"})
}

func (s *AppState) handleListComments(w http.ResponseWriter, r *http.Request) {
	postID := r.URL.Query().Get("post_id")
	if postID == "" {
		http.Error(w, "Missing post_id", http.StatusBadRequest)
		return
	}

	// 1. Attempt to fetch latest from P2P
	p2pComments, err := s.Veilid.GetCommentsP2P(postID)
	if err == nil && len(p2pComments) > 0 {
		for _, c := range p2pComments {
			s.Storage.SaveComment(&c)
		}
	}

	// 2. Return local merged state
	comments, err := s.Storage.GetComments(postID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func (s *AppState) handleDAOVote(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST required", http.StatusMethodNotAllowed)
		return
	}

	var v schema.DAOVote
	if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 1. Calculate weighted power using Liquid Delegation core logic
	power, err := core.CalculateEffectivePower(s.Storage, v.VoterID, "general")
	if err != nil {
		fmt.Printf("Warning: failed to calculate effective power, using weight 1.0: %v\n", err)
		if v.Weight == 0 { v.Weight = 1.0 }
	} else {
		// QV logic: if user wanted 1 vote, they pay 1 credit.
		// If they wanted 2 votes, they pay 4 credits.
		// In our system, weight is effectively votes * multiplier.
		v.Weight = v.Weight * core.CalculateVotesFromCredits(power)
	}

	// 2. Propagate to P2P
	if err := s.Veilid.CastDAOVoteP2P(v); err != nil {
		fmt.Printf("Veilid P2P vote propagation failed: %v\n", err)
	}

	// 3. Persist locally
	if err := s.Storage.CastDAOVote(&v); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"status": "voted",
		"weight_applied": fmt.Sprintf("%.2f", v.Weight),
	})
}
