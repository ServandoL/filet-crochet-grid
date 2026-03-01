// Development-only axe-core accessibility audit.
// This file is replaced by axe-init.prod.ts (no-op) in production builds.
import axe from 'axe-core';

axe.configure({ reporter: 'v2' });

// Run an audit on the next tick after every navigation / click so the DOM
// is fully rendered before axe inspects it.
let scheduled = false;
function scheduleAudit(): void {
  if (scheduled) return;
  scheduled = true;
  setTimeout(() => {
    scheduled = false;
    void axe.run(document, {}, (err, results) => {
      if (err) throw err;
      if (!results.violations.length) return;
      console.group(`%c[axe-core] ${results.violations.length} violation(s)`, 'color:red;font-weight:bold');
      results.violations.forEach((v) => {
        console.warn(`[${v.impact?.toUpperCase()}] ${v.description}`);
        console.warn('  Help:', v.helpUrl);
        v.nodes.forEach((n) => console.warn('  Node:', n.html));
      });
      console.groupEnd();
    });
  }, 500);
}

document.addEventListener('click', scheduleAudit, { passive: true });
// Also audit on initial load
scheduleAudit();

