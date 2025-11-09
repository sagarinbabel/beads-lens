import { getSettings } from "./storage.js";
import type { Snapshots } from "./schemas.js";

async function githubGet(url: string, token: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const resp = await fetch(url, { headers });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  }
  return resp.json();
}

export async function fetchSnapshots(
  owner: string,
  repo: string,
  ref: string = "HEAD"
): Promise<Snapshots> {
  const { token } = await getSettings();
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/.beads/ui`;

  const [issues, ready, blocked, stats, deps] = await Promise.all([
    githubGet(`${base}/issues.json`, token),
    githubGet(`${base}/ready.json`, token),
    githubGet(`${base}/blocked.json`, token),
    githubGet(`${base}/stats.json`, token),
    githubGet(`${base}/deps.json`, token),
  ]);

  return { issues, ready, blocked, stats, deps };
}

