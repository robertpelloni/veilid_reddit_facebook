package core

import (
	"errors"
)

// ProposalStatus represents the current state of a governance proposal.
type ProposalStatus string

const (
	StatusDraft        ProposalStatus = "DRAFT"
	StatusSponsored    ProposalStatus = "SPONSORED"
	StatusActiveVoting ProposalStatus = "ACTIVE_VOTING"
	StatusFunded       ProposalStatus = "FUNDED"
	StatusRejected     ProposalStatus = "REJECTED"
	StatusInProgress   ProposalStatus = "IN_PROGRESS"
	StatusCompleted    ProposalStatus = "COMPLETED"
)

var ValidTransitions = map[ProposalStatus][]ProposalStatus{
	StatusDraft:        {StatusSponsored},
	StatusSponsored:    {StatusActiveVoting, StatusRejected},
	StatusActiveVoting: {StatusFunded, StatusRejected},
	StatusFunded:       {StatusInProgress, StatusRejected},
	StatusRejected:     {},
	StatusInProgress:   {StatusCompleted, StatusRejected},
	StatusCompleted:    {},
}

// CanTransition checks if a proposal can move from currentStatus to newStatus.
func CanTransition(currentStatus ProposalStatus, newStatus ProposalStatus) bool {
	allowed, ok := ValidTransitions[currentStatus]
	if !ok {
		return false
	}
	for _, s := range allowed {
		if s == newStatus {
			return true
		}
	}
	return false
}

// TransitionProposal returns a new status if the transition is valid, otherwise an error.
func TransitionProposal(currentStatus ProposalStatus, newStatus ProposalStatus) (ProposalStatus, error) {
	if !CanTransition(currentStatus, newStatus) {
		return currentStatus, errors.New("invalid state transition")
	}
	return newStatus, nil
}
