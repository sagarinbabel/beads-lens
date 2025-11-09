chrome.runtime.onInstalled.addListener(() => {
  console.log("Beads Lens installed");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "openSidePanel") {
    if (sender.tab?.windowId !== undefined) {
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
    }
  }
  return true; // Keep the message channel open for async response
});

