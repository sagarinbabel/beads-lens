// Type definitions matching Go structs from packages/exporter/schema.go

export interface Envelope {
  schema_version: string;
  bd_version: string;
  git_sha: string;
  generated_at: string;
  source: string;
}

export interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  labels: string[];
  assignee: string;
  created_at: string;
  updated_at: string;
  depends_on: string[];
  blocks: string[];
  notes?: string;
  url?: string;
}

export interface IssuesResponse extends Envelope {
  issues: Issue[];
}

export interface ReadyItem {
  id: string;
  title: string;
  age_days: number;
  priority: string;
}

export interface ReadyResponse extends Envelope {
  ready: ReadyItem[];
}

export interface BlockedItem {
  id: string;
  title: string;
  blocked_by: string[];
  priority: string;
}

export interface BlockedResponse extends Envelope {
  blocked: BlockedItem[];
}

export interface DepNode {
  id: string;
  label: string;
}

export interface DepEdge {
  from: string;
  to: string;
}

export interface DepsResponse extends Envelope {
  nodes: DepNode[];
  edges: DepEdge[];
}

export interface StatsResponse extends Envelope {
  ready: number;
  blocked: number;
  avg_ready_age_days: number;
  longest_chain: number;
  cycles: number;
}

export interface Snapshots {
  issues: IssuesResponse;
  ready: ReadyResponse;
  blocked: BlockedResponse;
  stats: StatsResponse;
  deps: DepsResponse;
}

