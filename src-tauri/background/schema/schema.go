package schema

import "time"

// ProfileRegistry represents a user's MySpace-style Root Sovereign Space.
// Fits securely inside Veilid's 64KB DHT block allocation limit.
type ProfileRegistry struct {
	Username         string        `json:"username"`
	PublicSigningKey string        `json:"public_signing_key"`
	MySpaceSchema    MySpaceLayout `json:"myspace_schema"`
	SubredditIndex   string        `json:"subreddit_index"` // Veilid DHT Multi-Writer Key
}

type MySpaceLayout struct {
	ThemeCSSBase64  string   `json:"theme_css_base64"` // Sandboxed custom CSS styles
	HTMLContent     string   `json:"html_content"`      // Sandboxed custom HTML
	BackgroundImage string   `json:"background_image"` // Veilid/IPFS asset reference
	TopEightFriends []string `json:"top_eight_friends"` // Array of peer Veilid Crypto Routing IDs
}

// PostHeader represents an index entry for a Subreddit post.
type PostHeader struct {
	PostID    string    `json:"post_id"`    // Unique cryptographic hash
	AuthorID  string    `json:"author_id"`  // Author's public routing key
	Title     string    `json:"title"`      // Max 300 chars
	TargetKey string    `json:"target_key"` // Specific Veilid DHT key containing the body & comment tree
	Timestamp time.Time `json:"timestamp"`
}

// Message represents a P2P real-time message between users.
type Message struct {
	ID        string    `json:"id"`
	SenderID  string    `json:"sender_id"`
	Recipient string    `json:"recipient_id"`
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
	Signature string    `json:"signature,omitempty"`
}

// DAOProposal represents a governance proposal in the P2P network.
type DAOProposal struct {
	ID         string         `json:"id"`
	Title      string         `json:"title"`
	Abstract   string         `json:"abstract"`
	ProposerID string         `json:"proposer_id"`
	Status     string         `json:"status"`
	VotesFor   float64        `json:"votes_for"`
	VotesAgainst float64      `json:"votes_against"`
	CreatedAt  time.Time      `json:"created_at"`
}

// DAOVote represents a single signed vote on a proposal.
type DAOVote struct {
	ProposalID string  `json:"proposal_id"`
	VoterID    string  `json:"voter_id"`
	Weight     float64 `json:"weight"`
	Signature  string  `json:"signature"`
}
