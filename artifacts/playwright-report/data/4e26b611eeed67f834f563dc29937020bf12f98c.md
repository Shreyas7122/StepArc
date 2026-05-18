# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.js >> StepArc Accessibility (a11y) E2E Test Suite >> Profile Modal — Dialog Semantics & Escape Key Handling
- Location: tests/accessibility.spec.js:261:3

# Error details

```
Error: 2 modal accessibility violation(s)

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 2
```

# Test source

```ts
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
  316 |     await page.waitForTimeout(400);
  317 |     const stillOpen = await page.locator('text=MY PROFILE').isVisible();
  318 | 
  319 |     if (stillOpen) {
  320 |       violations.push({
  321 |         id: 'modal-escape-close',
  322 |         help: 'Dialog must be dismissable with the Escape key (WCAG 2.1.2)',
  323 |         impact: 'serious',
  324 |         tags: ['wcag2a', 'wcag21a'],
  325 |         description: 'Pressing Escape did not close the profile modal. WCAG 2.1.2 (No Keyboard Trap) requires that dialogs opened by keyboard are dismissable by keyboard.',
  326 |         helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
  327 |         nodes: [{
  328 |           html: '<div>Profile Modal</div>',
  329 |           target: ['div:has-text("MY PROFILE")'],
  330 |           failureSummary: 'In UserProfileModal.jsx add: useEffect(() => { const h = e => e.key === "Escape" && onClose(); document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h); }, [onClose]);',
  331 |         }],
  332 |       });
  333 |       // Clean up: close via Cancel
  334 |       await page.click('button:has-text("Cancel")').catch(() => {});
  335 |     }
  336 | 
  337 |     combinedReportContent += generateA11yReport('Profile Modal — Dialog Semantics & Escape Key', violations);
  338 |     totalViolationsCount += violations.length;
  339 | 
> 340 |     expect(violations.length, `${violations.length} modal accessibility violation(s)`).toBe(0);
      |                                                                                        ^ Error: 2 modal accessibility violation(s)
  341 |   });
  342 | 
  343 |   // ── TEST 6: Profile Form — Input Labels ──────────────────────────────────
  344 |   test('Profile Form — Input Labels & Accessible Field Names', async ({ page }) => {
  345 |     await page.goto('/');
  346 |     await page.waitForSelector('header h1', { timeout: 8000 });
  347 | 
  348 |     await page.click('header div button');
  349 |     await page.waitForSelector('text=Edit Profile', { timeout: 3000 });
  350 |     await page.click('text=Edit Profile');
  351 |     await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });
  352 | 
  353 |     // Run Axe for label-specific rules
  354 |     const axeResults = await new AxeBuilder({ page })
  355 |       .withRules(['label', 'label-content-name-mismatch', 'select-name', 'aria-input-field-name'])
  356 |       .analyze();
  357 | 
  358 |     // Manual pass: find any <input>/<select>/<textarea> without a usable label
  359 |     const unlabelled = await page.evaluate(() =>
  360 |       Array.from(document.querySelectorAll('input, select, textarea')).map(el => {
  361 |         const id = el.id;
  362 |         const hasLabel = !!(
  363 |           el.getAttribute('aria-label') ||
  364 |           el.getAttribute('aria-labelledby') ||
  365 |           (id && document.querySelector(`label[for="${id}"]`)) ||
  366 |           el.closest('label')
  367 |         );
  368 |         return {
  369 |           type: el.type || el.tagName.toLowerCase(),
  370 |           placeholder: el.getAttribute('placeholder') || '',
  371 |           hasLabel,
  372 |           html: el.outerHTML.slice(0, 110),
  373 |         };
  374 |       }).filter(el => !el.hasLabel)
  375 |     );
  376 | 
  377 |     const allViolations = [...axeResults.violations];
  378 |     if (unlabelled.length > 0) {
  379 |       allViolations.push({
  380 |         id: 'label',
  381 |         help: 'Form elements must have associated text labels',
  382 |         impact: 'critical',
  383 |         tags: ['wcag2a', 'wcag21a'],
  384 |         description: `${unlabelled.length} input(s) in the profile form lack an accessible label. ` +
  385 |           'Placeholder text is NOT a substitute — it disappears on input and is not reliably announced by all screen readers.',
  386 |         helpUrl: 'https://dequeuniversity.com/rules/axe/4.x/label',
  387 |         nodes: unlabelled.map(el => ({
  388 |           html: el.html,
  389 |           target: [`input[type="${el.type}"]`],
  390 |           failureSummary: `Add aria-label="[field purpose]" to the ${el.type} input (placeholder: "${el.placeholder}").`,
  391 |         })),
  392 |       });
  393 |     }
  394 | 
  395 |     await page.click('button:has-text("Cancel")').catch(() => {});
  396 | 
  397 |     combinedReportContent += generateA11yReport('Profile Form — Input Labels & Accessible Field Names', allViolations);
  398 |     totalViolationsCount += allViolations.length;
  399 | 
  400 |     expect(allViolations.length, `${allViolations.length} form label violation(s)`).toBe(0);
  401 |   });
  402 | 
  403 |   // ── TEST 7: Touch Target Size (WCAG 2.5.5) ───────────────────────────────
  404 |   test('Touch Target Size — Minimum 44×44px (WCAG 2.5.5)', async ({ page }) => {
  405 |     await page.goto('/');
  406 |     await page.waitForSelector('header h1', { timeout: 8000 });
  407 | 
  408 |     const MIN = 44;
  409 | 
  410 |     const smallTargets = await page.evaluate((MIN) => {
  411 |       const els = document.querySelectorAll('button, [role="button"], [role="tab"], a[href], [tabindex="0"]');
  412 |       return Array.from(els).map(el => {
  413 |         const r = el.getBoundingClientRect();
  414 |         return {
  415 |           tag: el.tagName,
  416 |           label: el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30) || '',
  417 |           w: Math.round(r.width),
  418 |           h: Math.round(r.height),
  419 |           tooSmall: r.width > 0 && (r.width < MIN || r.height < MIN),
  420 |         };
  421 |       }).filter(el => el.tooSmall);
  422 |     }, MIN);
  423 | 
  424 |     const violations = smallTargets.length > 0 ? [{
  425 |       id: 'target-size',
  426 |       help: `Interactive elements must meet the ${MIN}×${MIN}px minimum touch target (WCAG 2.5.5)`,
  427 |       impact: 'serious',
  428 |       tags: ['wcag21aa'],
  429 |       description: `${smallTargets.length} interactive element(s) are below the ${MIN}×${MIN}px minimum. ` +
  430 |         'Small targets significantly raise error rates on touch devices.',
  431 |       helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/target-size.html',
  432 |       nodes: smallTargets.map(el => ({
  433 |         html: `<${el.tag.toLowerCase()} aria-label="${el.label}">...</${el.tag.toLowerCase()}>`,
  434 |         target: [`${el.tag.toLowerCase()}[aria-label="${el.label}"]`],
  435 |         failureSummary: `"${el.label}" is ${el.w}×${el.h}px. Set min-width: ${MIN}px; min-height: ${MIN}px; or add padding to reach 44px.`,
  436 |       })),
  437 |     }] : [];
  438 | 
  439 |     if (smallTargets.length > 0) {
  440 |       smallTargets.forEach(el =>
```