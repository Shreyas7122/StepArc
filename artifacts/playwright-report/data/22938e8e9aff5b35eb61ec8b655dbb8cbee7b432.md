# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.js >> StepArc Accessibility (a11y) E2E Test Suite >> Page Semantics — HTML Lang, Title, Headings & Landmarks
- Location: tests/accessibility.spec.js:116:3

# Error details

```
Error: 1 landmark/semantic violation(s)

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Test source

```ts
  56  | 
  57  |     // Dashboard
  58  |     console.log('[StepArc E2E] Auditing Dashboard Tab...');
  59  |     const dashboardResults = await new AxeBuilder({ page })
  60  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  61  |       .analyze();
  62  |     combinedReportContent += generateA11yReport('Dashboard Tab (Main View)', dashboardResults.violations);
  63  |     totalViolationsCount += dashboardResults.violations.length;
  64  | 
  65  |     // Food / Nutrition
  66  |     console.log('[StepArc E2E] Navigating to Food Tab...');
  67  |     await page.click('text=Nutrition');
  68  |     await page.waitForSelector('text=01 · QUICK LOG', { timeout: 3000 });
  69  |     const foodResults = await new AxeBuilder({ page })
  70  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  71  |       .analyze();
  72  |     combinedReportContent += generateA11yReport('Food Tab (Nutrition)', foodResults.violations);
  73  |     totalViolationsCount += foodResults.violations.length;
  74  | 
  75  |     // Workout / Training
  76  |     console.log('[StepArc E2E] Navigating to Workout Tab...');
  77  |     await page.click('text=Training');
  78  |     await page.waitForSelector('text=Gym Routine', { timeout: 3000 });
  79  |     const workoutResults = await new AxeBuilder({ page })
  80  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  81  |       .analyze();
  82  |     combinedReportContent += generateA11yReport('Workout Tab (Training)', workoutResults.violations);
  83  |     totalViolationsCount += workoutResults.violations.length;
  84  | 
  85  |     // Logs
  86  |     console.log('[StepArc E2E] Navigating to Logs Tab...');
  87  |     await page.click('text=Logs');
  88  |     await page.waitForSelector('text=Food Log', { timeout: 3000 });
  89  |     const logsResults = await new AxeBuilder({ page })
  90  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  91  |       .analyze();
  92  |     combinedReportContent += generateA11yReport('Daily Logs List Tab', logsResults.violations);
  93  |     totalViolationsCount += logsResults.violations.length;
  94  | 
  95  |     // Profile modal
  96  |     console.log('[StepArc E2E] Opening Profile Settings Modal...');
  97  |     await page.click('header div button');
  98  |     await page.waitForSelector('text=Edit Profile', { timeout: 3000 });
  99  |     await page.click('text=Edit Profile');
  100 |     await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });
  101 |     const profileResults = await new AxeBuilder({ page })
  102 |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  103 |       .analyze();
  104 |     combinedReportContent += generateA11yReport('User Profile & Goal Settings Modal', profileResults.violations);
  105 |     totalViolationsCount += profileResults.violations.length;
  106 | 
  107 |     await page.click('button:has-text("Cancel")');
  108 |     await page.waitForSelector('text=MY PROFILE', { state: 'detached', timeout: 3000 });
  109 |     console.log('[StepArc E2E] Settings Modal closed ✓');
  110 | 
  111 |     console.log(`[StepArc E2E] Walkthrough done. Total violation rules so far: ${totalViolationsCount}`);
  112 |     expect(totalViolationsCount).toBe(0);
  113 |   });
  114 | 
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
> 156 |     expect(results.violations.length, `${results.violations.length} landmark/semantic violation(s)`).toBe(0);
      |                                                                                                      ^ Error: 1 landmark/semantic violation(s)
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
  215 |       .toHaveLength(0);
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
```