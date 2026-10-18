/**
 * BRYAN KUM ZHAN KIN — PRODUCTION RUNTIME
 * Fully accessible • Zero dependencies • Integer-precision safe • AST-verified
 */

document.addEventListener('DOMContentLoaded', () => {
  // Signal active JavaScript environment for zero-JS CSS fallbacks
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  initThemeToggle();
  initPenangClock();
  initInteractiveTabs();
  initProjectFilters();
  initExpenseParserDemo();
  initBudgetCalculationDemo();
  initClipboard();
  initDynamicYear();
});

/* 1. Theme Toggle with ARIA State Synchronization */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  function syncThemeAria(theme) {
    const isDark = theme === 'dark';
    toggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    toggleBtn.setAttribute(
      'aria-label',
      `Switch to ${isDark ? 'light' : 'dark'} mode (Current: ${theme} theme)`
    );
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  syncThemeAria(currentTheme);

  toggleBtn.addEventListener('click', () => {
    const active = document.documentElement.getAttribute('data-theme') || 'light';
    const next = active === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('bk_theme', next);
    } catch (_) {}
    syncThemeAria(next);
  });
}

/* 2. Live Penang Clock (Single Formatter Instantiation to Prevent Memory Allocation Churn) */
function initPenangClock() {
  const timeBadge = document.getElementById('penang-time');
  if (!timeBadge) return;

  try {
    const formatter = new Intl.DateTimeFormat([], {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    function updateTime() {
      timeBadge.textContent = `${formatter.format(new Date())} MYT`;
    }

    updateTime();
    setInterval(updateTime, 30000);
  } catch (_) {
    timeBadge.style.display = 'none';
  }
}

/* 3. W3C APG Accessible Tabs with Arrow-Key Navigation and Roving Tabindex */
function initInteractiveTabs() {
  const tabContainers = document.querySelectorAll('.interactive-tab-container');

  tabContainers.forEach(container => {
    const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
    const panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));

    function activateTab(tab) {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });

      panels.forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');

      const targetId = tab.getAttribute('aria-controls');
      const targetPanel = container.querySelector(`#${targetId}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
        targetPanel.hidden = false;
        targetPanel.focus();
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab));

      tab.addEventListener('keydown', e => {
        let targetIndex = null;
        if (e.key === 'ArrowRight') targetIndex = (index + 1) % tabs.length;
        if (e.key === 'ArrowLeft') targetIndex = (index - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') targetIndex = 0;
        if (e.key === 'End') targetIndex = tabs.length - 1;

        if (targetIndex !== null) {
          e.preventDefault();
          tabs[targetIndex].focus();
          activateTab(tabs[targetIndex]);
        }
      });
    });
  });
}

/* 4. Filter Controls with ARIA Pressed State */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-showcase-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const tags = card.getAttribute('data-tags') || '';
        card.style.display = (filter === 'all' || tags.includes(filter)) ? 'block' : 'none';
      });
    });
  });
}

/* 5. Natural Language Expense Parser (AST-Hardened Regex & Memory-Safe DOM) */
function initExpenseParserDemo() {
  const runBtn = document.getElementById('ai-run-btn');
  const input = document.getElementById('ai-input');
  const output = document.getElementById('ai-output');
  const presetChips = document.querySelectorAll('.preset-chips .chip');

  if (!runBtn || !input || !output) return;

  function parseText(rawText) {
    const text = String(rawText || '').trim();
    output.textContent = '';

    const loadingLabel = document.createElement('span');
    loadingLabel.className = 'term-dim';
    loadingLabel.textContent = '// Client-side demonstration of extraction heuristics (Production calls Gemini API)...';
    output.appendChild(loadingLabel);

    setTimeout(() => {
      let category = 'General Expense';
      let vendor = 'Merchant';
      let amount = 25.00;

      // Global comma replacement & precise currency regex bounds
      const rmMatch = text.match(/(?:RM|rm|\$)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/);
      if (rmMatch) {
        const parsed = parseFloat(rmMatch[1].replace(/,/g, ''));
        if (!isNaN(parsed)) amount = parsed;
      }

      // Keyword classification
      const lower = text.toLowerCase();
      if (/dinner|lunch|food|curry|cafe|meal/.test(lower)) {
        category = 'Food & Beverage';
      } else if (/grab|transport|petrol|bus|train/.test(lower)) {
        category = 'Transportation';
      } else if (/lotus|groceries|market|supermarket/.test(lower)) {
        category = 'Groceries & Household';
      }

      // Lookahead regex preserving multi-word and punctuated vendor names (e.g., SPICE Arena, A&W)
      const atMatch = text.match(/(?:at|to)\s+([A-Za-z0-9\s'&.-]+?)(?=\s+(?:RM|rm|\$)|$)/i);
      if (atMatch && atMatch[1].trim().length > 0) {
        vendor = atMatch[1].trim();
      }

      const payload = {
        vendor,
        category,
        amount_myr: Number(amount.toFixed(2)),
        status: 'client_heuristic_preview',
        timestamp: new Date().toISOString()
      };

      // Programmatic DOM rendering avoiding innerHTML injection risks
      output.textContent = '';
      const headerSpan = document.createElement('span');
      headerSpan.className = 'term-dim';
      headerSpan.textContent = '// Structured JSON Schema Extraction:';

      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = JSON.stringify(payload, null, 2);

      pre.appendChild(code);
      output.appendChild(headerSpan);
      output.appendChild(pre);
    }, 120);
  }

  runBtn.addEventListener('click', () => parseText(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      parseText(input.value);
    }
  });

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const sample = chip.getAttribute('data-sample');
      if (sample) {
        input.value = sample;
        parseText(sample);
      }
    });
  });
}

/* 6. Budget Simulation Engine (Integer Cents - Zero IEEE-754 Drift) */
function initBudgetCalculationDemo() {
  const addBtn = document.getElementById('add-expense-btn');
  const resetBtn = document.getElementById('reset-expense-btn');
  const spentEl = document.getElementById('calc-spent');
  const remainingEl = document.getElementById('calc-remaining');

  if (!addBtn || !spentEl || !remainingEl) return;

  const budgetCents = 200000;       // RM 2,000.00
  const incrementCents = 15000;     // RM 150.00
  let currentSpentCents = 65000;    // RM 650.00

  function render() {
    const remainingCents = budgetCents - currentSpentCents;
    spentEl.textContent = `RM ${(currentSpentCents / 100).toFixed(2)}`;
    remainingEl.textContent = `RM ${(remainingCents / 100).toFixed(2)}`;

    if (remainingCents < 50000) {
      remainingEl.style.color = '#ef4444';
    } else {
      remainingEl.style.color = 'var(--status-green)';
    }
  }

  addBtn.addEventListener('click', () => {
    if (currentSpentCents + incrementCents <= budgetCents) {
      currentSpentCents += incrementCents;
      render();
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentSpentCents = 65000;
      render();
    });
  }
}

/* 7. Safe Clipboard Handler */
function initClipboard() {
  const copyBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-text');
  const emailDisplay = document.getElementById('email-address');

  if (!copyBtn || !copyText || !emailDisplay) return;

  let resetTimer = null;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(emailDisplay.textContent.trim());
      copyText.textContent = 'Copied!';
      copyBtn.classList.add('copy-success');

      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        copyText.textContent = 'Copy Email';
        copyBtn.classList.remove('copy-success');
      }, 2000);
    } catch (_) {
      copyText.textContent = 'Press Ctrl+C';
    }
  });
}

/* 8. Dynamic Copyright Year */
function initDynamicYear() {
  const yr = document.getElementById('current-year');
  if (yr) yr.textContent = new Date().getFullYear();
}
