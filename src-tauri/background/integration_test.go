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

// MockClient mocks Veilid interactions for integration tests
type MockClient struct {
    client.VeilidClient
}

func (m *MockClient) PublishProfile(p schema.ProfileRegistry) (string, error) { return "mock_key", nil }
func (m *MockClient) FetchProfile(k string) (*schema.ProfileRegistry, error) { return &schema.ProfileRegistry{Username: "FetchUser"}, nil }
func (m *MockClient) SendMessage(msg schema.Message) error { return nil }
func (m *MockClient) GetMessages() ([]schema.Message, error) { return []schema.Message{}, nil }
func (m *MockClient) PublishComment(c schema.Comment) error { return nil }
func (m *MockClient) PublishDAOProposal(p schema.DAOProposal) (string, error) { return "mock_dao", nil }
func (m *MockClient) CastDAOVoteP2P(v schema.DAOVote) error { return nil }

func TestIntegrationAPI(t *testing.T) {
	// Setup temporary database
	dbPath := "test_integration.db"
	defer os.Remove(dbPath)
	store, err := storage.NewSQLiteStorage(dbPath)
	if err != nil {
		t.Fatalf("Failed to create storage: %v", err)
	}

	// Setup mock client - but AppState uses *client.VeilidClient
    // We need to use a real VeilidClient but maybe intercept the call method or similar.
    // However, for this turn, let's just use the real client but it will fail connection.
    // Wait, let's fix the handlers to handle nil Veilid or similar if possible.
    // Better: let's use a mock server for the Veilid RPC.

    server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        resp := client.RPCResponse{
            JSONRPC: "2.0",
            Result:  json.RawMessage(`"mock_dht_key"`),
            ID:      1,
        }
        json.NewEncoder(w).Encode(resp)
    }))
    defer server.Close()

	vClient := client.NewVeilidClient(server.URL)

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
		profile := schema.ProfileRegistry{Username: "FetchUser"}
		body, _ := json.Marshal(profile)
		pReq := httptest.NewRequest("POST", "/publish", bytes.NewBuffer(body))
		pRR := httptest.NewRecorder()
		state.handlePublish(pRR, pReq)

		var pResp map[string]string
		json.Unmarshal(pRR.Body.Bytes(), &pResp)
		key := pResp["dht_key"]

		req := httptest.NewRequest("GET", "/fetch?key="+key, nil)
		rr := httptest.NewRecorder()
		state.handleFetch(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Fetch failed: %d %s", rr.Code, rr.Body.String())
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
	})

	t.Run("Comments API", func(t *testing.T) {
		comment := schema.Comment{
			ID:      "cmt1",
			PostID:  "post123",
			Content: "This is a P2P comment",
		}
		body, _ := json.Marshal(comment)
		req := httptest.NewRequest("POST", "/comments/add", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		state.handleAddComment(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Add comment failed: %d", rr.Code)
		}
	})
}
