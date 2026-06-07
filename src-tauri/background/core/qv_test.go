package core

import "testing"

func TestCalculateVoteCost(t *testing.T) {
	if cost := CalculateVoteCost(3); cost != 9 {
		t.Errorf("Expected 9, got %v", cost)
	}
	if cost := CalculateVoteCost(-2); cost != 4 {
		t.Errorf("Expected 4, got %v", cost)
	}
}

func TestCalculateVotesFromCredits(t *testing.T) {
	if votes := CalculateVotesFromCredits(16); votes != 4 {
		t.Errorf("Expected 4, got %v", votes)
	}
	if votes := CalculateVotesFromCredits(-1); votes != 0 {
		t.Errorf("Expected 0, got %v", votes)
	}
}
