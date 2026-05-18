# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.js >> StepArc Accessibility (a11y) E2E Test Suite >> Reduced Motion — prefers-reduced-motion Compliance (WCAG 2.3.3)
- Location: tests/accessibility.spec.js:481:3

# Error details

```
Error: 3 animation(s) not respecting prefers-reduced-motion:
  - .animate-slide-up: slideUp
  - .animate-slide-up: slideUp
  - .animate-slide-up: slideUp

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Test source

```ts
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
  501 |       help: 'CSS animations must be disabled when prefers-reduced-motion: reduce is set',
  502 |       impact: 'serious',
  503 |       tags: ['wcag21aaa'],
  504 |       description: `${activeAnims.length} element(s) continue animating despite the user enabling "Reduce Motion". ` +
  505 |         'This can trigger nausea, dizziness, or seizures in users with vestibular disorders.',
  506 |       helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html',
  507 |       nodes: activeAnims.map(el => ({
  508 |         html: `<div class="${el.className}">...</div>`,
  509 |         target: [`.${el.className.split(' ')[0]}`],
  510 |         failureSummary: `In index.css add: @media (prefers-reduced-motion: reduce) { .${el.className.split(' ')[0]} { animation: none; transition: none; } }`,
  511 |       })),
  512 |     }] : [];
  513 | 
  514 |     combinedReportContent += generateA11yReport('Reduced Motion — prefers-reduced-motion (WCAG 2.3.3)', violations);
  515 |     totalViolationsCount += violations.length;
  516 | 
  517 |     if (activeAnims.length > 0) {
  518 |       activeAnims.forEach(a =>
  519 |         console.warn(`[StepArc A11y] Animation not stopped: .${a.className.split(' ')[0]} (${a.animationName}, ${a.animationDuration})`)
  520 |       );
  521 |     }
  522 | 
  523 |     expect(violations.length,
  524 |       `${activeAnims.length} animation(s) not respecting prefers-reduced-motion:\n` +
  525 |       activeAnims.map(a => `  - .${a.className.split(' ')[0]}: ${a.animationName}`).join('\n'))
> 526 |       .toBe(0);
      |        ^ Error: 3 animation(s) not respecting prefers-reduced-motion:
  527 |   });
  528 | 
  529 |   // ── TEST 10: History Tab — Full Axe Scan ─────────────────────────────────
  530 |   test('History Tab — Full Axe Accessibility Scan', async ({ page }) => {
  531 |     await page.goto('/');
  532 |     await page.waitForSelector('header h1', { timeout: 8000 });
  533 | 
  534 |     await page.click('text=History');
  535 |     await page.waitForTimeout(1500); // allow async data fetch to settle
  536 | 
  537 |     const results = await new AxeBuilder({ page })
  538 |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  539 |       .analyze();
  540 | 
  541 |     combinedReportContent += generateA11yReport('History Tab — Full Axe Accessibility Scan', results.violations);
  542 |     totalViolationsCount += results.violations.length;
  543 | 
  544 |     expect(results.violations.length, `${results.violations.length} History Tab violation(s)`).toBe(0);
  545 |   });
  546 | });
  547 | 
```