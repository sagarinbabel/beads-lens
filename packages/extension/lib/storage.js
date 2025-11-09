export async function getSettings() {
    const result = await chrome.storage.local.get(["token", "repos"]);
    return {
        token: result.token || "",
        repos: result.repos || [],
    };
}
export async function saveSettings(settings) {
    await chrome.storage.local.set({
        token: settings.token,
        repos: settings.repos,
    });
}
//# sourceMappingURL=storage.js.map