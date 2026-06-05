package core

import "testing"

type MockStore struct {
	users map[string]*User
}

func (m *MockStore) GetUser(id string) (*User, error) {
	return m.users[id], nil
}

func (m *MockStore) GetUsers() ([]*User, error) {
	var users []*User
	for _, u := range m.users {
		users = append(users, u)
	}
	return users, nil
}

func TestResolveDelegate(t *testing.T) {
	store := &MockStore{
		users: map[string]*User{
			"A": {ID: "A", Delegates: map[string]string{"tech": "B"}},
			"B": {ID: "B", Delegates: map[string]string{"tech": "C"}},
			"C": {ID: "C"},
		},
	}

	res, _ := ResolveDelegate(store, "A", "tech")
	if res != "C" {
		t.Errorf("Expected C, got %s", res)
	}
}

func TestCalculateEffectivePower(t *testing.T) {
	store := &MockStore{
		users: map[string]*User{
			"A": {ID: "A", VoiceCredits: 10, Delegates: map[string]string{"tech": "C"}},
			"B": {ID: "B", VoiceCredits: 20, Delegates: map[string]string{"tech": "C"}},
			"C": {ID: "C", VoiceCredits: 30},
		},
	}

	power, _ := CalculateEffectivePower(store, "C", "tech")
	if power != 60 {
		t.Errorf("Expected 60, got %v", power)
	}
}
