// Rule Engine for SME Website Consultant

window.SME_Rules = [
  // --- EXISTING CATEGORIES ---

  // 1. Message Clarity
  {
    id: "CLARITY_H1_MISSING",
    category: "Message Clarity",
    severity: "Critical",
    run: (document) => {
      const h1 = document.querySelector("h1");
      if (!h1) {
        return {
          title: "Headline is missing",
          message: "Visitors need to know immediately what this page is about.",
          fix: "Add a clear <h1> headline at the top of the page.",
          selector: "body"
        };
      }
      return null;
    }
  },
  {
    id: "CLARITY_H1_GENERIC",
    category: "Message Clarity",
    severity: "Improve",
    run: (document) => {
      const h1 = document.querySelector("h1");
      if (!h1) return null;
      const text = h1.textContent.trim().toLowerCase();
      const genericTerms = ["welcome", "home", "homepage", "index"];
      if (genericTerms.includes(text)) {
        return {
          title: "Headline is too generic",
          message: `The headline "${h1.textContent}" doesn't explain what you do.`,
          fix: "Rewrite the headline to describe your main benefit or service.",
          selector: h1
        };
      }
      return null;
    }
  },
  {
    id: "CLARITY_H1_LENGTH",
    category: "Message Clarity",
    severity: "Improve",
    run: (document) => {
      const h1 = document.querySelector("h1");
      if (!h1) return null;
      const wordCount = h1.textContent.trim().split(/\s+/).length;
      if (wordCount > 14) {
        return {
          title: "Headline is too long",
          message: "Long headlines are hard to read quickly.",
          fix: `Shorten your headline to under 14 words (currently ${wordCount}).`,
          selector: h1
        };
      }
      return null;
    }
  },
  {
    id: "CLARITY_ABOVE_FOLD",
    category: "Message Clarity",
    severity: "Critical",
    run: (document) => {
      const bodyText = document.body.innerText.substring(0, 300).toLowerCase();
      if (bodyText.length < 50) {
        return {
          title: "Above-the-fold content is sparse",
          message: "Visitors might not understand what you offer immediately.",
          fix: "Ensure the top section clearly explains your business.",
          selector: "body"
        };
      }
      return null;
    }
  },

  // 2. Conversion (CTA)
  {
    id: "CTA_MISSING_ABOVE_FOLD",
    category: "Conversion",
    severity: "Critical",
    run: (document) => {
        const keywords = ["contact", "quote", "book", "call", "whatsapp", "get started", "sign up", "buy now"];
        const links = Array.from(document.querySelectorAll("a, button, input[type='submit']"));
        const visibleCta = links.find(el => {
            if (el.offsetParent === null) return false;

            const rect = el.getBoundingClientRect();
            if (rect.top > 800 || rect.bottom < 0) return false;
            if (rect.width === 0 || rect.height === 0) return false;

            const text = (el.textContent || el.value || "").toLowerCase();
            return keywords.some(k => text.includes(k));
        });

        if (!visibleCta) {
            return {
                title: "Primary action is not visible immediately",
                message: "Visitors shouldn't have to scroll to find how to contact you or buy.",
                fix: "Place a clear 'Call' or 'Get Started' button in the top section.",
                selector: "body"
            };
        }
        return null;
    }
  },
  {
    id: "CTA_COMPETING",
    category: "Conversion",
    severity: "Improve",
    run: (document) => {
        const keywords = ["contact", "quote", "book", "call", "whatsapp", "get started", "sign up", "buy now"];
        const links = Array.from(document.querySelectorAll("a, button, input[type='submit']"));

        const visibleCtas = links.filter(el => {
            if (el.offsetParent === null) return false;
            const rect = el.getBoundingClientRect();
            if (rect.top > 800 || rect.bottom < 0) return false;
            if (rect.width === 0 || rect.height === 0) return false;
            const text = (el.textContent || el.value || "").toLowerCase();
            return keywords.some(k => text.includes(k));
        });

        if (visibleCtas.length > 3) {
             return {
                title: "Too many competing actions",
                message: "Having too many options confuses visitors.",
                fix: "Focus on one primary Call-to-Action above the fold.",
                selector: visibleCtas[0].parentElement || "body"
             };
        }
        return null;
    }
  },
  {
      id: "CTA_VAGUE",
      category: "Conversion",
      severity: "Improve",
      run: (document) => {
          const vagueTerms = ["submit", "click here", "more", "go", "click"];
          const buttons = Array.from(document.querySelectorAll("button, a.btn, a.button, input[type='submit']"));
          const vagueButton = buttons.find(el => {
               const text = (el.textContent || el.value || "").trim().toLowerCase();
               return vagueTerms.includes(text);
          });

          if (vagueButton) {
              return {
                  title: "Vague Call-to-Action label",
                  message: `"${vagueButton.textContent || vagueButton.value}" doesn't tell visitors what will happen.`,
                  fix: "Use action-oriented text like 'Get a Quote' or 'Send Message'.",
                  selector: vagueButton
              };
          }
          return null;
      }
  },

  // 3. Contact Accessibility
  {
      id: "CONTACT_HIDDEN",
      category: "Contact Accessibility",
      severity: "Critical",
      run: (document) => {
          const contactRegex = /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
          const header = document.querySelector("header") || document.querySelector("div[class*='header']");

          let foundInHeader = false;
          if (header && contactRegex.test(header.textContent)) foundInHeader = true;

          if (!foundInHeader && header) {
              foundInHeader = !!header.querySelector("a[href^='mailto:'], a[href^='tel:']");
          }

          if (!foundInHeader) {
               return {
                   title: "Contact info missing from header",
                   message: "Make it easy to contact you from any page.",
                   fix: "Add your phone number or email to the website header.",
                   selector: header || "body"
               };
          }
          return null;
      }
  },

  // 4. Form Friction
  {
      id: "FORM_LENGTH",
      category: "Form Friction",
      severity: "Improve",
      run: (document) => {
          const forms = document.querySelectorAll("form");
          for (const form of forms) {
              const inputs = form.querySelectorAll("input:not([type='hidden']), textarea, select");
              let requiredCount = 0;
              for (const input of inputs) {
                  if (input.hasAttribute("required")) requiredCount++;
              }

              if (requiredCount > 4) {
                  return {
                      title: "Form has too many required fields",
                      message: `You have ${requiredCount} required fields. Each extra field lowers conversion.`,
                      fix: "Remove non-essential fields or make them optional.",
                      selector: form
                  };
              }
          }
          return null;
      }
  },
  {
      id: "FORM_PHONE_MANDATORY",
      category: "Form Friction",
      severity: "Improve",
      run: (document) => {
          const forms = document.querySelectorAll("form");
          for (const form of forms) {
              const phoneInput = form.querySelector("input[type='tel'], input[name*='phone'], input[id*='phone']");
              if (phoneInput && phoneInput.hasAttribute("required")) {
                  return {
                      title: "Phone number is mandatory",
                      message: "Asking for a phone number reduces submissions by up to 50%.",
                      fix: "Make the phone number field optional if possible.",
                      selector: phoneInput
                  };
              }
          }
          return null;
      }
  },
  {
      id: "FORM_PRIVACY_MISSING",
      category: "Form Friction",
      severity: "Improve",
      run: (document) => {
          const forms = document.querySelectorAll("form");
          if (forms.length > 0) {
              const form = forms[0];
              const formText = form.innerText.toLowerCase();
              const hasPrivacy = formText.includes("privacy") || formText.includes("spam");

              if (!hasPrivacy) {
                  return {
                      title: "Missing privacy reassurance",
                      message: "Visitors hesitate to give data without privacy assurance.",
                      fix: "Add a short note: 'We respect your privacy' near the submit button.",
                      selector: form
                  };
              }
          }
          return null;
      }
  },

  // 5. Trust Signals
  {
      id: "TRUST_MISSING",
      category: "Trust Signals",
      severity: "Improve",
      run: (document) => {
          const text = document.body.innerText.toLowerCase();
          const trustKeywords = ["testimonial", "review", "client", "guarantee", "warranty", "certified", "award"];
          const hasTrust = trustKeywords.some(k => text.includes(k));

          if (!hasTrust) {
              return {
                  title: "Missing trust signals",
                  message: "New visitors need proof you are reliable.",
                  fix: "Add testimonials, client logos, or guarantees.",
                  selector: "body"
              };
          }
          return null;
      }
  },

  // 6. Mobile Readiness
  {
      id: "MOBILE_VIEWPORT_MISSING",
      category: "Mobile Readiness",
      severity: "Critical",
      run: (document) => {
          const meta = document.querySelector('meta[name="viewport"]');
          if (!meta) {
               return {
                   title: "Mobile viewport tag missing",
                   message: "Your site will not scale correctly on mobile devices.",
                   fix: "Add <meta name='viewport' content='width=device-width, initial-scale=1'> to the head.",
                   selector: "head"
               };
          }
          return null;
      }
  },
  {
      id: "MOBILE_SMALL_TARGETS",
      category: "Mobile Readiness",
      severity: "Improve",
      run: (document) => {
          const links = document.querySelectorAll("a, button");
          for (const link of links) {
               const rect = link.getBoundingClientRect();
               if (rect.width === 0 || rect.height === 0) continue;

               if (rect.width < 44 || rect.height < 44) {
                   return {
                       title: "Touch targets are too small",
                       message: "Some links are hard to tap on mobile (checked against current size).",
                       fix: "Ensure buttons and links are at least 44x44 pixels.",
                       selector: link
                   };
               }
          }
          return null;
      }
  },
  {
      id: "MOBILE_HORIZONTAL_OVERFLOW",
      category: "Mobile Readiness",
      severity: "Critical",
      run: (document) => {
          if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 20) {
              return {
                  title: "Horizontal overflow detected",
                  message: "The page requires horizontal scrolling, which breaks mobile layout.",
                  fix: "Check for fixed-width elements that overflow the viewport.",
                  selector: "body"
              };
          }
          return null;
      }
  },
  {
      id: "MOBILE_FIXED_BLOCKING",
      category: "Mobile Readiness",
      severity: "Improve",
      run: (document) => {
          const candidates = document.querySelectorAll("header, footer, nav, aside, div, section");

          for (const el of candidates) {
              const style = window.getComputedStyle(el);
              if (style.position === "fixed") {
                  const rect = el.getBoundingClientRect();
                  if (rect.height > 150 && rect.width > window.innerWidth * 0.8) {
                      return {
                          title: "Fixed element blocking content",
                          message: "Large fixed headers or banners reduce reading space on mobile.",
                          fix: "Reduce the size of sticky elements.",
                          selector: el
                      };
                  }
              }
          }
          return null;
      }
  },

  // --- NEW CATEGORIES ---

  // 7. Security & Technical
  {
      id: "SEC_HTTPS_MISSING",
      category: "Security",
      severity: "Critical",
      run: (document) => {
          if (window.location.protocol !== "https:") {
              return {
                  title: "Site is not secure (Not HTTPS)",
                  message: "Security is non-negotiable for trust and SEO.",
                  fix: "Enable HTTPS (SSL) on your server immediately.",
                  selector: "body"
              };
          }
          return null;
      }
  },
  {
      id: "SEC_UNSAFE_FORM",
      category: "Security",
      severity: "Critical",
      run: (document) => {
          const unsafeForms = Array.from(document.querySelectorAll("form")).find(f => {
              const hasPassword = f.querySelector("input[type='password']");
              return hasPassword && f.getAttribute("method")?.toLowerCase() === "get";
          });

          if (unsafeForms) {
              return {
                  title: "Form exposes sensitive data",
                  message: "Forms with 'method=GET' expose passwords in the URL.",
                  fix: "Change the form method to 'POST'.",
                  selector: unsafeForms
              };
          }
          return null;
      }
  },
  {
      id: "SEC_PLAINTEXT_PASS",
      category: "Security",
      severity: "Critical",
      run: (document) => {
          // Check for inputs named 'password' that are type 'text'
          const badInput = document.querySelector("input[name*='password'][type='text']");
          if (badInput) {
               return {
                   title: "Password field is not masked",
                   message: "Passwords should be hidden as asterisks.",
                   fix: "Change input type from 'text' to 'password'.",
                   selector: badInput
               };
          }
          return null;
      }
  },

  // 8. Page Performance
  {
      id: "PERF_BROKEN_IMAGES",
      category: "Performance",
      severity: "Improve",
      run: (document) => {
          const images = document.querySelectorAll("img");
          for (const img of images) {
              // Heuristic: check if loaded but 0 width
              if (img.complete && img.naturalWidth === 0) {
                  return {
                      title: "Broken image detected",
                      message: "Broken images make the site look unprofessional.",
                      fix: "Fix or remove the broken image link.",
                      selector: img
                  };
              }
          }
          return null;
      }
  },

  // 9. SEO Essentials
  {
      id: "SEO_TITLE_MISSING",
      category: "SEO",
      severity: "Critical",
      run: (document) => {
          if (!document.title || document.title.trim() === "") {
              return {
                  title: "Page title is missing",
                  message: "Search engines rely on page titles to understand your content.",
                  fix: "Add a descriptive <title> tag to the head.",
                  selector: "head"
              };
          }
          return null;
      }
  },
  {
      id: "SEO_META_DESC_MISSING",
      category: "SEO",
      severity: "Improve",
      run: (document) => {
          const meta = document.querySelector('meta[name="description"]');
          if (!meta || !meta.content.trim()) {
               return {
                   title: "Meta description is missing",
                   message: "Meta descriptions improve click-through rates from search results.",
                   fix: "Add a <meta name='description'> tag.",
                   selector: "head"
               };
          }
          return null;
      }
  },

  // 10. Accessibility
  {
      id: "A11Y_ALT_MISSING",
      category: "Accessibility",
      severity: "Improve",
      run: (document) => {
          const img = document.querySelector("img:not([alt])");
          if (img) {
              return {
                  title: "Images missing alt text",
                  message: "Alt text is required for screen readers and SEO.",
                  fix: "Add descriptive 'alt' attributes to all images.",
                  selector: img
              };
          }
          return null;
      }
  },
  {
      id: "A11Y_EMPTY_LINK",
      category: "Accessibility",
      severity: "Improve",
      run: (document) => {
          // Check for links with empty href or # that have no role="button" logic usually
          const link = Array.from(document.querySelectorAll("a")).find(a => {
              const href = a.getAttribute("href");
              return !href || href === "#" || href.trim() === "";
          });

          if (link) {
              return {
                  title: "Empty or broken link found",
                  message: "Links with empty hrefs confuse users and screen readers.",
                  fix: "Ensure all links point to a valid URL or ID.",
                  selector: link
              };
          }
          return null;
      }
  },
  {
      id: "A11Y_LABEL_MISSING",
      category: "Accessibility",
      severity: "Improve",
      run: (document) => {
          const input = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit'])")).find(i => {
              if (i.id) {
                  return !document.querySelector(`label[for='${i.id}']`);
              }
              // Check if wrapped in label
              return !i.closest("label") && !i.getAttribute("aria-label");
          });

          if (input) {
              return {
                  title: "Form input missing label",
                  message: "Inputs need labels for accessibility.",
                  fix: "Add a <label> element associated with this input.",
                  selector: input
              };
          }
          return null;
      }
  },

  // 11. Content Accuracy
  {
      id: "CONTENT_OLD_YEAR",
      category: "Content",
      severity: "Optional",
      run: (document) => {
          const currentYear = new Date().getFullYear();
          const footer = document.querySelector("footer") || document.body;
          const text = footer.innerText;
          // Look for "201X" or "2020-2023" type patterns where the last year is < currentYear - 1
          // Simple check: does it contain a year from 2010 to currentYear - 2?
          const oldYears = [];
          for (let y = 2010; y < currentYear - 1; y++) {
              oldYears.push(y.toString());
          }

          const foundOld = oldYears.find(y => text.includes(y) && !text.includes(currentYear.toString()));

          if (foundOld) {
              return {
                  title: "Copyright year might be outdated",
                  message: `Found references to ${foundOld} but not ${currentYear}.`,
                  fix: "Update the copyright year in the footer.",
                  selector: "footer" || "body"
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
