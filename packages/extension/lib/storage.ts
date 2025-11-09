export interface Settings {
  token: string;
  repos: string[];
}

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(["token", "repos"]);
  return {
    token: result.token || "",
    repos: result.repos || [],
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({
    token: settings.token,
    repos: settings.repos,
  });
}

