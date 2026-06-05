package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/client"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/schema"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/storage"
)

type AppState struct {
	Veilid  *client.VeilidClient
	Storage *storage.SQLiteStorage
}

func main() {
	fmt.Println("Veilid Sidecar Starting...")

	dbPath := "veilid_cache.db"
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

	// Add simple CORS middleware
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			return
		}
		mux.ServeHTTP(w, r)
	})

	fmt.Println("Sidecar listening on 127.0.0.1:1337")
	if err := http.ListenAndServe("127.0.0.1:1337", handler); err != nil {
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
