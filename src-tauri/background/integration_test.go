package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/client"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/schema"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/storage"
)

func TestIntegrationAPI(t *testing.T) {
	// Setup temporary database
	dbPath := "test_integration.db"
	defer os.Remove(dbPath)
	store, err := storage.NewSQLiteStorage(dbPath)
	if err != nil {
		t.Fatalf("Failed to create storage: %v", err)
	}

	// Setup mock client
	vClient := client.NewVeilidClient("http://localhost:5959")

	state := &AppState{
		Veilid:  vClient,
		Storage: store,
	}

	t.Run("Status Endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/status", nil)
		rr := httptest.NewRecorder()
		state.handleStatus(rr, req)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", rr.Code)
		}
	})

	t.Run("Publish Profile", func(t *testing.T) {
		profile := schema.ProfileRegistry{
			Username: "TestUser",
			MySpaceSchema: schema.MySpaceLayout{
				ThemeCSSBase64: "Ym9keSB7IGNvbG9yOiByZWQ7IH0=", // "body { color: red; }"
			},
		}
		body, _ := json.Marshal(profile)
		req := httptest.NewRequest("POST", "/publish", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		state.handlePublish(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var resp map[string]string
		json.Unmarshal(rr.Body.Bytes(), &resp)
		if _, ok := resp["dht_key"]; !ok {
			t.Error("Response missing dht_key")
		}
	})

	t.Run("Register and Discovery", func(t *testing.T) {
		regReq := struct {
			DHTKey   string `json:"dht_key"`
			Username string `json:"username"`
		}{
			DHTKey:   "test_key_123",
			Username: "TestUser",
		}
		body, _ := json.Marshal(regReq)
		req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		state.handleRegister(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Register failed: %d", rr.Code)
		}

		req = httptest.NewRequest("GET", "/discovery", nil)
		rr = httptest.NewRecorder()
		state.handleDiscovery(rr, req)
		if rr.Code != http.StatusOK {
			t.Errorf("Discovery failed: %d", rr.Code)
		}

		var results []map[string]string
		json.Unmarshal(rr.Body.Bytes(), &results)
		if len(results) == 0 {
			t.Error("Discovery returned no results")
		}
	})

	t.Run("Fetch Profile", func(t *testing.T) {
		// We published "TestUser" earlier, it should be in cache
		req := httptest.NewRequest("GET", "/fetch?key=mock_vld_test_key", nil) // Mock key from PublishProfile
		rr := httptest.NewRecorder()
		state.handleFetch(rr, req)

		// Note: PublishProfile in prototype returns "mock_vld_test_key"
		// If we use that key, it should hit the cache or mock fetch.

		// Actually, let's use the key returned by PublishProfile
		profile := schema.ProfileRegistry{Username: "FetchUser"}
		body, _ := json.Marshal(profile)
		pReq := httptest.NewRequest("POST", "/publish", bytes.NewBuffer(body))
		pRR := httptest.NewRecorder()
		state.handlePublish(pRR, pReq)

		var pResp map[string]string
		json.Unmarshal(pRR.Body.Bytes(), &pResp)
		key := pResp["dht_key"]

		req = httptest.NewRequest("GET", "/fetch?key="+key, nil)
		rr = httptest.NewRecorder()
		state.handleFetch(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Fetch failed: %d", rr.Code)
		}
		var fetched schema.ProfileRegistry
		json.Unmarshal(rr.Body.Bytes(), &fetched)
		if fetched.Username != "FetchUser" {
			t.Errorf("Expected FetchUser, got %s", fetched.Username)
		}
	})

	t.Run("Messaging API", func(t *testing.T) {
		msg := schema.Message{
			SenderID:  "alice",
			Recipient: "bob",
			Content:   "Hello Bob!",
		}
		body, _ := json.Marshal(msg)
		req := httptest.NewRequest("POST", "/message/send", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		state.handleSendMessage(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Send message failed: %d", rr.Code)
		}

		req = httptest.NewRequest("GET", "/message/inbox", nil)
		rr = httptest.NewRecorder()
		state.handleGetInbox(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Get inbox failed: %d", rr.Code)
		}
	})
}
