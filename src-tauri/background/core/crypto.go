package core

import (
	"crypto/ed25519"
	"encoding/hex"
	"fmt"
)

// VerifySignature checks if a signature is valid for a given message and public key.
// In this P2P network, the PublicSigningKey is often the AuthorID (DHT Key prefix).
func VerifySignature(publicKeyHex, signatureHex string, message []byte) (bool, error) {
	pubKey, err := hex.DecodeString(publicKeyHex)
	if err != nil {
		return false, fmt.Errorf("invalid public key hex: %v", err)
	}

	sig, err := hex.DecodeString(signatureHex)
	if err != nil {
		return false, fmt.Errorf("invalid signature hex: %v", err)
	}

	if len(pubKey) != ed25519.PublicKeySize {
		return false, fmt.Errorf("invalid public key size")
	}

	return ed25519.Verify(pubKey, message, sig), nil
}
