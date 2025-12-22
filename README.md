# SME Website Consultant Chrome Extension

A privacy-focused, local-only Chrome Extension (Manifest V3) that audits webpages for small business best practices. It uses deterministic heuristics to provide a consultant-style report on Message Clarity, Conversion, Trust, and Mobile Readiness.

## 🚀 Installation

Since this is a custom extension, you need to install it in "Developer Mode":

1.  Download or clone this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Toggle **Developer mode** in the top right corner.
4.  Click **Load unpacked** in the top left.
5.  Select the folder containing `manifest.json` (the root of this project).
6.  The extension "SME Website Consultant" should appear in your list.
7.  Visit any website and click the extension icon in the toolbar to run the audit.

## 🛠️ How It Works (Technical Architecture)

This extension operates entirely locally within your browser. It does not send data to any server or use external AI APIs.

### 1. Manifest V3 & Permissions
*   **`manifest_version: 3`**: Uses the latest Chrome extension standard.
*   **`activeTab`**: Grants permission to access the *current* page only when the user clicks the extension icon. This ensures privacy by default.
*   **`scripting`**: Allows the extension to inject the analysis logic (`rules.js`) and UI (`content.js`) into the page dynamically.

### 2. The Background Script (`src/background.js`)
The background service worker listens for the extension icon click (`chrome.action.onClicked`). When clicked, it programmatically injects the `rules.js` and `content.js` files into the active tab. It does *not* inject CSS globally to prevent breaking the website's layout.

### 3. The Content Script & UI (`src/content.js`)
This script acts as the orchestrator:
*   **Shadow DOM**: It creates a generic `<div>` host and attaches a **Shadow Root** (`attachShadow({mode: 'open'})`). The sidebar UI is rendered inside this shadow root. This ensures that:
    *   The extension's styles (`src/styles.css`) do not leak out and affect the website.
    *   The website's global styles do not bleed in and break the extension UI.
*   **Orchestration**: It calls the Rule Engine to analyze the page and then generates the HTML for the sidebar based on the results.
*   **Highlighting**: When a user clicks "Highlight", the script scrolls the target element into view and overlays a semi-transparent red box. This overlay is added to the main DOM (since it needs to be over the page content) using inline styles.

### 4. The Rule Engine (`src/rules.js`)
The core logic resides here. It is a collection of deterministic heuristic rules that inspect the DOM. It is **not** AI; it is a set of "smart checks" written in JavaScript.

#### Analysis Categories & Logic

*   **1. Message Clarity**
    *   **Headline Check**: Looks for an `<h1>` tag. Flags it if missing, or if it contains generic text like "Welcome" or "Home".
    *   **Length Check**: Flags headlines longer than 14 words.
    *   **Content Density**: Checks the first 300 characters of the `<body>` text. If it's too short (< 50 chars), it warns that the page might be empty or purely visual.

*   **2. Conversion (CTA)**
    *   **Visibility**: Scans for buttons/links with keywords ("contact", "quote", "buy", etc.). It checks their `getBoundingClientRect()` to ensure at least one is visible in the top 800px (Above the Fold).
    *   **Competition**: Warns if there are more than 3 distinct CTAs visible in the top section, which can cause "analysis paralysis".
    *   **Label Clarity**: Flags vague button text like "Submit" or "Click Here".

*   **3. Contact Accessibility**
    *   **Header Check**: Scans the `<header>` element for phone number patterns (`\d{3}...`) or email addresses. Also looks for `mailto:` or `tel:` links.
    *   **Fallback**: If no header is found, it performs a broad check on the top of the page.

*   **4. Form Friction**
    *   **Length**: Counts required fields in `<form>` elements. If > 4, it flags a friction issue.
    *   **Phone Mandates**: Detects if a phone number field has the `required` attribute.
    *   **Privacy**: Checks near the form for words like "privacy" or "spam" to ensure trust reassurance is present.

*   **5. Trust Signals**
    *   **Keywords**: Scans the page text for words like "testimonial", "review", "certified", "warranty". If none are found, it suggests adding social proof.

*   **6. Mobile Readiness**
    *   **Viewport Tag**: Checks for `<meta name="viewport">` in the `<head>`, crucial for mobile scaling.
    *   **Touch Targets**: Checks the computed size of links/buttons. If `< 44px`, it flags them as too small for fingers.
    *   **Horizontal Overflow**: Checks if `document.documentElement.scrollWidth` > `clientWidth`, indicating broken responsiveness.
    *   **Fixed Elements**: Detects large sticky headers/banners that cover > 20% of the screen, which harms mobile UX.

## 📂 Project Structure

```
.
├── manifest.json       # Extension configuration
├── src/
│   ├── background.js   # Service worker (handles clicks)
│   ├── content.js      # UI rendering & Orchestration
│   ├── rules.js        # Logic engine & Heuristics
│   ├── styles.css      # Sidebar styling (in Shadow DOM)
│   └── icons/          # Extension icons
└── README.md           # Documentation
```
