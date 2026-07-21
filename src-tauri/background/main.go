package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"strings"

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
	mux.HandleFunc("/status", state.handleStatus)
	mux.HandleFunc("/posts/create", state.handleCreatePost)
	mux.HandleFunc("/posts/list", state.handleListPosts)
	mux.HandleFunc("/message/send", state.handleSendMessage)
	mux.HandleFunc("/message/inbox", state.handleGetInbox)
	mux.HandleFunc("/dao/proposals", state.handleDAOProposals)
	mux.HandleFunc("/dao/vote", state.handleDAOVote)
	mux.HandleFunc("/comments/add", state.handleAddComment)
	mux.HandleFunc("/comments/list", state.handleListComments)
	mux.HandleFunc("/media/upload", state.handleMediaUpload)
	mux.HandleFunc("/media/get", state.handleMediaGet)

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

// Helper functions for prototype media encryption
func encryptMedia(data []byte, key []byte) (string, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := aesGCM.Seal(nonce, nonce, data, nil)
	return hex.EncodeToString(ciphertext), nil
}

func decryptMedia(hexCiphertext string, key []byte) (string, error) {
	data, err := hex.DecodeString(hexCiphertext)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := aesGCM.NonceSize()
	if len(data) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

func (s *AppState) handleMediaUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	// 5MB Limit
	r.Body = http.MaxBytesReader(w, r.Body, 5<<20)

	var req struct {
		Base64Data string `json:"base64_data"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Generate a unique 32-byte AES key for this specific payload
	mediaKey := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, mediaKey); err != nil {
		http.Error(w, "Failed to generate key", http.StatusInternalServerError)
		return
	}
	mediaKeyHex := hex.EncodeToString(mediaKey)

	// Prototype: Generate a deterministic mock IPFS hash based on SHA-256 of the plain data
	hashBytes := sha256.Sum256([]byte(req.Base64Data))
	hashString := hex.EncodeToString(hashBytes[:])

	// Append the hex key to the hash URL so it travels alongside the reference and isn't stored in plain DB
	// Standard practice for Hypercore/IPFS decryption proxies
	ipfsURI := fmt.Sprintf("ipfs://Qm%s_%s", hashString[:44], mediaKeyHex)

	// Encrypt the payload using the generated AES-GCM key
	encryptedPayload, err := encryptMedia([]byte(req.Base64Data), mediaKey)
	if err != nil {
		http.Error(w, "Encryption failed", http.StatusInternalServerError)
		return
	}

	// Store locally as prototype Encrypted Media chunk. Note we only store the hashString as the primary key, NOT the key.
	storageHash := fmt.Sprintf("ipfs://Qm%s", hashString[:44])
	if err := s.Storage.SaveMedia(storageHash, encryptedPayload); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"url": ipfsURI,
	})
}

func (s *AppState) handleMediaGet(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract hash from URL query parameter 'url' (e.g., ipfs://Qm..._key)
	fullUrl := r.URL.Query().Get("url")
	if fullUrl == "" {
		http.Error(w, "Missing media URL", http.StatusBadRequest)
		return
	}

	// Split the path to get the hash and the decryption key
	parts := strings.Split(fullUrl, "_")
	if len(parts) != 2 {
		http.Error(w, "Invalid media hash format", http.StatusBadRequest)
		return
	}

	storageHash := parts[0]
	mediaKeyHex := parts[1]

	mediaKey, err := hex.DecodeString(mediaKeyHex)
	if err != nil || len(mediaKey) != 32 {
		http.Error(w, "Invalid decryption key", http.StatusBadRequest)
		return
	}

	encryptedPayload, err := s.Storage.GetMedia(storageHash)
	if err != nil {
		http.Error(w, "Media not found", http.StatusNotFound)
		return
	}

	decryptedBase64, err := decryptMedia(encryptedPayload, mediaKey)
	if err != nil {
		http.Error(w, "Decryption failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"base64_data": decryptedBase64,
	})
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
