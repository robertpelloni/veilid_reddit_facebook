package core

import "math"

// Quadratic Voting (QV) Core Logic

// CalculateVoteCost returns the cost in Voice Credits for a given number of votes.
// Formula: cost = votes^2
func CalculateVoteCost(votes float64) float64 {
	return math.Pow(votes, 2)
}

// CalculateVotesFromCredits returns how many votes can be bought with a certain number of credits.
// Formula: votes = sqrt(credits)
func CalculateVotesFromCredits(credits float64) float64 {
	if credits < 0 {
		return 0
	}
	return math.Sqrt(credits)
}

// AggregateVotes sums individual votes cast by participants.
func AggregateVotes(voteCounts []float64) float64 {
	total := 0.0
	for _, v := range voteCounts {
		total += v
	}
	return total
}
