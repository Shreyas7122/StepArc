import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupApiMocks } from './mocks/api-mocks';
import { generateA11yReport, writeReportToDisk } from './helpers/a11y-reporter';

test.describe('StepArc Accessibility (a11y) E2E Test Suite', () => {
  let combinedReportContent = '';
  let totalViolationsCount = 0;

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'sb-zskwpeheleppobhqpbpn-auth-token',
        JSON.stringify({
          access_token: 'mock-access-token-steparc',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: 'mocked-user-id-12345',
            email: 'testathlete@steparc.com',
            role: 'authenticated',
            aud: 'authenticated',
          },
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        })
      );
    });
    await setupApiMocks(page);
  });

  test.afterAll(async () => {
    writeReportToDisk(combinedReportContent, totalViolationsCount);
  });

  // ── TEST 1: Full Tab Walkthrough ──────────────────────────────────────────
  test('Sequential User Tab Walkthrough & Accessibility Audit', async ({ page }) => {
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });
    page.on('pageerror', err => {
      console.error(`[Browser PageError] ${err.stack || err.message || err}`);
    });
    page.on('request', req => {
      console.log(`[Network Request] ${req.method()}: ${req.url()}`);
    });
    page.on('requestfailed', req => {
      console.error(`[Network Request Failed] ${req.url()} - ${req.failure()?.errorText || 'Unknown'}`);
    });

    console.log('[StepArc E2E] Booting app on port 5173...');
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    await expect(page.locator('header h1')).toContainText('STEPARC');
    console.log('[StepArc E2E] Authenticated session confirmed ✓');

    // Dashboard
    console.log('[StepArc E2E] Auditing Dashboard Tab...');
    const dashboardResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    combinedReportContent += generateA11yReport('Dashboard Tab (Main View)', dashboardResults.violations);
    totalViolationsCount += dashboardResults.violations.length;

    // Food / Nutrition
    console.log('[StepArc E2E] Navigating to Food Tab...');
    await page.click('text=Nutrition');
    await page.waitForSelector('text=01 · QUICK LOG', { timeout: 3000 });
    const foodResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    combinedReportContent += generateA11yReport('Food Tab (Nutrition)', foodResults.violations);
    totalViolationsCount += foodResults.violations.length;

    // Workout / Training
    console.log('[StepArc E2E] Navigating to Workout Tab...');
    await page.click('text=Training');
    await page.waitForSelector('text=Gym Routine', { timeout: 3000 });
    const workoutResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    combinedReportContent += generateA11yReport('Workout Tab (Training)', workoutResults.violations);
    totalViolationsCount += workoutResults.violations.length;

    // Logs
    console.log('[StepArc E2E] Navigating to Logs Tab...');
    await page.click('text=Logs');
    await page.waitForSelector('text=Food Log', { timeout: 3000 });
    const logsResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    combinedReportContent += generateA11yReport('Daily Logs List Tab', logsResults.violations);
    totalViolationsCount += logsResults.violations.length;

    // Profile modal
    console.log('[StepArc E2E] Opening Profile Settings Modal...');
    await page.click('header div button');
    await page.waitForSelector('text=Edit Profile', { timeout: 3000 });
    await page.click('text=Edit Profile');
    await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });
    const profileResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    combinedReportContent += generateA11yReport('User Profile & Goal Settings Modal', profileResults.violations);
    totalViolationsCount += profileResults.violations.length;

    await page.click('button:has-text("Cancel")');
    await page.waitForSelector('text=MY PROFILE', { state: 'detached', timeout: 3000 });
    console.log('[StepArc E2E] Settings Modal closed ✓');

    console.log(`[StepArc E2E] Walkthrough done. Total violation rules so far: ${totalViolationsCount}`);
    expect(totalViolationsCount).toBe(0);
  });

  // ── TEST 2: Semantic Landmarks & Heading Hierarchy ────────────────────────
  test('Page Semantics — HTML Lang, Title, Headings & Landmarks', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    // html[lang] must exist
    const lang = await page.getAttribute('html', 'lang');
    expect(lang, '⚠ <html> element must have a lang attribute').toBeTruthy();

    // <title> must be non-empty
    const title = await page.title();
    expect(title, '⚠ Page <title> must not be empty').not.toBe('');

    // Exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count, '⚠ Page must have exactly one <h1>').toBe(1);

    // Heading levels must not skip (e.g. h1 → h3 without h2)
    const levels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => parseInt(h.tagName[1]))
    );
    for (let i = 1; i < levels.length; i++) {
      expect(
        levels[i] - levels[i - 1],
        `Heading jumped from h${levels[i - 1]} to h${levels[i]} — skipped level`
      ).toBeLessThanOrEqual(1);
    }

    // Axe scan — structural/landmark rules only
    const results = await new AxeBuilder({ page })
      .withRules([
        'region', 'landmark-one-main', 'landmark-no-duplicate-banner',
        'landmark-no-duplicate-contentinfo', 'page-has-heading-one',
        'document-title', 'html-has-lang', 'html-lang-valid',
      ])
      .analyze();

    combinedReportContent += generateA11yReport('Page Semantics — Landmarks & Heading Hierarchy', results.violations);
    totalViolationsCount += results.violations.length;

    expect(results.violations.length, `${results.violations.length} landmark/semantic violation(s)`).toBe(0);
  });

  // ── TEST 3: Keyboard Navigation & Focus Visibility ────────────────────────
  test('Keyboard Navigation — Focus Visibility on Interactive Elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    const focusIssues = [];

    // Tab through first 14 interactive elements and check each has a visible focus ring
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');

      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el.tagName === 'BODY') return null;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const hasOutline = parseFloat(style.outlineWidth) > 0 && style.outlineStyle !== 'none';
        const hasBoxShadow = style.boxShadow !== 'none' && style.boxShadow !== '';
        return {
          tag: el.tagName,
          ariaLabel: el.getAttribute('aria-label'),
          text: el.textContent?.trim().slice(0, 40),
          hasFocusIndicator: hasOutline || hasBoxShadow,
          outline: style.outline,
          visible: rect.width > 0 && rect.height > 0,
        };
      });

      if (!info) break;
      if (info.visible && !info.hasFocusIndicator) {
        const label = info.ariaLabel || info.text || info.tag;
        focusIssues.push({
          element: `${info.tag}[${label}]`,
          outline: info.outline,
        });
      }
    }

    const violations = focusIssues.map((issue) => ({
      id: 'focus-visible',
      help: 'Component must have a visible focus indicator',
      impact: 'serious',
      tags: ['wcag2aa', 'wcag21aa'],
      description: `${issue.element} receives keyboard focus but has no visible outline or box-shadow.`,
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.x/focus-visible',
      nodes: [{
        html: `<${issue.element.split('[')[0].toLowerCase()}>...</${issue.element.split('[')[0].toLowerCase()}>`,
        target: [issue.element],
        failureSummary: `Add :focus-visible { outline: 2px solid var(--gold-500); outline-offset: 2px; } to remove the invisible focus state. Computed outline: "${issue.outline}".`,
      }],
    }));

    combinedReportContent += generateA11yReport('Keyboard Navigation — Focus Visibility', violations);
    totalViolationsCount += violations.length;

    expect(focusIssues, `${focusIssues.length} element(s) with invisible focus:\n${focusIssues.map(i => `  - ${i.element}`).join('\n')}`)
      .toHaveLength(0);
  });

  // ── TEST 4: Tab Bar — Keyboard Accessibility ──────────────────────────────
  test('Tab Bar — Keyboard Accessibility (div vs button)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    // TabBar renders <div style="cursor:pointer"> items — check if they are keyboard focusable
    const tabAudit = await page.evaluate(() =>
      Array.from(document.querySelectorAll('div[style*="cursor: pointer"]')).map(el => ({
        tag: el.tagName,
        tabIndex: el.tabIndex,
        role: el.getAttribute('role'),
        text: el.textContent?.trim().slice(0, 25),
        focusable: el.tabIndex >= 0,
      }))
    );

    const nonFocusable = tabAudit.filter(el => !el.focusable);

    const violations = nonFocusable.length > 0 ? [{
      id: 'keyboard',
      help: 'Interactive tab items must be keyboard accessible',
      impact: 'critical',
      tags: ['wcag2a', 'wcag21a'],
      description: `${nonFocusable.length} tab bar item(s) use <div> elements with only an onClick handler. ` +
        'Divs are not natively focusable and are completely invisible to keyboard-only users.',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.x/keyboard',
      nodes: nonFocusable.map(el => ({
        html: `<div style="cursor:pointer">${el.text}</div>`,
        target: [`div:has-text("${el.text}")`],
        failureSummary: `In TabBar.jsx replace the outer <div onClick> with <button role="tab" tabIndex={0}>, ` +
          `or add tabIndex={0} role="tab" and onKeyDown={e => (e.key==='Enter'||e.key===' ') && handleTabClick(id)}.`,
      })),
    }] : [];

    combinedReportContent += generateA11yReport('Tab Bar — Keyboard Accessibility', violations);
    totalViolationsCount += violations.length;

    expect(violations.length,
      'Tab bar items are not keyboard accessible. Replace <div> with <button role="tab"> or add tabIndex="0" + onKeyDown.')
      .toBe(0);
  });

  // ── TEST 5: Profile Modal — Dialog Semantics & Escape Key ─────────────────
  test('Profile Modal — Dialog Semantics & Escape Key Handling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    const violations = [];

    // Open the modal
    await page.click('header div button');
    await page.waitForSelector('text=Edit Profile', { timeout: 3000 });
    await page.click('text=Edit Profile');
    await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });

    // Check role="dialog" / aria-modal
    const dialogCheck = await page.evaluate(() => ({
      hasDialogRole: !!document.querySelector('[role="dialog"]'),
      hasAriaModal: !!document.querySelector('[aria-modal="true"]'),
      hasAriaLabel: !!(
        document.querySelector('[role="dialog"][aria-label]') ||
        document.querySelector('[role="dialog"][aria-labelledby]')
      ),
    }));

    if (!dialogCheck.hasDialogRole && !dialogCheck.hasAriaModal) {
      violations.push({
        id: 'dialog-name',
        help: 'Modal must have role="dialog" and aria-modal="true"',
        impact: 'critical',
        tags: ['wcag2a', 'wcag21a'],
        description: 'The Profile Settings modal is missing role="dialog" and aria-modal="true". ' +
          'Screen readers cannot identify it as a modal, so users may not understand their navigation context is constrained.',
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
        nodes: [{
          html: '<div>Profile modal wrapper</div>',
          target: ['div:has-text("MY PROFILE")'],
          failureSummary: 'In UserProfileModal.jsx, add role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" to the outermost container div.',
        }],
      });
    } else if (dialogCheck.hasDialogRole && !dialogCheck.hasAriaLabel) {
      violations.push({
        id: 'dialog-name',
        help: 'Dialog must have an accessible name via aria-label or aria-labelledby',
        impact: 'serious',
        tags: ['wcag2a', 'wcag21a'],
        description: 'The dialog element exists but lacks aria-label or aria-labelledby. Screen readers will not announce a meaningful name when the modal opens.',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.x/dialog-name',
        nodes: [{
          html: '<div role="dialog">...</div>',
          target: ['[role="dialog"]'],
          failureSummary: 'Add aria-labelledby="profile-modal-title" on the dialog and id="profile-modal-title" on the "MY PROFILE" heading.',
        }],
      });
    }

    // Check Escape key closes the modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const stillOpen = await page.locator('text=MY PROFILE').isVisible();

    if (stillOpen) {
      violations.push({
        id: 'modal-escape-close',
        help: 'Dialog must be dismissable with the Escape key (WCAG 2.1.2)',
        impact: 'serious',
        tags: ['wcag2a', 'wcag21a'],
        description: 'Pressing Escape did not close the profile modal. WCAG 2.1.2 (No Keyboard Trap) requires that dialogs opened by keyboard are dismissable by keyboard.',
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
        nodes: [{
          html: '<div>Profile Modal</div>',
          target: ['div:has-text("MY PROFILE")'],
          failureSummary: 'In UserProfileModal.jsx add: useEffect(() => { const h = e => e.key === "Escape" && onClose(); document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h); }, [onClose]);',
        }],
      });
      // Clean up: close via Cancel
      await page.click('button:has-text("Cancel")').catch(() => {});
    }

    combinedReportContent += generateA11yReport('Profile Modal — Dialog Semantics & Escape Key', violations);
    totalViolationsCount += violations.length;

    expect(violations.length, `${violations.length} modal accessibility violation(s)`).toBe(0);
  });

  // ── TEST 6: Profile Form — Input Labels ──────────────────────────────────
  test('Profile Form — Input Labels & Accessible Field Names', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    await page.click('header div button');
    await page.waitForSelector('text=Edit Profile', { timeout: 3000 });
    await page.click('text=Edit Profile');
    await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });

    // Run Axe for label-specific rules
    const axeResults = await new AxeBuilder({ page })
      .withRules(['label', 'label-content-name-mismatch', 'select-name', 'aria-input-field-name'])
      .analyze();

    // Manual pass: find any <input>/<select>/<textarea> without a usable label
    const unlabelled = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input, select, textarea')).map(el => {
        const id = el.id;
        const hasLabel = !!(
          el.getAttribute('aria-label') ||
          el.getAttribute('aria-labelledby') ||
          (id && document.querySelector(`label[for="${id}"]`)) ||
          el.closest('label')
        );
        return {
          type: el.type || el.tagName.toLowerCase(),
          placeholder: el.getAttribute('placeholder') || '',
          hasLabel,
          html: el.outerHTML.slice(0, 110),
        };
      }).filter(el => !el.hasLabel)
    );

    const allViolations = [...axeResults.violations];
    if (unlabelled.length > 0) {
      allViolations.push({
        id: 'label',
        help: 'Form elements must have associated text labels',
        impact: 'critical',
        tags: ['wcag2a', 'wcag21a'],
        description: `${unlabelled.length} input(s) in the profile form lack an accessible label. ` +
          'Placeholder text is NOT a substitute — it disappears on input and is not reliably announced by all screen readers.',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.x/label',
        nodes: unlabelled.map(el => ({
          html: el.html,
          target: [`input[type="${el.type}"]`],
          failureSummary: `Add aria-label="[field purpose]" to the ${el.type} input (placeholder: "${el.placeholder}").`,
        })),
      });
    }

    await page.click('button:has-text("Cancel")').catch(() => {});

    combinedReportContent += generateA11yReport('Profile Form — Input Labels & Accessible Field Names', allViolations);
    totalViolationsCount += allViolations.length;

    expect(allViolations.length, `${allViolations.length} form label violation(s)`).toBe(0);
  });

  // ── TEST 7: Touch Target Size (WCAG 2.5.5) ───────────────────────────────
  test('Touch Target Size — Minimum 44×44px (WCAG 2.5.5)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    const MIN = 44;

    const smallTargets = await page.evaluate((MIN) => {
      const els = document.querySelectorAll('button, [role="button"], [role="tab"], a[href], [tabindex="0"]');
      return Array.from(els).map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          label: el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30) || '',
          w: Math.round(r.width),
          h: Math.round(r.height),
          tooSmall: r.width > 0 && (r.width < MIN || r.height < MIN),
        };
      }).filter(el => el.tooSmall);
    }, MIN);

    const violations = smallTargets.length > 0 ? [{
      id: 'target-size',
      help: `Interactive elements must meet the ${MIN}×${MIN}px minimum touch target (WCAG 2.5.5)`,
      impact: 'serious',
      tags: ['wcag21aa'],
      description: `${smallTargets.length} interactive element(s) are below the ${MIN}×${MIN}px minimum. ` +
        'Small targets significantly raise error rates on touch devices.',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/target-size.html',
      nodes: smallTargets.map(el => ({
        html: `<${el.tag.toLowerCase()} aria-label="${el.label}">...</${el.tag.toLowerCase()}>`,
        target: [`${el.tag.toLowerCase()}[aria-label="${el.label}"]`],
        failureSummary: `"${el.label}" is ${el.w}×${el.h}px. Set min-width: ${MIN}px; min-height: ${MIN}px; or add padding to reach 44px.`,
      })),
    }] : [];

    if (smallTargets.length > 0) {
      smallTargets.forEach(el =>
        console.warn(`[StepArc A11y] Small touch target: ${el.tag} "${el.label}" = ${el.w}×${el.h}px`)
      );
    }

    combinedReportContent += generateA11yReport(`Touch Target Size — Min ${MIN}×${MIN}px (WCAG 2.5.5)`, violations);
    totalViolationsCount += violations.length;

    expect(violations.length,
      `${smallTargets.length} element(s) below ${MIN}×${MIN}px:\n` +
      smallTargets.map(el => `  - "${el.label}" ${el.w}×${el.h}px`).join('\n'))
      .toBe(0);
  });

  // ── TEST 8: Color Contrast — All Tabs ────────────────────────────────────
  test('Color Contrast — Targeted Scan Across All Tabs (WCAG 1.4.3)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    const views = [
      { name: 'Dashboard', nav: null },
      { name: 'History',   nav: async () => { await page.click('text=History');   await page.waitForTimeout(1200); } },
      { name: 'Nutrition', nav: async () => { await page.click('text=Nutrition'); await page.waitForTimeout(600); } },
      { name: 'Training',  nav: async () => { await page.click('text=Training');  await page.waitForTimeout(600); } },
      { name: 'Logs',      nav: async () => { await page.click('text=Logs');      await page.waitForTimeout(600); } },
    ];

    const allViolations = [];
    for (const view of views) {
      if (view.nav) await view.nav();
      const res = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      res.violations.forEach(v => allViolations.push({ ...v, _view: view.name }));
    }

    combinedReportContent += generateA11yReport('Color Contrast — All Tabs (WCAG 1.4.3)', allViolations);
    totalViolationsCount += allViolations.length;

    expect(allViolations.length, `${allViolations.length} color contrast violation(s) across all tabs`).toBe(0);
  });

  // ── TEST 9: Reduced Motion (WCAG 2.3.3) ──────────────────────────────────
  test('Reduced Motion — prefers-reduced-motion Compliance (WCAG 2.3.3)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    // Find elements with CSS animation classes and check if they're still animating
    const activeAnims = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[class*="animate-"]')).map(el => {
        const s = window.getComputedStyle(el);
        return {
          className: el.className,
          animationName: s.animationName,
          animationDuration: s.animationDuration,
          stillAnimating: s.animationName !== 'none' && s.animationDuration !== '0s',
        };
      }).filter(el => el.stillAnimating)
    );

    const violations = activeAnims.length > 0 ? [{
      id: 'prefers-reduced-motion',
      help: 'CSS animations must be disabled when prefers-reduced-motion: reduce is set',
      impact: 'serious',
      tags: ['wcag21aaa'],
      description: `${activeAnims.length} element(s) continue animating despite the user enabling "Reduce Motion". ` +
        'This can trigger nausea, dizziness, or seizures in users with vestibular disorders.',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html',
      nodes: activeAnims.map(el => ({
        html: `<div class="${el.className}">...</div>`,
        target: [`.${el.className.split(' ')[0]}`],
        failureSummary: `In index.css add: @media (prefers-reduced-motion: reduce) { .${el.className.split(' ')[0]} { animation: none; transition: none; } }`,
      })),
    }] : [];

    combinedReportContent += generateA11yReport('Reduced Motion — prefers-reduced-motion (WCAG 2.3.3)', violations);
    totalViolationsCount += violations.length;

    if (activeAnims.length > 0) {
      activeAnims.forEach(a =>
        console.warn(`[StepArc A11y] Animation not stopped: .${a.className.split(' ')[0]} (${a.animationName}, ${a.animationDuration})`)
      );
    }

    expect(violations.length,
      `${activeAnims.length} animation(s) not respecting prefers-reduced-motion:\n` +
      activeAnims.map(a => `  - .${a.className.split(' ')[0]}: ${a.animationName}`).join('\n'))
      .toBe(0);
  });

  // ── TEST 10: History Tab — Full Axe Scan ─────────────────────────────────
  test('History Tab — Full Axe Accessibility Scan', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    await page.click('text=History');
    await page.waitForTimeout(1500); // allow async data fetch to settle

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    combinedReportContent += generateA11yReport('History Tab — Full Axe Accessibility Scan', results.violations);
    totalViolationsCount += results.violations.length;

    expect(results.violations.length, `${results.violations.length} History Tab violation(s)`).toBe(0);
  });
});
