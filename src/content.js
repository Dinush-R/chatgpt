// Orchestrator for SME Website Consultant

(function() {
    const HOST_ID = "sme-consultant-host";

    // Check if already running
    if (document.getElementById(HOST_ID)) {
        // Toggle visibility or remove
        const host = document.getElementById(HOST_ID);
        if (host) {
            host.remove();
            clearHighlights();
        }
        return;
    }

    // Run Analysis
    const issues = window.SME_Analyzer.analyze();

    // Helper to sort by severity
    const severityOrder = { "Critical": 0, "Improve": 1, "Optional": 2 };

    // Group by category
    const groupedIssues = issues.reduce((acc, issue) => {
        if (!acc[issue.category]) {
            acc[issue.category] = [];
        }
        acc[issue.category].push(issue);
        return acc;
    }, {});

    // Sort issues within categories
    Object.keys(groupedIssues).forEach(category => {
        groupedIssues[category].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    });

    // Sort categories by highest severity issue
    const sortedCategories = Object.keys(groupedIssues).sort((catA, catB) => {
        const severityA = Math.min(...groupedIssues[catA].map(i => severityOrder[i.severity]));
        const severityB = Math.min(...groupedIssues[catB].map(i => severityOrder[i.severity]));
        return severityA - severityB;
    });

    // Create Sidebar UI
    const host = document.createElement("div");
    host.id = HOST_ID;
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    // Inject Styles
    const styleLink = document.createElement("link");
    styleLink.setAttribute("rel", "stylesheet");
    styleLink.setAttribute("href", chrome.runtime.getURL("src/styles.css"));
    shadow.appendChild(styleLink);

    // Build UI Content
    const container = document.createElement("div");
    container.className = "sidebar";

    let contentHtml = "";

    if (issues.length === 0) {
        contentHtml = `<div class="empty-state">No critical issues found! Great job.</div>`;
    } else {
        sortedCategories.forEach(category => {
            contentHtml += `<div class="category-group">
                <h3 class="category-title">${escapeHtml(category)}</h3>
                ${groupedIssues[category].map((issue) => {
                    // Find index in original flat list or keep a reference?
                    // Let's attach the data-id or something to find it.
                    // Actually, let's just use the issue ID to find it in the flat 'issues' array if needed,
                    // or better, store the issue object in a map.
                    // But for highlighting, I need to know which element.
                    // I'll serialize the issue into the DOM? No, security risk.
                    // I will just use a global map or look it up.
                    // Simpler: re-assign indices based on render order? No.
                    // Let's store the index from the main 'issues' array.
                    const originalIndex = issues.indexOf(issue);
                    return `
                    <div class="issue-card" data-index="${originalIndex}">
                        <div class="issue-header">
                            <span class="issue-title">${escapeHtml(issue.title)}</span>
                            <span class="badge badge-${issue.severity.toLowerCase()}">${issue.severity}</span>
                        </div>
                        <div class="issue-message">${escapeHtml(issue.message)}</div>
                        <div class="issue-fix">
                            <span class="fix-label">Suggestion</span>
                            ${escapeHtml(issue.fix)}
                        </div>
                        ${(issue.selectorElement && issue.selectorElement !== "body") ? `
                        <div class="actions">
                            <button class="highlight-btn" data-index="${originalIndex}">Highlight</button>
                        </div>
                        ` : ''}
                    </div>
                    `;
                }).join('')}
            </div>`;
        });
    }

    container.innerHTML = `
        <div class="header">
            <h2>Website Audit</h2>
            <button class="close-btn">&times;</button>
        </div>
        <div class="content">
            ${contentHtml}
        </div>
    `;

    shadow.appendChild(container);

    // Event Listeners
    shadow.querySelector(".close-btn").addEventListener("click", () => {
        host.remove();
        clearHighlights();
    });

    shadow.querySelectorAll(".highlight-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            const issue = issues[index];
            if (issue && issue.selectorElement) {
                highlightElement(issue.selectorElement);
            }
        });
    });

    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function clearHighlights() {
        document.querySelectorAll(".sme-highlight-overlay").forEach(el => el.remove());
    }

    function highlightElement(selectorOrElement) {
        clearHighlights();

        let element = null;
        if (typeof selectorOrElement === "string") {
            element = document.querySelector(selectorOrElement);
        } else if (selectorOrElement instanceof Element) {
            element = selectorOrElement;
        }

        if (element) {
            if (!document.body.contains(element)) return;

            element.scrollIntoView({ behavior: "smooth", block: "center" });

            const rect = element.getBoundingClientRect();
            const overlay = document.createElement("div");
            overlay.className = "sme-highlight-overlay";
            overlay.style.position = "absolute";
            overlay.style.border = "3px solid #e03131";
            overlay.style.backgroundColor = "rgba(224, 49, 49, 0.2)";
            overlay.style.zIndex = "2147483646";
            overlay.style.pointerEvents = "none";
            overlay.style.transition = "opacity 0.3s ease";

            overlay.style.top = (rect.top + window.scrollY) + "px";
            overlay.style.left = (rect.left + window.scrollX) + "px";
            overlay.style.width = rect.width + "px";
            overlay.style.height = rect.height + "px";

            document.body.appendChild(overlay);

            setTimeout(() => {
                overlay.style.opacity = "0";
                setTimeout(() => overlay.remove(), 300);
            }, 3000);
        } else {
            console.warn("Element not found for highlighting");
        }
    }

})();
