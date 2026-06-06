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

	result, err := c.call("veilid.routing_context_set_dht_value", map[string]interface{}{
		"value": data,
	})
	if err != nil {
		return "", fmt.Errorf("P2P publish failed: %v", err)
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
		return nil, fmt.Errorf("P2P fetch failed for key %s: %v", dhtKey, err)
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
	return err
}

func (c *VeilidClient) GetMessages() ([]schema.Message, error) {
	result, err := c.call("veilid.get_app_messages", nil)
	if err != nil {
		return nil, err
	}

	var messages []schema.Message
	if err := json.Unmarshal(result, &messages); err != nil {
		return nil, err
	}
	return messages, nil
}

func (c *VeilidClient) PublishDAOProposal(p schema.DAOProposal) (string, error) {
	data, _ := json.Marshal(p)
	result, err := c.call("veilid.routing_context_set_dht_value", map[string]interface{}{
		"value": data,
	})
	if err != nil {
		return "", err
	}
	var dhtKey string
	json.Unmarshal(result, &dhtKey)
	return dhtKey, nil
}

func (c *VeilidClient) CastDAOVoteP2P(v schema.DAOVote) error {
	data, _ := json.Marshal(v)
	_, err := c.call("veilid.routing_context_set_dht_value", map[string]interface{}{
		"value": data,
	})
	return err
}

func (c *VeilidClient) PublishComment(cmt schema.Comment) error {
	data, _ := json.Marshal(cmt)
	// Multi-writer DHT: every post has a target key for comments
	_, err := c.call("veilid.routing_context_set_dht_value", map[string]interface{}{
		"value": data,
	})
	return err
}

func (c *VeilidClient) GetCommentsP2P(postID string) ([]schema.Comment, error) {
	// In a real multi-writer DHT, we would fetch and merge signed records
	return []schema.Comment{}, nil
}
