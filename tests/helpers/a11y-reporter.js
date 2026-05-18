import fs from 'fs';
import path from 'path';

const IMPACT_COLOR = {
  critical: '#ef4444',
  serious:  '#f97316',
  moderate: '#f59e0b',
  minor:    '#6b7280',
};

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateRemediation(ruleId, node) {
  const target = node.target?.join(', ') || '';
  const summary = node.failureSummary || '';

  switch (ruleId) {
    case 'color-contrast':
      return `<strong>Problem:</strong> Low text contrast on <code>${escapeHtml(target)}</code>. WCAG AA requires 4.5:1 for regular text and 3:1 for large text against the background.
      <br><strong>Fix:</strong> Increase text brightness — use <code>var(--gray-300)</code> (#D4D4D8) or <code>#FFFFFF</code>. Verify with the browser DevTools color picker.`;

    case 'label':
      return `<strong>Problem:</strong> Form field <code>${escapeHtml(target)}</code> has no accessible label. Screen readers only announce the input type, not its purpose.
      <br><strong>Fix:</strong> Add <code>aria-label="[descriptive text]"</code> directly on the element, or wrap it in a <code>&lt;label&gt;</code>. Placeholder text is <em>not</em> a substitute for a label.`;

    case 'region':
      return `<strong>Problem:</strong> Content at <code>${escapeHtml(target)}</code> is outside a landmark region. Screen reader users navigate by landmarks.
      <br><strong>Fix:</strong> Wrap main page content in <code>&lt;main&gt;</code>, navigation in <code>&lt;nav&gt;</code>, and use semantic <code>&lt;header&gt;</code> / <code>&lt;footer&gt;</code> appropriately.`;

    case 'button-name':
      return `<strong>Problem:</strong> Button <code>${escapeHtml(target)}</code> has no accessible name. Icon-only buttons are invisible to screen readers.
      <br><strong>Fix:</strong> Add <code>aria-label="[action]"</code>, e.g. <code>aria-label="Close modal"</code> or <code>aria-label="Open user menu"</code>.`;

    case 'image-alt':
      return `<strong>Problem:</strong> Image <code>${escapeHtml(target)}</code> has no alt attribute.
      <br><strong>Fix:</strong> Add <code>alt="[concise description]"</code>. For decorative images use <code>alt=""</code> with <code>role="presentation"</code>.`;

    case 'keyboard':
      return `<strong>Problem:</strong> Interactive element <code>${escapeHtml(target)}</code> is unreachable by keyboard. <code>&lt;div&gt;</code>/<code>&lt;span&gt;</code> with <code>onClick</code> are not focusable by default.
      <br><strong>Fix:</strong> Replace with a native <code>&lt;button&gt;</code>, or add <code>tabIndex="0"</code>, <code>role="button"</code>, and a <code>onKeyDown</code> handler for Space/Enter.`;

    case 'dialog-name':
    case 'modal-escape-close':
      return `<strong>Problem:</strong> Modal dialog <code>${escapeHtml(target)}</code> is missing accessibility attributes or keyboard dismiss support.
      <br><strong>Fix:</strong> Add <code>role="dialog" aria-modal="true" aria-labelledby="[heading-id]"</code> to the modal wrapper. Add an Escape handler: <code>useEffect(() =&gt; { const h = e =&gt; e.key === 'Escape' &amp;&amp; onClose(); document.addEventListener('keydown', h); return () =&gt; document.removeEventListener('keydown', h); }, []);</code>`;

    case 'focus-visible':
      return `<strong>Problem:</strong> Focused element <code>${escapeHtml(target)}</code> has no visible focus ring. Keyboard users cannot see where they are.
      <br><strong>Fix:</strong> Add <code>:focus-visible { outline: 2px solid var(--gold-500); outline-offset: 2px; }</code>. Never use <code>outline: none</code> without a visible alternative.`;

    case 'target-size':
      return `<strong>Problem:</strong> Interactive element <code>${escapeHtml(target)}</code> is below the 44×44px minimum touch target (WCAG 2.5.5). Small targets raise error rates on mobile.
      <br><strong>Fix:</strong> Add padding or set <code>min-width: 44px; min-height: 44px;</code>.`;

    case 'prefers-reduced-motion':
      return `<strong>Problem:</strong> Element <code>${escapeHtml(target)}</code> still animates when <code>prefers-reduced-motion: reduce</code> is set. Can cause nausea/dizziness for vestibular disorder users.
      <br><strong>Fix:</strong> Add to CSS: <code>@media (prefers-reduced-motion: reduce) { ${escapeHtml(target)} { animation: none; transition: none; } }</code>`;

    default:
      return `<strong>Problem:</strong> Axe rule <code>${escapeHtml(ruleId)}</code> violated at <code>${escapeHtml(target)}</code>.
      <br><strong>Fix:</strong> ${escapeHtml(summary) || 'Ensure correct semantic HTML roles and ARIA attributes are used. See the linked Axe documentation.'}`;
  }
}

/**
 * generateA11yReport
 * Returns an HTML fragment (a <section>) for one audited app state.
 */
export function generateA11yReport(stateName, violations) {
  if (violations.length === 0) {
    return `
    <section class="state pass">
      <div class="state-header">
        <span class="state-icon">✅</span>
        <h2>${escapeHtml(stateName)}</h2>
        <span class="badge pass-badge">PASS — No Violations</span>
      </div>
      <p class="pass-msg">All evaluated elements meet WCAG 2.1 AA guidelines. Clean audit! 🌟</p>
    </section>`;
  }

  const ruleRows = violations.map((v, i) => {
    const color = IMPACT_COLOR[v.impact] || '#6b7280';
    const tags  = (v.tags || []).filter(t => t.startsWith('wcag')).map(t =>
      `<span class="tag">${escapeHtml(t)}</span>`).join('');
    const link  = v.helpUrl
      ? `<a class="help-link" href="${escapeHtml(v.helpUrl)}" target="_blank">→ View Axe Rule Documentation</a>`
      : '';

    return `
    <div class="violation">
      <div class="violation-header">
        <span class="rule-num">#${i + 1}</span>
        <span class="rule-id"><code>${escapeHtml(v.id)}</code></span>
        <span class="rule-help">${escapeHtml(v.help || '')}</span>
        <span class="impact-badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${(v.impact || 'unknown').toUpperCase()}</span>
      </div>
      <p class="violation-desc">${escapeHtml(v.description || '')}</p>
      <div class="violation-tags">${tags}</div>
      ${link}
    </div>`;
  }).join('');

  const nodeRows = violations.flatMap((v, vi) =>
    (v.nodes || []).map((node, ni) => {
      const color = IMPACT_COLOR[v.impact] || '#6b7280';
      return `
      <div class="node">
        <div class="node-header">
          <span class="node-num">Rule #${vi + 1} · Node ${ni + 1}</span>
          <span class="impact-badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${(v.impact || '').toUpperCase()}</span>
        </div>
        <div class="node-html"><code>${escapeHtml(node.html || '')}</code></div>
        <div class="remediation">${generateRemediation(v.id, node)}</div>
      </div>`;
    })
  ).join('');

  return `
  <section class="state fail">
    <div class="state-header">
      <span class="state-icon">⚠️</span>
      <h2>${escapeHtml(stateName)}</h2>
      <span class="badge fail-badge">${violations.length} VIOLATION${violations.length !== 1 ? 'S' : ''}</span>
    </div>
    <div class="violations-list">${ruleRows}</div>
    <div class="nodes-list">
      <h3>Affected Elements &amp; Remediation</h3>
      ${nodeRows}
    </div>
  </section>`;
}

/**
 * writeReportToDisk
 * Wraps all accumulated HTML section fragments in a full styled HTML document and writes to disk.
 */
export function writeReportToDisk(htmlSections, totalViolations = 0) {
  const now = new Date().toLocaleString();

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StepArc A11y Report — ${escapeHtml(now)}</title>
  <style>
    :root {
      --bg: #0a0612; --surface: #120820; --card: #1a0b2e;
      --border: rgba(255,255,255,0.07);
      --gold: #f59e0b; --gold-dim: rgba(245,158,11,0.12);
      --purple: #a855f7;
      --green: #22c55e; --green-dim: rgba(34,197,94,0.12);
      --red: #ef4444; --red-dim: rgba(239,68,68,0.12);
      --text: #e5e7eb; --muted: #6b7280;
      --mono: 'JetBrains Mono','Fira Code','Cascadia Code',monospace;
    }
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.6;padding:32px 16px;}
    .wrap{max-width:960px;margin:0 auto;}

    /* Header */
    .rpt-header{background:linear-gradient(135deg,#1a0b2e 0%,#0f0a1e 100%);border:1px solid var(--border);border-radius:16px;padding:32px;margin-bottom:24px;position:relative;overflow:hidden;}
    .rpt-header::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,rgba(168,85,247,.2) 0%,transparent 65%);pointer-events:none;}
    .rpt-title{font-size:28px;font-weight:700;letter-spacing:-.02em;color:#fff;margin-bottom:8px;}
    .rpt-title span{color:var(--gold);}
    .rpt-meta{color:var(--muted);font-size:11px;letter-spacing:.1em;text-transform:uppercase;}
    .rpt-meta strong{color:var(--gold);}

    /* Summary bar */
    .summary{display:flex;gap:16px;margin-bottom:28px;flex-wrap:wrap;}
    .sum-card{flex:1;min-width:130px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;}
    .sum-card .num{font-size:30px;font-weight:700;line-height:1;}
    .sum-card .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-top:4px;}
    .num-fail{color:var(--red);}
    .num-ok{color:var(--green);}

    /* State sections */
    .state{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px;}
    .state.pass{border-left:4px solid var(--green);}
    .state.fail{border-left:4px solid var(--red);}
    .state-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;}
    .state-header h2{font-size:15px;font-weight:600;color:#fff;flex:1;}
    .state-icon{font-size:18px;}
    .badge{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;border-radius:20px;}
    .pass-badge{background:var(--green-dim);color:var(--green);border:1px solid rgba(34,197,94,.3);}
    .fail-badge{background:var(--red-dim);color:var(--red);border:1px solid rgba(239,68,68,.3);}
    .pass-msg{color:var(--muted);font-size:13px;}

    /* Violations */
    .violation{background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:12px;}
    .violation-header{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;}
    .rule-num{background:var(--gold-dim);color:var(--gold);font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;}
    .rule-id code{font-family:var(--mono);font-size:12px;color:var(--purple);background:rgba(168,85,247,.1);padding:2px 6px;border-radius:4px;}
    .rule-help{font-size:13px;color:var(--text);flex:1;}
    .impact-badge{font-size:10px;font-weight:700;letter-spacing:.08em;padding:2px 8px;border-radius:12px;}
    .violation-desc{font-size:13px;color:var(--muted);margin-bottom:10px;}
    .violation-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;}
    .tag{font-size:10px;background:rgba(168,85,247,.1);color:var(--purple);border:1px solid rgba(168,85,247,.2);padding:2px 8px;border-radius:10px;font-family:var(--mono);}
    .help-link{font-size:12px;color:var(--gold);text-decoration:none;opacity:.8;}
    .help-link:hover{opacity:1;text-decoration:underline;}

    /* Nodes */
    .nodes-list h3{font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin:20px 0 12px;}
    .node{background:rgba(0,0,0,.4);border:1px solid var(--border);border-radius:8px;padding:14px 16px;margin-bottom:10px;}
    .node-header{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
    .node-num{font-size:11px;color:var(--muted);font-family:var(--mono);}
    .node-html{font-family:var(--mono);font-size:12px;color:#94a3b8;background:rgba(0,0,0,.5);padding:8px 12px;border-radius:6px;margin-bottom:10px;overflow-x:auto;white-space:pre-wrap;word-break:break-all;}
    .remediation{font-size:13px;color:var(--text);line-height:1.7;}
    .remediation code{font-family:var(--mono);font-size:11px;background:rgba(168,85,247,.15);color:#c4b5fd;padding:1px 5px;border-radius:3px;}

    /* Footer */
    .rpt-footer{text-align:center;color:var(--muted);font-size:11px;letter-spacing:.08em;margin-top:32px;padding-top:24px;border-top:1px solid var(--border);}
  </style>
</head>
<body>
<div class="wrap">
  <header class="rpt-header">
    <div class="rpt-title">STEP<span>ARC</span> Accessibility Report</div>
    <div class="rpt-meta">Run Date: <strong>${escapeHtml(now)}</strong> &nbsp;·&nbsp; Playwright + Axe-Core &nbsp;·&nbsp; WCAG 2.1 AA</div>
  </header>

  <div class="summary">
    <div class="sum-card">
      <div class="num ${totalViolations > 0 ? 'num-fail' : 'num-ok'}">${totalViolations}</div>
      <div class="lbl">Total Violations</div>
    </div>
    <div class="sum-card">
      <div class="num" style="color:var(--gold)">WCAG 2.1</div>
      <div class="lbl">Standard</div>
    </div>
    <div class="sum-card">
      <div class="num ${totalViolations === 0 ? 'num-ok' : 'num-fail'}">${totalViolations === 0 ? '✅' : '❌'}</div>
      <div class="lbl">AA Compliance</div>
    </div>
  </div>

  <main>
    ${htmlSections}
  </main>

  <footer class="rpt-footer">
    Generated by StepArc E2E Accessibility Test Suite · Playwright + Axe-Core
  </footer>
</div>
</body>
</html>`;

  const artifactsDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

  const reportPath = path.join(artifactsDir, 'a11y_report.html');
  fs.writeFileSync(reportPath, fullHtml, 'utf-8');
  console.log(`[StepArc Tests] HTML Accessibility Report → ${reportPath}`);

  try {
    const brainDir = '/Users/Shreyas/.gemini/antigravity/brain/ecc95aad-2b6d-470c-8c80-b513c26b78e2';
    if (fs.existsSync(brainDir)) {
      fs.writeFileSync(path.join(brainDir, 'a11y_report.html'), fullHtml, 'utf-8');
    }
  } catch {}
}
