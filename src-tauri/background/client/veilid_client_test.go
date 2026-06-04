package client

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/schema"
)

func TestVeilidClient_PublishProfile(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req RPCRequest
		json.NewDecoder(r.Body).Decode(&req)

		if req.Method != "veilid.set_dht_value" {
			t.Errorf("Expected method veilid.set_dht_value, got %s", req.Method)
		}

		resp := RPCResponse{
			JSONRPC: "2.0",
			Result:  json.RawMessage(`"dht_key_123"`),
			ID:      req.ID,
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := NewVeilidClient(server.URL)
	registry := schema.ProfileRegistry{Username: "testuser"}
	key, err := client.PublishProfile(registry)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	if key != "dht_key_123" {
		t.Errorf("Expected dht_key_123, got %s", key)
	}
}

func TestVeilidClient_FetchProfile(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req RPCRequest
		json.NewDecoder(r.Body).Decode(&req)

		if req.Method != "veilid.get_dht_value" {
			t.Errorf("Expected method veilid.get_dht_value, got %s", req.Method)
		}

		registry := schema.ProfileRegistry{Username: "testuser"}
		registryData, _ := json.Marshal(registry)
		result, _ := json.Marshal(registryData)

		resp := RPCResponse{
			JSONRPC: "2.0",
			Result:  result,
			ID:      req.ID,
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := NewVeilidClient(server.URL)
	registry, err := client.FetchProfile("dht_key_123")

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	if registry.Username != "testuser" {
		t.Errorf("Expected username testuser, got %s", registry.Username)
	}
}
