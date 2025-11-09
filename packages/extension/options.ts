import { getSettings, saveSettings } from "./lib/storage.js";

const el = (id: string) => document.getElementById(id) as HTMLElement;
const tokenInput = el("token") as HTMLInputElement;
const reposTextarea = el("repos") as HTMLTextAreaElement;
const saveButton = el("save");
const statusDiv = el("status");

async function loadSettings() {
  const settings = await getSettings();
  tokenInput.value = settings.token || "";
  reposTextarea.value = settings.repos.join("\n");
}

saveButton.addEventListener("click", async () => {
  const token = tokenInput.value.trim();
  const repos = reposTextarea.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    await saveSettings({ token, repos });
    statusDiv.textContent = "Saved!";
    statusDiv.className = "success";
    setTimeout(() => {
      statusDiv.textContent = "";
      statusDiv.className = "";
    }, 2000);
  } catch (err) {
    statusDiv.textContent = `Error: ${err instanceof Error ? err.message : String(err)}`;
    statusDiv.className = "error";
  }
});

loadSettings();

