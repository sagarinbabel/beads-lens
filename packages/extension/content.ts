function injectBadge() {
  const path = location.pathname.split("/").filter(Boolean);
  if (path.length < 4 || path[2] !== "pull") return;

  // Wait for the page to load
  const title = document.querySelector("span.js-issue-title");
  if (!title) {
    // Retry after a short delay if the element isn't ready
    setTimeout(injectBadge, 500);
    return;
  }

  // Check if badge already exists
  if (document.querySelector(".beads-lens-badge")) return;

  const badge = document.createElement("span");
  badge.className = "beads-lens-badge";
  badge.textContent = "Beads Lens";
  badge.style.marginLeft = "8px";
  badge.style.padding = "2px 6px";
  badge.style.border = "1px solid #ddd";
  badge.style.borderRadius = "8px";
  badge.style.fontSize = "12px";
  badge.style.cursor = "pointer";
  badge.style.backgroundColor = "#f6f8fa";
  badge.style.color = "#0366d6";
  badge.title = "Open Beads Lens side panel";

  badge.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openSidePanel" });
  });

  title.appendChild(badge);
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectBadge);
} else {
  injectBadge();
}

