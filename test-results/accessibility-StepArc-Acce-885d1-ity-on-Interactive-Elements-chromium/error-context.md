# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.js >> StepArc Accessibility (a11y) E2E Test Suite >> Keyboard Navigation — Focus Visibility on Interactive Elements
- Location: tests/accessibility.spec.js:160:3

# Error details

```
Error: 5 element(s) with invisible focus:
  - BUTTON[History tab]
  - BUTTON[Nutrition tab]
  - BUTTON[Training tab]
  - BUTTON[Logs tab]
  - TEXTAREA[TEXTAREA]

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 5
Received array:  [{"element": "BUTTON[History tab]", "outline": "rgb(113, 113, 122) none 3px"}, {"element": "BUTTON[Nutrition tab]", "outline": "rgb(113, 113, 122) none 3px"}, {"element": "BUTTON[Training tab]", "outline": "rgb(113, 113, 122) none 3px"}, {"element": "BUTTON[Logs tab]", "outline": "rgb(113, 113, 122) none 3px"}, {"element": "TEXTAREA[TEXTAREA]", "outline": "rgb(255, 255, 255) none 3px"}]
```

# Test source

```ts
  115 |   // ── TEST 2: Semantic Landmarks & Heading Hierarchy ────────────────────────
  116 |   test('Page Semantics — HTML Lang, Title, Headings & Landmarks', async ({ page }) => {
  117 |     await page.goto('/');
  118 |     await page.waitForSelector('header h1', { timeout: 8000 });
  119 | 
  120 |     // html[lang] must exist
  121 |     const lang = await page.getAttribute('html', 'lang');
  122 |     expect(lang, '⚠ <html> element must have a lang attribute').toBeTruthy();
  123 | 
  124 |     // <title> must be non-empty
  125 |     const title = await page.title();
  126 |     expect(title, '⚠ Page <title> must not be empty').not.toBe('');
  127 | 
  128 |     // Exactly one h1
  129 |     const h1Count = await page.locator('h1').count();
  130 |     expect(h1Count, '⚠ Page must have exactly one <h1>').toBe(1);
  131 | 
  132 |     // Heading levels must not skip (e.g. h1 → h3 without h2)
  133 |     const levels = await page.evaluate(() =>
  134 |       Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => parseInt(h.tagName[1]))
  135 |     );
  136 |     for (let i = 1; i < levels.length; i++) {
  137 |       expect(
  138 |         levels[i] - levels[i - 1],
  139 |         `Heading jumped from h${levels[i - 1]} to h${levels[i]} — skipped level`
  140 |       ).toBeLessThanOrEqual(1);
  141 |     }
  142 | 
  143 |     // Axe scan — structural/landmark rules only
  144 |     const results = await new AxeBuilder({ page })
  145 |       .withRules([
  146 |         'region', 'landmark-one-main', 'landmark-no-duplicate-banner',
  147 |         'landmark-no-duplicate-contentinfo', 'page-has-heading-one',
  148 |         'document-title', 'html-has-lang', 'html-lang-valid',
  149 |       ])
  150 |       .analyze();
  151 | 
  152 |     combinedReportContent += generateA11yReport('Page Semantics — Landmarks & Heading Hierarchy', results.violations);
  153 |     totalViolationsCount += results.violations.length;
  154 | 
  155 |     console.log('[DEBUG VIOLATIONS]', JSON.stringify(results.violations, null, 2));
  156 |     expect(results.violations.length, `${results.violations.length} landmark/semantic violation(s)`).toBe(0);
  157 |   });
  158 | 
  159 |   // ── TEST 3: Keyboard Navigation & Focus Visibility ────────────────────────
  160 |   test('Keyboard Navigation — Focus Visibility on Interactive Elements', async ({ page }) => {
  161 |     await page.goto('/');
  162 |     await page.waitForSelector('header h1', { timeout: 8000 });
  163 | 
  164 |     const focusIssues = [];
  165 | 
  166 |     // Tab through first 14 interactive elements and check each has a visible focus ring
  167 |     for (let i = 0; i < 14; i++) {
  168 |       await page.keyboard.press('Tab');
  169 | 
  170 |       const info = await page.evaluate(() => {
  171 |         const el = document.activeElement;
  172 |         if (!el || el.tagName === 'BODY') return null;
  173 |         const style = window.getComputedStyle(el);
  174 |         const rect = el.getBoundingClientRect();
  175 |         const hasOutline = parseFloat(style.outlineWidth) > 0 && style.outlineStyle !== 'none';
  176 |         const hasBoxShadow = style.boxShadow !== 'none' && style.boxShadow !== '';
  177 |         return {
  178 |           tag: el.tagName,
  179 |           ariaLabel: el.getAttribute('aria-label'),
  180 |           text: el.textContent?.trim().slice(0, 40),
  181 |           hasFocusIndicator: hasOutline || hasBoxShadow,
  182 |           outline: style.outline,
  183 |           visible: rect.width > 0 && rect.height > 0,
  184 |         };
  185 |       });
  186 | 
  187 |       if (!info) break;
  188 |       if (info.visible && !info.hasFocusIndicator) {
  189 |         const label = info.ariaLabel || info.text || info.tag;
  190 |         focusIssues.push({
  191 |           element: `${info.tag}[${label}]`,
  192 |           outline: info.outline,
  193 |         });
  194 |       }
  195 |     }
  196 | 
  197 |     const violations = focusIssues.map((issue) => ({
  198 |       id: 'focus-visible',
  199 |       help: 'Component must have a visible focus indicator',
  200 |       impact: 'serious',
  201 |       tags: ['wcag2aa', 'wcag21aa'],
  202 |       description: `${issue.element} receives keyboard focus but has no visible outline or box-shadow.`,
  203 |       helpUrl: 'https://dequeuniversity.com/rules/axe/4.x/focus-visible',
  204 |       nodes: [{
  205 |         html: `<${issue.element.split('[')[0].toLowerCase()}>...</${issue.element.split('[')[0].toLowerCase()}>`,
  206 |         target: [issue.element],
  207 |         failureSummary: `Add :focus-visible { outline: 2px solid var(--gold-500); outline-offset: 2px; } to remove the invisible focus state. Computed outline: "${issue.outline}".`,
  208 |       }],
  209 |     }));
  210 | 
  211 |     combinedReportContent += generateA11yReport('Keyboard Navigation — Focus Visibility', violations);
  212 |     totalViolationsCount += violations.length;
  213 | 
  214 |     expect(focusIssues, `${focusIssues.length} element(s) with invisible focus:\n${focusIssues.map(i => `  - ${i.element}`).join('\n')}`)
> 215 |       .toHaveLength(0);
      |        ^ Error: 5 element(s) with invisible focus:
  216 |   });
  217 | 
  218 |   // ── TEST 4: Tab Bar — Keyboard Accessibility ──────────────────────────────
  219 |   test('Tab Bar — Keyboard Accessibility (div vs button)', async ({ page }) => {
  220 |     await page.goto('/');
  221 |     await page.waitForSelector('header h1', { timeout: 8000 });
  222 | 
  223 |     // TabBar renders <div style="cursor:pointer"> items — check if they are keyboard focusable
  224 |     const tabAudit = await page.evaluate(() =>
  225 |       Array.from(document.querySelectorAll('div[style*="cursor: pointer"]')).map(el => ({
  226 |         tag: el.tagName,
  227 |         tabIndex: el.tabIndex,
  228 |         role: el.getAttribute('role'),
  229 |         text: el.textContent?.trim().slice(0, 25),
  230 |         focusable: el.tabIndex >= 0,
  231 |       }))
  232 |     );
  233 | 
  234 |     const nonFocusable = tabAudit.filter(el => !el.focusable);
  235 | 
  236 |     const violations = nonFocusable.length > 0 ? [{
  237 |       id: 'keyboard',
  238 |       help: 'Interactive tab items must be keyboard accessible',
  239 |       impact: 'critical',
  240 |       tags: ['wcag2a', 'wcag21a'],
  241 |       description: `${nonFocusable.length} tab bar item(s) use <div> elements with only an onClick handler. ` +
  242 |         'Divs are not natively focusable and are completely invisible to keyboard-only users.',
  243 |       helpUrl: 'https://dequeuniversity.com/rules/axe/4.x/keyboard',
  244 |       nodes: nonFocusable.map(el => ({
  245 |         html: `<div style="cursor:pointer">${el.text}</div>`,
  246 |         target: [`div:has-text("${el.text}")`],
  247 |         failureSummary: `In TabBar.jsx replace the outer <div onClick> with <button role="tab" tabIndex={0}>, ` +
  248 |           `or add tabIndex={0} role="tab" and onKeyDown={e => (e.key==='Enter'||e.key===' ') && handleTabClick(id)}.`,
  249 |       })),
  250 |     }] : [];
  251 | 
  252 |     combinedReportContent += generateA11yReport('Tab Bar — Keyboard Accessibility', violations);
  253 |     totalViolationsCount += violations.length;
  254 | 
  255 |     expect(violations.length,
  256 |       'Tab bar items are not keyboard accessible. Replace <div> with <button role="tab"> or add tabIndex="0" + onKeyDown.')
  257 |       .toBe(0);
  258 |   });
  259 | 
  260 |   // ── TEST 5: Profile Modal — Dialog Semantics & Escape Key ─────────────────
  261 |   test('Profile Modal — Dialog Semantics & Escape Key Handling', async ({ page }) => {
  262 |     await page.goto('/');
  263 |     await page.waitForSelector('header h1', { timeout: 8000 });
  264 | 
  265 |     const violations = [];
  266 | 
  267 |     // Open the modal
  268 |     await page.click('header div button');
  269 |     await page.waitForSelector('text=Edit Profile', { timeout: 3000 });
  270 |     await page.click('text=Edit Profile');
  271 |     await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });
  272 | 
  273 |     // Check role="dialog" / aria-modal
  274 |     const dialogCheck = await page.evaluate(() => ({
  275 |       hasDialogRole: !!document.querySelector('[role="dialog"]'),
  276 |       hasAriaModal: !!document.querySelector('[aria-modal="true"]'),
  277 |       hasAriaLabel: !!(
  278 |         document.querySelector('[role="dialog"][aria-label]') ||
  279 |         document.querySelector('[role="dialog"][aria-labelledby]')
  280 |       ),
  281 |     }));
  282 | 
  283 |     if (!dialogCheck.hasDialogRole && !dialogCheck.hasAriaModal) {
  284 |       violations.push({
  285 |         id: 'dialog-name',
  286 |         help: 'Modal must have role="dialog" and aria-modal="true"',
  287 |         impact: 'critical',
  288 |         tags: ['wcag2a', 'wcag21a'],
  289 |         description: 'The Profile Settings modal is missing role="dialog" and aria-modal="true". ' +
  290 |           'Screen readers cannot identify it as a modal, so users may not understand their navigation context is constrained.',
  291 |         helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
  292 |         nodes: [{
  293 |           html: '<div>Profile modal wrapper</div>',
  294 |           target: ['div:has-text("MY PROFILE")'],
  295 |           failureSummary: 'In UserProfileModal.jsx, add role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" to the outermost container div.',
  296 |         }],
  297 |       });
  298 |     } else if (dialogCheck.hasDialogRole && !dialogCheck.hasAriaLabel) {
  299 |       violations.push({
  300 |         id: 'dialog-name',
  301 |         help: 'Dialog must have an accessible name via aria-label or aria-labelledby',
  302 |         impact: 'serious',
  303 |         tags: ['wcag2a', 'wcag21a'],
  304 |         description: 'The dialog element exists but lacks aria-label or aria-labelledby. Screen readers will not announce a meaningful name when the modal opens.',
  305 |         helpUrl: 'https://dequeuniversity.com/rules/axe/4.x/dialog-name',
  306 |         nodes: [{
  307 |           html: '<div role="dialog">...</div>',
  308 |           target: ['[role="dialog"]'],
  309 |           failureSummary: 'Add aria-labelledby="profile-modal-title" on the dialog and id="profile-modal-title" on the "MY PROFILE" heading.',
  310 |         }],
  311 |       });
  312 |     }
  313 | 
  314 |     // Check Escape key closes the modal
  315 |     await page.keyboard.press('Escape');
```