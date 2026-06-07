package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/schema"
)

type VeilidClient struct {
	RPCAddr        string
	ProtocolString string
}

func NewVeilidClient(rpcAddr string) *VeilidClient {
	return &VeilidClient{
		RPCAddr:        rpcAddr,
		ProtocolString: "veilid-reddit-myspace-v1",
	}
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

// setupRoutingContext establishes a private 3-hop onion routing context.
func (c *VeilidClient) setupRoutingContext() (string, error) {
	resp, err := c.rawCall("veilid.new_routing_context", nil)
	if err != nil {
		return "", err
	}
	var ctxID string
	if err := json.Unmarshal(resp, &ctxID); err != nil {
		return "", err
	}
	return ctxID, nil
}

func (c *VeilidClient) rawCall(method string, params interface{}) (json.RawMessage, error) {
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

func (c *VeilidClient) call(method string, params map[string]interface{}) (json.RawMessage, error) {
	ctxID, err := c.setupRoutingContext()
	if err != nil {
		return nil, fmt.Errorf("context setup failed: %v", err)
	}

	if params == nil {
		params = make(map[string]interface{})
	}
	params["routing_context"] = ctxID

	res, err := c.rawCall(method, params)

	// Best effort cleanup
	c.rawCall("veilid.routing_context_close", map[string]string{"routing_context": ctxID})

	return res, err
}

func (c *VeilidClient) PublishProfile(registry schema.ProfileRegistry) (string, error) {
	data, err := json.Marshal(registry)
	if err != nil {
		return "", err
	}

	result, err := c.call("veilid.routing_context_set_dht_value", map[string]interface{}{
		"key":   registry.PublicSigningKey, // Use key-specific storage
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
	_, err := c.call("veilid.routing_context_app_message", map[string]interface{}{
		"target": msg.Recipient,
		"data":   data,
	})
	return err
}

func (c *VeilidClient) GetMessages() ([]schema.Message, error) {
	result, err := c.call("veilid.routing_context_get_app_messages", nil)
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

func (c *VeilidClient) PublishPost(p schema.PostHeader, subredditKey string) error {
	// First fetch existing posts
	posts, _ := c.FetchPostsP2P(subredditKey)
	posts = append([]schema.PostHeader{p}, posts...) // Newest first

	// Keep only last 50 posts for prototype performance
	if len(posts) > 50 {
		posts = posts[:50]
	}

	data, _ := json.Marshal(posts)
	_, err := c.call("veilid.routing_context_set_dht_value", map[string]interface{}{
		"key":   subredditKey,
		"value": data,
	})
	return err
}

func (c *VeilidClient) FetchPostsP2P(subredditKey string) ([]schema.PostHeader, error) {
	result, err := c.call("veilid.routing_context_get_dht_value", map[string]interface{}{
		"key": subredditKey,
	})
	if err != nil {
		return nil, err
	}

	var posts []schema.PostHeader
	if err := json.Unmarshal(result, &posts); err != nil {
		var single schema.PostHeader
		if err2 := json.Unmarshal(result, &single); err2 == nil {
			return []schema.PostHeader{single}, nil
		}
		return []schema.PostHeader{}, nil
	}
	return posts, nil
}

func (c *VeilidClient) PublishComment(cmt schema.Comment, postKey string) error {
	data, _ := json.Marshal(cmt)
	_, err := c.call("veilid.routing_context_set_dht_value", map[string]interface{}{
		"key":   postKey,
		"value": data,
	})
	return err
}

func (c *VeilidClient) GetCommentsP2P(postKey string) ([]schema.Comment, error) {
	result, err := c.call("veilid.routing_context_get_dht_value", map[string]interface{}{
		"key": postKey,
	})
	if err != nil {
		return nil, err
	}
	var comments []schema.Comment
	json.Unmarshal(result, &comments)
	return comments, nil
}

func (c *VeilidClient) GenerateIdentityP2P() (map[string]string, error) {
	result, err := c.call("veilid.create_crypto_routing_pair", nil)
	if err != nil {
		return nil, err
	}
	var id map[string]string
	json.Unmarshal(result, &id)
	return id, nil
}

func (c *VeilidClient) ImportIdentityP2P(mnemonic string) (map[string]string, error) {
	result, err := c.call("veilid.import_crypto_routing_pair", map[string]interface{}{"mnemonic": mnemonic})
	if err != nil {
		return nil, err
	}
	var id map[string]string
	json.Unmarshal(result, &id)
	return id, nil
}

func (c *VeilidClient) GetStatus() (map[string]interface{}, error) {
	// Status doesn't usually need a routing context, so we call raw
	result, err := c.rawCall("veilid.get_status", nil)
	if err != nil {
		return nil, err
	}
	var status map[string]interface{}
	json.Unmarshal(result, &status)
	return status, nil
}
