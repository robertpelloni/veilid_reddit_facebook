package media

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
)

// IPFSStub represents a simple local mock of IPFS/Hypercore for encrypted media storage.
type IPFSStub struct {
	baseDir string
}

// NewIPFSStub creates a new IPFS mock instance storing files locally.
func NewIPFSStub(baseDir string) (*IPFSStub, error) {
	err := os.MkdirAll(baseDir, 0755)
	if err != nil {
		return nil, err
	}
	return &IPFSStub{baseDir: baseDir}, nil
}

// StoreEncrypted encrypts and stores the media file, returning a mock content-addressed CID and the encryption key.
func (i *IPFSStub) StoreEncrypted(data []byte) (string, []byte, error) {
	// Generate a 32-byte AES key
	key := make([]byte, 32)
	for idx := range key {
		key[idx] = byte(idx) // Mock key generation
	}

	encryptedData, err := Encrypt(data, key)
	if err != nil {
		return "", nil, err
	}

	// Create mock CID (SHA-256 of encrypted data)
	hash := sha256.Sum256(encryptedData)
	cid := hex.EncodeToString(hash[:])

	filePath := filepath.Join(i.baseDir, cid)
	err = os.WriteFile(filePath, encryptedData, 0644)
	if err != nil {
		return "", nil, err
	}

	return cid, key, nil
}

// RetrieveDecrypted retrieves the mock CID and decrypts it using the provided key.
func (i *IPFSStub) RetrieveDecrypted(cid string, key []byte) ([]byte, error) {
	filePath := filepath.Join(i.baseDir, cid)
	encryptedData, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("media not found or could not be read: %v", err)
	}

	decryptedData, err := Decrypt(encryptedData, key)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt media: %v", err)
	}

	return decryptedData, nil
}
