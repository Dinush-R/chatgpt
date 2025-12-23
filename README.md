# SME Website Consultant Chrome Extension

A privacy-focused, local-only Chrome Extension (Manifest V3) that audits webpages for small business best practices. It uses deterministic heuristics to provide a consultant-style report on Message Clarity, Conversion, Trust, Mobile Readiness, Security, SEO, and Accessibility.

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
*   **Shadow DOM**: It creates a generic `<div>` host and attaches a **Shadow Root** (`attachShadow({mode: 'open'})`). The sidebar UI is rendered inside this shadow root.
*   **Orchestration**: It calls the Rule Engine to analyze the page and then generates the HTML for the sidebar based on the results.
*   **Highlighting**: When a user clicks "Highlight", the script scrolls the target element into view and overlays a semi-transparent red box.

### 4. The Rule Engine (`src/rules.js`)
The core logic resides here. It is a collection of deterministic heuristic rules that inspect the DOM.

#### Analysis Categories & Logic

*   **1. Message Clarity**
    *   **Headline Check**: Missing or generic `<h1>`.
    *   **Length Check**: Headlines > 14 words.
    *   **Content Density**: Empty or sparse pages.

*   **2. Conversion (CTA)**
    *   **Visibility**: CTAs hidden below the fold.
    *   **Competition**: Too many competing CTAs.
    *   **Label Clarity**: Vague labels like "Submit".

*   **3. Contact Accessibility**
    *   **Header Check**: Missing phone/email in header.

*   **4. Form Friction**
    *   **Length**: Forms with > 4 required fields.
    *   **Phone Mandates**: Required phone number fields.
    *   **Privacy**: Missing privacy/spam reassurance.

*   **5. Trust Signals**
    *   **Keywords**: Missing testimonials, reviews, or guarantees.

*   **6. Mobile Readiness**
    *   **Viewport Tag**: Missing `<meta name="viewport">`.
    *   **Touch Targets**: Buttons/links < 44px.
    *   **Horizontal Overflow**: Content wider than screen.
    *   **Fixed Elements**: Large sticky headers covering content.

*   **7. Security**
    *   **HTTPS**: Flags non-secure HTTP pages.
    *   **Unsafe Forms**: Flags forms using `GET` method for passwords.
    *   **Passwords**: Flags password fields using `type="text"`.

*   **8. Performance**
    *   **Broken Images**: Detects images that failed to load (0 width).

*   **9. SEO Essentials**
    *   **Title**: Missing page title.
    *   **Meta Description**: Missing meta description.

*   **10. Accessibility**
    *   **Alt Text**: Images missing `alt` attributes.
    *   **Empty Links**: Links with empty or `#` hrefs.
    *   **Form Labels**: Inputs missing associated labels.

*   **11. Content Accuracy**
    *   **Outdated Year**: Detects old years in the footer (e.g., copyright 2020).

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
