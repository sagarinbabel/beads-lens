package main

// Envelope represents the common metadata for all snapshot files
type Envelope struct {
	SchemaVersion string `json:"schema_version"`
	BdVersion     string `json:"bd_version"`
	GitSHA        string `json:"git_sha"`
	GeneratedAt   string `json:"generated_at"`
	Source        string `json:"source"`
}

// IssuesResponse represents the structure of issues.json
type IssuesResponse struct {
	Envelope
	Issues []Issue `json:"issues"`
}

// Issue represents a single issue
type Issue struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	Status    string   `json:"status"`
	Priority  string   `json:"priority"`
	Labels    []string `json:"labels"`
	Assignee  string   `json:"assignee"`
	CreatedAt string   `json:"created_at"`
	UpdatedAt string   `json:"updated_at"`
	DependsOn []string `json:"depends_on"`
	Blocks    []string `json:"blocks"`
	Notes     string   `json:"notes,omitempty"`
	URL       string   `json:"url,omitempty"`
}

// ReadyResponse represents the structure of ready.json
type ReadyResponse struct {
	Envelope
	Ready []ReadyItem `json:"ready"`
}

// ReadyItem represents a ready work item
type ReadyItem struct {
	ID        string  `json:"id"`
	Title     string  `json:"title"`
	AgeDays   float64 `json:"age_days"`
	Priority  string  `json:"priority"`
}

// BlockedResponse represents the structure of blocked.json
type BlockedResponse struct {
	Envelope
	Blocked []BlockedItem `json:"blocked"`
}

// BlockedItem represents a blocked issue
type BlockedItem struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	BlockedBy []string `json:"blocked_by"`
	Priority  string   `json:"priority"`
}

// DepsResponse represents the structure of deps.json
type DepsResponse struct {
	Envelope
	Nodes []DepNode `json:"nodes"`
	Edges []DepEdge `json:"edges"`
}

// DepNode represents a node in the dependency graph
type DepNode struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

// DepEdge represents an edge in the dependency graph
type DepEdge struct {
	From string `json:"from"`
	To   string `json:"to"`
}

// StatsResponse represents the structure of stats.json
type StatsResponse struct {
	Envelope
	Ready           int     `json:"ready"`
	Blocked         int     `json:"blocked"`
	AvgReadyAgeDays float64 `json:"avg_ready_age_days"`
	LongestChain    int     `json:"longest_chain"`
	Cycles          int     `json:"cycles"`
}


