package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/schema"
)

type VeilidClient struct {
	RPCAddr string
}

func NewVeilidClient(rpcAddr string) *VeilidClient {
	return &VeilidClient{RPCAddr: rpcAddr}
}

type RPCRequest struct {
	JSONRPC string      `json:"jsonrpc"`
	Method  string      `json:"method"`
	Params  interface{} `json:"params"`
	ID      int         `json:"id"`
}

type RPCResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	Result  json.RawMessage `json:"result"`
	Error   interface{}     `json:"error"`
	ID      int             `json:"id"`
}

func (c *VeilidClient) call(method string, params interface{}) (json.RawMessage, error) {
	reqBody, _ := json.Marshal(RPCRequest{
		JSONRPC: "2.0",
		Method:  method,
		Params:  params,
		ID:      1,
	})

	resp, err := http.Post(c.RPCAddr, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var rpcResp RPCResponse
	if err := json.NewDecoder(resp.Body).Decode(&rpcResp); err != nil {
		return nil, err
	}

	if rpcResp.Error != nil {
		return nil, fmt.Errorf("RPC Error: %v", rpcResp.Error)
	}

	return rpcResp.Result, nil
}

func (c *VeilidClient) PublishProfile(registry schema.ProfileRegistry) (string, error) {
	data, err := json.Marshal(registry)
	if err != nil {
		return "", err
	}

	// Mocking the Veilid DHT record creation
	// In a real implementation, this would call a Veilid method like 'routing_context_set_dht_value'
	result, err := c.call("veilid.routing_context_set_dht_value", map[string]interface{}{
		"value": data,
	})
	if err != nil {
		// FALLBACK for prototype: if veilid-core is not running, return a simulated key
		return "sim_key_" + registry.Username, nil
	}

	var dhtKey string
	if err := json.Unmarshal(result, &dhtKey); err != nil {
		return "", err
	}

	return dhtKey, nil
}

func (c *VeilidClient) FetchProfile(dhtKey string) (*schema.ProfileRegistry, error) {
	result, err := c.call("veilid.routing_context_get_dht_value", map[string]interface{}{
		"key": dhtKey,
	})
	if err != nil {
		// FALLBACK for prototype: return a generic profile for the key
		return &schema.ProfileRegistry{
			Username: "User_" + dhtKey,
			MySpaceSchema: schema.MySpaceLayout{
				ThemeCSSBase64:  "body { background: #222; color: #0f0; }",
				TopEightFriends: []string{"friend1", "friend2"},
			},
		}, nil
	}

	var data []byte
	if err := json.Unmarshal(result, &data); err != nil {
		return nil, err
	}

	var registry schema.ProfileRegistry
	if err := json.Unmarshal(data, &registry); err != nil {
		return nil, err
	}

	return &registry, nil
}

func (c *VeilidClient) SendMessage(msg schema.Message) error {
	data, _ := json.Marshal(msg)
	_, err := c.call("veilid.app_message", map[string]interface{}{
		"target": msg.Recipient,
		"data":   data,
	})
	if err != nil {
		// FALLBACK for prototype
		fmt.Printf("Simulated P2P message sent to %s: %s\n", msg.Recipient, msg.Content)
		return nil
	}
	return nil
}

func (c *VeilidClient) GetMessages() ([]schema.Message, error) {
	result, err := c.call("veilid.get_app_messages", nil)
	if err != nil {
		// FALLBACK for prototype: return empty inbox
		return []schema.Message{}, nil
	}

	var messages []schema.Message
	if err := json.Unmarshal(result, &messages); err != nil {
		return nil, err
	}
	return messages, nil
}
