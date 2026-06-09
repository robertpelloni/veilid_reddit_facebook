package core

import (
	"encoding/hex"
	"github.com/mr-tron/base58"
)

// HexToBase58 converts a hex-encoded public key to Base58 for Bobcoin compatibility.
func HexToBase58(hexKey string) (string, error) {
	bytes, err := hex.DecodeString(hexKey)
	if err != nil {
		return "", err
	}
	return base58.Encode(bytes), nil
}

// Base58ToHex converts a Base58-encoded public key/signature to hex.
func Base58ToHex(b58 string) (string, error) {
	bytes, err := base58.Decode(b58)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
