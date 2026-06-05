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
	`)
	return err
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
