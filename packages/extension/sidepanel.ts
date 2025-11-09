import { getSettings } from "./lib/storage.js";
import { fetchSnapshots } from "./lib/api.js";
import type { Snapshots } from "./lib/schemas.js";

const view = document.getElementById("view");
const hdr = {
  source: document.getElementById("source")!,
  sha: document.getElementById("sha")!,
  bdv: document.getElementById("bdv")!,
  time: document.getElementById("time")!,
};

let currentData: Snapshots | null = null;
let currentTab = "ready";

async function load() {
  if (!view) return;
  
  try {
    view.innerHTML = '<div class="loading">Loading...</div>';
    
    const ctx = await detectContext();
    const data = await fetchSnapshots(ctx.owner, ctx.repo, ctx.ref);
    currentData = data;

    const meta = data.issues || data.ready || data.stats;
    hdr.source.textContent = `Source: ${meta?.source || "ci"}`;
    hdr.sha.textContent = `SHA: ${(meta?.git_sha || "unknown").substring(0, 7)}`;
    hdr.bdv.textContent = `bd v${meta?.bd_version || "?"}`;
    
    const generatedAt = meta?.generated_at ? new Date(meta.generated_at) : new Date();
    hdr.time.textContent = generatedAt.toLocaleString();

    render(currentTab);
  } catch (err) {
    view.innerHTML = `<div class="error">Error: ${err instanceof Error ? err.message : String(err)}</div>`;
  }
}

function detectContext(): Promise<{ owner: string; repo: string; ref: string }> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        const url = new URL(tabs[0].url);
        const parts = url.pathname.split("/").filter(Boolean);
        const owner = parts[0] || "";
        const repo = parts[1] || "";
        resolve({ owner, repo, ref: "HEAD" });
      } else {
        resolve({ owner: "", repo: "", ref: "HEAD" });
      }
    });
  });
}

function render(tab: string) {
  if (!currentData || !view) return;
  currentTab = tab;

  if (tab === "ready") {
    const rows = (currentData.ready.ready || [])
      .map(
        (r) => `
        <div class="row">
          <span class="title">${escapeHtml(r.title)}</span>
          <span class="priority">${r.priority || ""}</span>
          <span class="age ${r.age_days > 3 ? "aged" : ""}">${r.age_days?.toFixed(1) || 0}d</span>
        </div>
      `
      )
      .join("");
    view.innerHTML = `<h3>Ready</h3><div class="list">${rows || "No ready items"}</div>`;
  } else if (tab === "blocked") {
    const rows = (currentData.blocked.blocked || [])
      .map(
        (b) => `
        <div class="row">
          <span class="title">${escapeHtml(b.title)}</span>
          <span class="blocker-count">Blocked by ${b.blocked_by?.length || 0}</span>
        </div>
      `
      )
      .join("");
    view.innerHTML = `<h3>Blocked</h3><div class="list">${rows || "No blocked items"}</div>`;
  } else if (tab === "stats") {
    const s = currentData.stats;
    view.innerHTML = `
      <h3>Stats</h3>
      <ul class="stats-list">
        <li>Ready: <strong>${s.ready}</strong></li>
        <li>Blocked: <strong>${s.blocked}</strong></li>
        <li>Avg Ready Age: <strong>${s.avg_ready_age_days?.toFixed(1)}d</strong></li>
        <li>Longest Chain: <strong>${s.longest_chain}</strong></li>
        <li>Cycles: <strong>${s.cycles}</strong></li>
      </ul>
    `;
  } else if (tab === "deps") {
    const edges = (currentData.deps.edges || [])
      .map((e) => `<li>${escapeHtml(e.from)} → ${escapeHtml(e.to)}</li>`)
      .join("");
    view.innerHTML = `<h3>Dependencies</h3><ul class="deps-list">${edges || "No edges"}</ul>`;
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.getElementById("refresh")?.addEventListener("click", load);

document.querySelectorAll("#tabs button").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelectorAll("#tabs button").forEach((btn) => btn.classList.remove("active"));
    b.classList.add("active");
    const tab = (b as HTMLElement).dataset.tab;
    if (tab) {
      render(tab);
    }
  });
});

load();

