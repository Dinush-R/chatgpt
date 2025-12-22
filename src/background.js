chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;

  // We rely on content.js to fetch and inject the CSS into the Shadow DOM.
  // We do NOT inject CSS globally to avoid polluting the page.

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["src/rules.js", "src/content.js"]
  }).catch(err => console.error("Script injection failed", err));
});
