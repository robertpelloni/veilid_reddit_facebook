package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"path/filepath"

	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/client"
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
	flag.StringVar(&dataDir, "data-dir", ".", "Directory for SQLite database and cache")
	flag.Parse()

	dbPath := filepath.Join(dataDir, "veilid_cache.db")
	fmt.Printf("Using database at: %s\n", dbPath)

	s, err := storage.NewSQLiteStorage(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize storage: %v", err)
	}
	defer s.Close()

	// In a real scenario, we'd read the Veilid RPC address from a config or env
	v := client.NewVeilidClient("http://localhost:5959")

	state := &AppState{
		Veilid:  v,
		Storage: s,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/publish", state.handlePublish)
	mux.HandleFunc("/fetch", state.handleFetch)
	mux.HandleFunc("/register", state.handleRegister)
	mux.HandleFunc("/discovery", state.handleDiscovery)
	mux.HandleFunc("/status", state.handleStatus)
	mux.HandleFunc("/message/send", state.handleSendMessage)
	mux.HandleFunc("/message/inbox", state.handleGetInbox)
	mux.HandleFunc("/dao/proposals", state.handleDAOProposals)
	mux.HandleFunc("/dao/vote", state.handleDAOVote)
	mux.HandleFunc("/comments/add", state.handleAddComment)
	mux.HandleFunc("/comments/list", state.handleListComments)

	// Add simple CORS middleware
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Restrict to Tauri development and production origins
		origin := r.Header.Get("Origin")
		if origin == "http://localhost:5173" || origin == "tauri://localhost" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			return
		}
		mux.ServeHTTP(w, r)
	})

	addr := "127.0.0.1:" + DefaultSidecarPort
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

func (s *AppState) handleStatus(w http.ResponseWriter, r *http.Request) {
	// Mocking network status
	status := map[string]interface{}{
		"connected_peers": 42,
		"node_id":         "vld_node_88888888",
		"dht_size":        123456,
		"protocol":        "Veilid v0.1.0",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
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

	if err := s.Veilid.PublishComment(c); err != nil {
		// Proceed in prototype
	}

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
	json.NewDecoder(r.Body).Decode(&v)
	if err := s.Veilid.CastDAOVoteP2P(v); err != nil {
		// Proceed with local save even if P2P fails in prototype
	}
	if err := s.Storage.CastDAOVote(&v); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "voted"})
}
