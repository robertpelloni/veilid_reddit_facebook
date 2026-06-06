package storage

import (
	"database/sql"
	"encoding/json"

	_ "github.com/mattn/go-sqlite3"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/core"
	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/schema"
)

type SQLiteStorage struct {
	db *sql.DB
}

func NewSQLiteStorage(dbPath string) (*SQLiteStorage, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	s := &SQLiteStorage{db: db}
	if err := s.initSchema(); err != nil {
		return nil, err
	}

	return s, nil
}

func (s *SQLiteStorage) initSchema() error {
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS profiles (
			dht_key TEXT PRIMARY KEY,
			username TEXT,
			data BLOB,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS posts (
			post_id TEXT PRIMARY KEY,
			author_id TEXT,
			title TEXT,
			target_key TEXT,
			timestamp TIMESTAMP,
			subreddit_key TEXT
		);
		CREATE TABLE IF NOT EXISTS registry (
			dht_key TEXT PRIMARY KEY,
			username TEXT,
			registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS dao_proposals (
			id TEXT PRIMARY KEY,
			title TEXT,
			abstract TEXT,
			proposer_id TEXT,
			status TEXT,
			votes_for REAL DEFAULT 0,
			votes_against REAL DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS dao_votes (
			proposal_id TEXT,
			voter_id TEXT,
			weight REAL,
			PRIMARY KEY (proposal_id, voter_id)
		);
		CREATE TABLE IF NOT EXISTS dao_delegations (
			delegator_id TEXT,
			delegatee_id TEXT,
			subject TEXT,
			PRIMARY KEY (delegator_id, subject)
		);
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			voice_credits REAL DEFAULT 10
		);
		CREATE TABLE IF NOT EXISTS comments (
			id TEXT PRIMARY KEY,
			post_id TEXT,
			author_id TEXT,
			content TEXT,
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	return err
}

func (s *SQLiteStorage) RegisterKey(dhtKey string, username string) error {
	_, err := s.db.Exec(`
		INSERT OR REPLACE INTO registry (dht_key, username)
		VALUES (?, ?)
	`, dhtKey, username)
	return err
}

func (s *SQLiteStorage) GetRegisteredKeys() ([]map[string]string, error) {
	rows, err := s.db.Query("SELECT dht_key, username FROM registry ORDER BY registered_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []map[string]string
	for rows.Next() {
		var dhtKey, username string
		if err := rows.Scan(&dhtKey, &username); err != nil {
			return nil, err
		}
		keys = append(keys, map[string]string{"dht_key": dhtKey, "username": username})
	}
	return keys, nil
}

func (s *SQLiteStorage) SaveProfile(dhtKey string, profile *schema.ProfileRegistry) error {
	data, err := json.Marshal(profile)
	if err != nil {
		return err
	}

	_, err = s.db.Exec(`
		INSERT OR REPLACE INTO profiles (dht_key, username, data, updated_at)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP)
	`, dhtKey, profile.Username, data)
	return err
}

func (s *SQLiteStorage) SavePost(p *schema.PostHeader, subredditKey string) error {
	_, err := s.db.Exec(`
		INSERT OR REPLACE INTO posts (post_id, author_id, title, target_key, timestamp, subreddit_key)
		VALUES (?, ?, ?, ?, ?, ?)
	`, p.PostID, p.AuthorID, p.Title, p.TargetKey, p.Timestamp, subredditKey)
	return err
}

func (s *SQLiteStorage) GetPosts(subredditKey string) ([]*schema.PostHeader, error) {
	rows, err := s.db.Query("SELECT post_id, author_id, title, target_key, timestamp FROM posts WHERE subreddit_key = ? ORDER BY timestamp DESC", subredditKey)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []*schema.PostHeader
	for rows.Next() {
		p := &schema.PostHeader{}
		if err := rows.Scan(&p.PostID, &p.AuthorID, &p.Title, &p.TargetKey, &p.Timestamp); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func (s *SQLiteStorage) GetUser(id string) (*core.User, error) {
	var credits float64
	err := s.db.QueryRow("SELECT voice_credits FROM users WHERE id = ?", id).Scan(&credits)
	if err != nil {
		return &core.User{ID: id, VoiceCredits: 10, Delegates: make(map[string]string)}, nil // Default
	}
	return &core.User{ID: id, VoiceCredits: credits, Delegates: make(map[string]string)}, nil
}

func (s *SQLiteStorage) GetUsers() ([]*core.User, error) {
	rows, err := s.db.Query("SELECT id, voice_credits FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*core.User
	for rows.Next() {
		u := &core.User{Delegates: make(map[string]string)}
		if err := rows.Scan(&u.ID, &u.VoiceCredits); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

func (s *SQLiteStorage) GetProfile(dhtKey string) (*schema.ProfileRegistry, error) {
	var data []byte
	err := s.db.QueryRow("SELECT data FROM profiles WHERE dht_key = ?", dhtKey).Scan(&data)
	if err != nil {
		return nil, err
	}

	var profile schema.ProfileRegistry
	if err := json.Unmarshal(data, &profile); err != nil {
		return nil, err
	}

	return &profile, nil
}

func (s *SQLiteStorage) Close() error {
	return s.db.Close()
}

func (s *SQLiteStorage) SaveDAOProposal(p *schema.DAOProposal) error {
	_, err := s.db.Exec(`
		INSERT OR REPLACE INTO dao_proposals (id, title, abstract, proposer_id, status, votes_for, votes_against)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, p.ID, p.Title, p.Abstract, p.ProposerID, p.Status, p.VotesFor, p.VotesAgainst)
	return err
}

func (s *SQLiteStorage) GetDAOProposals() ([]*schema.DAOProposal, error) {
	rows, err := s.db.Query("SELECT id, title, abstract, proposer_id, status, votes_for, votes_against, created_at FROM dao_proposals ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var proposals []*schema.DAOProposal
	for rows.Next() {
		p := &schema.DAOProposal{}
		if err := rows.Scan(&p.ID, &p.Title, &p.Abstract, &p.ProposerID, &p.Status, &p.VotesFor, &p.VotesAgainst, &p.CreatedAt); err != nil {
			return nil, err
		}
		proposals = append(proposals, p)
	}
	return proposals, nil
}

func (s *SQLiteStorage) SaveComment(c *schema.Comment) error {
	_, err := s.db.Exec(`
		INSERT OR REPLACE INTO comments (id, post_id, author_id, content, timestamp)
		VALUES (?, ?, ?, ?, ?)
	`, c.ID, c.PostID, c.AuthorID, c.Content, c.Timestamp)
	return err
}

func (s *SQLiteStorage) GetComments(postID string) ([]*schema.Comment, error) {
	rows, err := s.db.Query("SELECT id, post_id, author_id, content, timestamp FROM comments WHERE post_id = ? ORDER BY timestamp ASC", postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []*schema.Comment
	for rows.Next() {
		c := &schema.Comment{}
		if err := rows.Scan(&c.ID, &c.PostID, &c.AuthorID, &c.Content, &c.Timestamp); err != nil {
			return nil, err
		}
		comments = append(comments, c)
	}
	return comments, nil
}

func (s *SQLiteStorage) CastDAOVote(v *schema.DAOVote) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(`
		INSERT OR REPLACE INTO dao_votes (proposal_id, voter_id, weight)
		VALUES (?, ?, ?)
	`, v.ProposalID, v.VoterID, v.Weight)
	if err != nil {
		return err
	}

	// Update proposal totals
	if v.Weight > 0 {
		_, err = tx.Exec("UPDATE dao_proposals SET votes_for = votes_for + ? WHERE id = ?", v.Weight, v.ProposalID)
	} else {
		_, err = tx.Exec("UPDATE dao_proposals SET votes_against = votes_against + ? WHERE id = ?", -v.Weight, v.ProposalID)
	}
	if err != nil {
		return err
	}

	return tx.Commit()
}
