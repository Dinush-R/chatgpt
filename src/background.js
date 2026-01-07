// src/background.js

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;

  // 1. Insert the CSS (optional here, as you also load it inside the Shadow DOM in content.js,
  // but injecting it purely into the page context can sometimes help with font inheritance).
  // For your specific setup, you rely on the Shadow DOM link, so we can skip css injection here
  // or strictly inject the scripts.

  // 2. Inject the scripts in order:
  //    First 'rules.js' (to define the rules)
  //    Then 'content.js' (to run the audit and show the UI)
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["src/rules.js", "src/content.js"]
  }).catch((err) => console.error("Script injection failed", err));
});
