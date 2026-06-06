package core

// Liquid Delegation Logic

type Store interface {
	GetUser(id string) (*User, error)
	GetUsers() ([]*User, error)
}

type User struct {
	ID           string
	VoiceCredits float64
	Delegates    map[string]string // subject -> user_id
}

// ResolveDelegate finds the ultimate recipient of a delegation chain.
func ResolveDelegate(s Store, userID string, subject string) (string, error) {
	currentID := userID
	visited := make(map[string]bool)

	for {
		if visited[currentID] {
			// Cycle detected, return original user as self-delegate
			return userID, nil
		}
		visited[currentID] = true

		user, err := s.GetUser(currentID)
		if err != nil || user == nil {
			return currentID, nil
		}

		delegateID, ok := user.Delegates[subject]
		if !ok || delegateID == "" {
			return currentID, nil
		}
		currentID = delegateID
	}
}

// CalculateEffectivePower sums a user's credits plus all credits transitively delegated to them.
func CalculateEffectivePower(s Store, targetUserID string, subject string) (float64, error) {
	totalCredits := 0.0
	allUsers, err := s.GetUsers()
	if err != nil {
		return 0, err
	}

	for _, user := range allUsers {
		ultimate, err := ResolveDelegate(s, user.ID, subject)
		if err == nil && ultimate == targetUserID {
			totalCredits += user.VoiceCredits
		}
	}
	return totalCredits, nil
}
