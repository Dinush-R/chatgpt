// Rule Engine for SME Website Consultant

// Categories
const CAT_CORE = "Core Functionality";
const CAT_PERF = "Page Speed & Performance";
const CAT_MOBILE = "Mobile Usability";
const CAT_SEC = "Security & Trust";
const CAT_A11Y = "Accessibility";
const CAT_CONTENT = "Content & Branding Accuracy";
const CAT_COMPAT = "Browser Compatibility";
const CAT_ERROR = "Error Handling & Reliability";
const CAT_SEO = "SEO Essentials";
const CAT_ANALYTICS = "Analytics & Cookies";

window.SME_Rules = [
  // 1. Core Functionality (Must Pass)
  {
      id: "CORE_LINKS_BROKEN",
      category: CAT_CORE,
      severity: "Critical",
      run: (document) => {
          // Heuristic: Check for empty hrefs or # links that aren't buttons
          const brokenLinks = Array.from(document.querySelectorAll("a")).filter(a => {
              const href = a.getAttribute("href");
              return !href || (href === "#" && !a.getAttribute("onclick") && !a.getAttribute("role"));
          });

          if (brokenLinks.length > 0) {
              return {
                  title: "Broken or empty links detected",
                  message: `Found ${brokenLinks.length} links that may not work.`,
                  fix: "Ensure all links point to valid pages.",
                  devFix: "Check <a> tags with empty hrefs or '#'. Use <button> for actions.",
                  selector: brokenLinks[0]
              };
          }
          return null;
      }
  },
  {
      id: "CORE_JS_ERRORS",
      category: CAT_CORE,
      severity: "Critical",
      run: (document) => {
          // Cannot detect console errors from content script easily.
          // This is a placeholder for manual check recommendation.
          return {
              title: "Verify page loads without errors",
              message: "Open Developer Tools (F12) to check for red error messages in Console.",
              fix: "Ask your developer to fix any JavaScript errors.",
              devFix: "Check browser console for exceptions.",
              selector: "body",
              type: "manual"
          };
      }
  },
  {
      id: "CORE_FORMS_SUBMIT",
      category: CAT_CORE,
      severity: "Critical",
      run: (document) => {
          if (document.querySelector("form")) {
              return {
                  title: "Test form submission",
                  message: "Manually submit all forms to ensure they work.",
                  fix: "Fill out the contact form and check if you receive the email.",
                  devFix: "Verify backend form handling and SMTP settings.",
                  selector: document.querySelector("form"),
                  type: "manual"
              };
          }
          return null;
      }
  },

  // 2. Page Speed & Performance (Must Pass)
  {
      id: "PERF_LOAD_TIME",
      category: CAT_PERF,
      severity: "Critical",
      run: (document) => {
          if (window.performance) {
              const navEntry = performance.getEntriesByType("navigation")[0];
              if (navEntry && navEntry.loadEventEnd > 0) {
                  const loadTime = (navEntry.loadEventEnd - navEntry.startTime) / 1000;
                  if (loadTime > 3) {
                      return {
                          title: "Page load time is slow",
                          message: `Page took ${loadTime.toFixed(1)}s to load (Target: ≤ 3s).`,
                          fix: "Optimize images and reduce plugins.",
                          devFix: "Minimize JS/CSS, use caching, optimize assets.",
                          selector: "body"
                      };
                  }
              }
          }
          return null;
      }
  },
  {
      id: "PERF_BROKEN_IMAGES",
      category: CAT_PERF,
      severity: "Critical",
      run: (document) => {
          const images = document.querySelectorAll("img");
          for (const img of images) {
              if (img.complete && img.naturalWidth === 0) {
                  return {
                      title: "Broken image detected",
                      message: "An image failed to load.",
                      fix: "Replace or remove the broken image.",
                      devFix: "Check image src URL and server availability.",
                      selector: img
                  };
              }
          }
          return null;
      }
  },

  // 3. Mobile Usability (Must Pass)
  {
      id: "MOBILE_VIEWPORT",
      category: CAT_MOBILE,
      severity: "Critical",
      run: (document) => {
          const meta = document.querySelector('meta[name="viewport"]');
          if (!meta) {
               return {
                   title: "Mobile viewport tag missing",
                   message: "Site will look tiny on mobile phones.",
                   fix: "Add the viewport meta tag.",
                   devFix: "Add <meta name='viewport' content='width=device-width, initial-scale=1'>.",
                   selector: "head"
               };
          }
          return null;
      }
  },
  {
      id: "MOBILE_HORIZONTAL_SCROLL",
      category: CAT_MOBILE,
      severity: "Critical",
      run: (document) => {
          if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 20) {
              return {
                  title: "Horizontal scrolling detected",
                  message: "Content spills off the side of the screen on mobile.",
                  fix: "Make sure all elements fit within the screen width.",
                  devFix: "Check for fixed widths > 100vw or negative margins.",
                  selector: "body"
              };
          }
          return null;
      }
  },
  {
      id: "MOBILE_TAP_TARGETS",
      category: CAT_MOBILE,
      severity: "Improve",
      run: (document) => {
          const links = document.querySelectorAll("a, button");
          for (const link of links) {
               const rect = link.getBoundingClientRect();
               if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
                   return {
                       title: "Clickable areas too small",
                       message: "Buttons/Links should be easy to tap.",
                       fix: "Make buttons larger (at least 44x44 pixels).",
                       devFix: "Increase padding or min-width/height.",
                       selector: link
                   };
               }
          }
          return null;
      }
  },

  // 4. Security & Trust (Must Pass)
  {
      id: "SEC_HTTPS",
      category: CAT_SEC,
      severity: "Critical",
      run: (document) => {
          if (window.location.protocol !== "https:") {
              return {
                  title: "Not using HTTPS",
                  message: "Site shows as 'Not Secure'.",
                  fix: "Enable HTTPS (SSL certificate).",
                  devFix: "Install SSL cert and force redirect HTTP to HTTPS.",
                  selector: "body"
              };
          }
          return null;
      }
  },
  {
      id: "SEC_UNSAFE_FORM",
      category: CAT_SEC,
      severity: "Critical",
      run: (document) => {
          const unsafeForms = Array.from(document.querySelectorAll("form")).find(f => {
              const hasPassword = f.querySelector("input[type='password']");
              return hasPassword && f.getAttribute("method")?.toLowerCase() === "get";
          });

          if (unsafeForms) {
              return {
                  title: "Password exposed in URL",
                  message: "Login forms must not use 'GET' method.",
                  fix: "Contact developer immediately.",
                  devFix: "Change form method to 'POST'.",
                  selector: unsafeForms
              };
          }
          return null;
      }
  },
  {
      id: "SEC_PLAINTEXT_PASS",
      category: CAT_SEC,
      severity: "Critical",
      run: (document) => {
          const badInput = document.querySelector("input[name*='password'][type='text']");
          if (badInput) {
               return {
                   title: "Password visible as text",
                   message: "Password field should mask characters.",
                   fix: "Make password input masked.",
                   devFix: "Change input type from 'text' to 'password'.",
                   selector: badInput
               };
          }
          return null;
      }
  },

  // 5. Accessibility (Basic, Non-Negotiable)
  {
      id: "A11Y_ALT_TEXT",
      category: CAT_A11Y,
      severity: "Improve",
      run: (document) => {
          const img = document.querySelector("img:not([alt])");
          if (img) {
              return {
                  title: "Images missing description",
                  message: "Blind users cannot understand this image.",
                  fix: "Add 'alt text' describing the image.",
                  devFix: "Add alt='Description' attribute to <img>.",
                  selector: img
              };
          }
          return null;
      }
  },
  {
      id: "A11Y_HEADING_ORDER",
      category: CAT_A11Y,
      severity: "Improve",
      run: (document) => {
          const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
          for (let i = 0; i < headings.length - 1; i++) {
              const current = parseInt(headings[i].tagName.substring(1));
              const next = parseInt(headings[i+1].tagName.substring(1));
              if (next > current + 1) {
                  return {
                      title: "Headings out of order",
                      message: `Skipped from H${current} to H${next}.`,
                      fix: "Use headings in order (H1 -> H2 -> H3).",
                      devFix: "Reorder heading tags to maintain hierarchy.",
                      selector: headings[i+1]
                  };
              }
          }
          return null;
      }
  },
  {
      id: "A11Y_FORM_LABELS",
      category: CAT_A11Y,
      severity: "Improve",
      run: (document) => {
          const input = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit'])")).find(i => {
              if (i.id && document.querySelector(`label[for='${i.id}']`)) return false;
              if (i.closest("label")) return false;
              if (i.getAttribute("aria-label")) return false;
              return true;
          });

          if (input) {
              return {
                  title: "Form field missing label",
                  message: "Screen readers won't know what this field is for.",
                  fix: "Add a visible label.",
                  devFix: "Associate <label> with input id or use aria-label.",
                  selector: input
              };
          }
          return null;
      }
  },

  // 6. Content & Branding Accuracy
  {
      id: "CONTENT_SPELLING",
      category: CAT_CONTENT,
      severity: "Improve",
      run: (document) => {
          return {
              title: "Check spelling and grammar",
              message: "Read through content for typos.",
              fix: "Proofread all pages.",
              devFix: "Use a spellchecker or linter on content.",
              selector: "body",
              type: "manual"
          };
      }
  },
  {
      id: "CONTENT_CONTACT_INFO",
      category: CAT_CONTENT,
      severity: "Improve",
      run: (document) => {
          const bodyText = document.body.innerText;
          const phoneRegex = /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/;
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

          if (!phoneRegex.test(bodyText) && !emailRegex.test(bodyText)) {
              return {
                  title: "Contact info difficult to find",
                  message: "No email or phone number detected on this page.",
                  fix: "Ensure contact details are visible.",
                  devFix: "Add mailto: or tel: links.",
                  selector: "footer" || "body"
              };
          }
          return null;
      }
  },

  // 7. Browser Compatibility (Basic)
  {
      id: "COMPAT_CHECK",
      category: CAT_COMPAT,
      severity: "Improve",
      run: (document) => {
          return {
              title: "Test on other browsers",
              message: "Open this site in Chrome, Safari, and Edge.",
              fix: "Visually verify layout.",
              devFix: "Use BrowserStack or similar for cross-browser testing.",
              selector: "body",
              type: "manual"
          };
      }
  },

  // 8. Error Handling & Reliability
  {
      id: "ERROR_404_CHECK",
      category: CAT_ERROR,
      severity: "Improve",
      run: (document) => {
           return {
              title: "Test 404 Page",
              message: "Type a random URL to see the error page.",
              fix: "Create a custom 404 page that guides users back.",
              devFix: "Configure server to serve a custom 404.html.",
              selector: "body",
              type: "manual"
          };
      }
  },

  // 9. SEO Essentials (Minimum)
  {
      id: "SEO_TITLE",
      category: CAT_SEO,
      severity: "Critical",
      run: (document) => {
          if (!document.title || document.title.trim() === "") {
              return {
                  title: "Page title is missing",
                  message: "Search engines need a title.",
                  fix: "Add a title tag.",
                  devFix: "Add <title>Page Name</title> in <head>.",
                  selector: "head"
              };
          }
          return null;
      }
  },
  {
      id: "SEO_META_DESC",
      category: CAT_SEO,
      severity: "Improve",
      run: (document) => {
          const meta = document.querySelector('meta[name="description"]');
          if (!meta || !meta.content.trim()) {
               return {
                   title: "Meta description is missing",
                   message: "Search result snippets will be empty.",
                   fix: "Add a description for search engines.",
                   devFix: "Add <meta name='description' content='...'>.",
                   selector: "head"
               };
          }
          return null;
      }
  },
  {
      id: "SEO_H1_MISSING",
      category: CAT_SEO,
      severity: "Improve",
      run: (document) => {
          if (!document.querySelector("h1")) {
              return {
                  title: "Main heading (H1) is missing",
                  message: "Each page needs one main H1 heading.",
                  fix: "Add a main headline.",
                  devFix: "Use <h1> for the primary page title.",
                  selector: "body"
              };
          }
          return null;
      }
  },

  // 10. Analytics & Cookies (If Applicable)
  {
      id: "ANALYTICS_CHECK",
      category: CAT_ANALYTICS,
      severity: "Optional",
      run: (document) => {
          const scripts = Array.from(document.querySelectorAll("script"));
          const hasAnalytics = scripts.some(s => {
              const src = (s.src || "").toLowerCase();
              const content = (s.innerText || "").toLowerCase();
              return src.includes("google-analytics") || src.includes("googletagmanager") || content.includes("gtag");
          });

          if (!hasAnalytics) {
              return {
                  title: "No Analytics detected",
                  message: "You can't track visitors without analytics.",
                  fix: "Install Google Analytics.",
                  devFix: "Add GA4 or GTM script to <head>.",
                  selector: "head"
              };
          }
          return null;
      }
  },
  {
      id: "COOKIE_BANNER",
      category: CAT_ANALYTICS,
      severity: "Optional",
      run: (document) => {
          const text = document.body.innerText.toLowerCase().substring(0, 5000); // Check first 5000 chars roughly? Or all text?
          // Actually banners might be at bottom.
          // Look for fixed elements with "cookie" text.
          const fixedEls = Array.from(document.querySelectorAll("div, section, aside")).filter(el => {
               const style = window.getComputedStyle(el);
               return style.position === "fixed" || style.position === "sticky";
          });

          const hasCookieMsg = fixedEls.some(el => el.innerText.toLowerCase().includes("cookie"));

          if (!hasCookieMsg) {
              return {
                  title: "Cookie consent banner missing",
                  message: "Required in many regions (GDPR/CCPA).",
                  fix: "Add a cookie consent banner.",
                  devFix: "Implement a consent management platform (CMP).",
                  selector: "body"
              };
          }
          return null;
      }
  }
];

window.SME_Analyzer = {
    analyze: function() {
        const issues = [];
        window.SME_Rules.forEach(rule => {
            try {
                const result = rule.run(document);
                if (result) {
                    issues.push({ ...result, ...rule, selectorElement: result.selector });
                }
            } catch (e) {
                console.error("Rule failed:", rule.id, e);
            }
        });
        return issues;
    }
};
