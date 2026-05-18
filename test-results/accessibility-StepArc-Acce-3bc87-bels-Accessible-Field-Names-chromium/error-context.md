# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.js >> StepArc Accessibility (a11y) E2E Test Suite >> Profile Form — Input Labels & Accessible Field Names
- Location: tests/accessibility.spec.js:344:3

# Error details

```
Error: 1 form label violation(s)

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Test source

```ts
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
  340 |     expect(violations.length, `${violations.length} modal accessibility violation(s)`).toBe(0);
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
> 400 |     expect(allViolations.length, `${allViolations.length} form label violation(s)`).toBe(0);
      |                                                                                     ^ Error: 1 form label violation(s)
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
  441 |         console.warn(`[StepArc A11y] Small touch target: ${el.tag} "${el.label}" = ${el.w}×${el.h}px`)
  442 |       );
  443 |     }
  444 | 
  445 |     combinedReportContent += generateA11yReport(`Touch Target Size — Min ${MIN}×${MIN}px (WCAG 2.5.5)`, violations);
  446 |     totalViolationsCount += violations.length;
  447 | 
  448 |     expect(violations.length,
  449 |       `${smallTargets.length} element(s) below ${MIN}×${MIN}px:\n` +
  450 |       smallTargets.map(el => `  - "${el.label}" ${el.w}×${el.h}px`).join('\n'))
  451 |       .toBe(0);
  452 |   });
  453 | 
  454 |   // ── TEST 8: Color Contrast — All Tabs ────────────────────────────────────
  455 |   test('Color Contrast — Targeted Scan Across All Tabs (WCAG 1.4.3)', async ({ page }) => {
  456 |     await page.goto('/');
  457 |     await page.waitForSelector('header h1', { timeout: 8000 });
  458 | 
  459 |     const views = [
  460 |       { name: 'Dashboard', nav: null },
  461 |       { name: 'History',   nav: async () => { await page.click('text=History');   await page.waitForTimeout(1200); } },
  462 |       { name: 'Nutrition', nav: async () => { await page.click('text=Nutrition'); await page.waitForTimeout(600); } },
  463 |       { name: 'Training',  nav: async () => { await page.click('text=Training');  await page.waitForTimeout(600); } },
  464 |       { name: 'Logs',      nav: async () => { await page.click('text=Logs');      await page.waitForTimeout(600); } },
  465 |     ];
  466 | 
  467 |     const allViolations = [];
  468 |     for (const view of views) {
  469 |       if (view.nav) await view.nav();
  470 |       const res = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  471 |       res.violations.forEach(v => allViolations.push({ ...v, _view: view.name }));
  472 |     }
  473 | 
  474 |     combinedReportContent += generateA11yReport('Color Contrast — All Tabs (WCAG 1.4.3)', allViolations);
  475 |     totalViolationsCount += allViolations.length;
  476 | 
  477 |     expect(allViolations.length, `${allViolations.length} color contrast violation(s) across all tabs`).toBe(0);
  478 |   });
  479 | 
  480 |   // ── TEST 9: Reduced Motion (WCAG 2.3.3) ──────────────────────────────────
  481 |   test('Reduced Motion — prefers-reduced-motion Compliance (WCAG 2.3.3)', async ({ page }) => {
  482 |     await page.emulateMedia({ reducedMotion: 'reduce' });
  483 |     await page.goto('/');
  484 |     await page.waitForSelector('header h1', { timeout: 8000 });
  485 | 
  486 |     // Find elements with CSS animation classes and check if they're still animating
  487 |     const activeAnims = await page.evaluate(() =>
  488 |       Array.from(document.querySelectorAll('[class*="animate-"]')).map(el => {
  489 |         const s = window.getComputedStyle(el);
  490 |         return {
  491 |           className: el.className,
  492 |           animationName: s.animationName,
  493 |           animationDuration: s.animationDuration,
  494 |           stillAnimating: s.animationName !== 'none' && s.animationDuration !== '0s',
  495 |         };
  496 |       }).filter(el => el.stillAnimating)
  497 |     );
  498 | 
  499 |     const violations = activeAnims.length > 0 ? [{
  500 |       id: 'prefers-reduced-motion',
```