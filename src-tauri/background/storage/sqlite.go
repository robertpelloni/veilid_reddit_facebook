package storage

import (
	"database/sql"
	"encoding/json"

	_ "github.com/mattn/go-sqlite3"
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
