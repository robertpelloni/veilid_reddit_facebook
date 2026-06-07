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

		var res interface{}
		switch req.Method {
		case "veilid.new_routing_context":
			res = "ctx_123"
		case "veilid.routing_context_set_dht_value":
			res = "dht_key_123"
		case "veilid.routing_context_close":
			res = nil
		default:
			t.Errorf("Unexpected method: %s", req.Method)
		}

		result, _ := json.Marshal(res)
		resp := RPCResponse{
			JSONRPC: "2.0",
			Result:  result,
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

		var res interface{}
		switch req.Method {
		case "veilid.new_routing_context":
			res = "ctx_123"
		case "veilid.routing_context_get_dht_value":
			registry := schema.ProfileRegistry{Username: "testuser"}
			res, _ = json.Marshal(registry)
		case "veilid.routing_context_close":
			res = nil
		default:
			t.Errorf("Unexpected method: %s", req.Method)
		}

		result, _ := json.Marshal(res)
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
