/**
 * BRYAN KUM ZHAN KIN — INTERACTIVE RUNTIME
 * Zero build-tool dependencies • Pure Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initPenangClock();
  initInteractiveTabs();
  initProjectFilters();
  initExpenseParserDemo();
  initBudgetCalculationDemo();
  initClipboard();
  initDynamicYear();
});

/* 1. Dual Theme Toggle with Persistent LocalStorage */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('bk_theme', nextTheme);
  });
}

/* 2. Real-Time Telemetry: Penang, Malaysia Local Clock */
function initPenangClock() {
  const timeBadge = document.getElementById('penang-time');
  if (!timeBadge) return;

  function updateTime() {
    try {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat([], options);
      timeBadge.textContent = `${formatter.format(now)} MYT`;
    } catch (e) {
      timeBadge.style.display = 'none';
    }
  }

  updateTime();
  setInterval(updateTime, 30000);
}

/* 3. Interactive Inspection Tabs */
function initInteractiveTabs() {
  const tabContainers = document.querySelectorAll('.interactive-tab-container');

  tabContainers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const panels = container.querySelectorAll('.tab-panel');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');

        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const activePanel = container.querySelector(`#${targetId}`);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  });
}

/* 4. Project Category Filtering */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-showcase-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const tags = card.getAttribute('data-tags') || '';
        if (filter === 'all' || tags.includes(filter)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* 5. Live Simulation: AI Natural Language Expense Parser */
function initExpenseParserDemo() {
  const runBtn = document.getElementById('ai-run-btn');
  const input = document.getElementById('ai-input');
  const output = document.getElementById('ai-output');
  const presetChips = document.querySelectorAll('.preset-chips .chip');

  if (!runBtn || !input || !output) return;

  function parseText(text) {
    output.innerHTML = `<span class="term-dim">// Parsing note through local pattern engine...</span>`;

    setTimeout(() => {
      let category = "General";
      let vendor = "Merchant";
      let amount = 0.00;

      // Extract RM amount
      const rmMatch = text.match(/(?:RM|rm|\$)\s*([\d,]+\.?\d*)/);
      if (rmMatch) {
        amount = parseFloat(rmMatch[1].replace(',', ''));
      }

      // Keyword Classification
      const lower = text.toLowerCase();
      if (lower.includes('dinner') || lower.includes('food') || lower.includes('lunch') || lower.includes('curry')) {
        category = "Food & Beverage";
      } else if (lower.includes('grab') || lower.includes('transport') || lower.includes('petrol') || lower.includes('bus')) {
        category = "Transportation";
      } else if (lower.includes('lotus') || lower.includes('groceries') || lower.includes('market')) {
        category = "Groceries & Household";
      }

      // Extract vendor heuristically
      const atMatch = text.match(/(?:at|to)\s+([A-Za-z0-9\s]+?)(?:\s+RM|\s+rm|\s*$)/i);
      if (atMatch) {
        vendor = atMatch[1].trim();
      }

      const result = {
        vendor: vendor,
        category: category,
        amount_myr: amount || 25.00,
        status: "verified_entry",
        extracted_at: new Date().toISOString()
      };

      output.innerHTML = `
        <span class="term-dim">// Parsed Extraction Output:</span>
        <pre><code>${JSON.stringify(result, null, 2)}</code></pre>
      `;
    }, 180);
  }

  runBtn.addEventListener('click', () => parseText(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') parseText(input.value);
  });

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const sample = chip.getAttribute('data-sample');
      input.value = sample;
      parseText(sample);
    });
  });
}

/* 6. Live Simulation: IBM Capstone State Calculator */
function initBudgetCalculationDemo() {
  const addBtn = document.getElementById('add-expense-btn');
  const resetBtn = document.getElementById('reset-expense-btn');
  const spentEl = document.getElementById('calc-spent');
  const remainingEl = document.getElementById('calc-remaining');

  if (!addBtn || !spentEl || !remainingEl) return;

  const budget = 2000.00;
  let currentSpent = 650.00;

  function render() {
    const remaining = budget - currentSpent;
    spentEl.textContent = `RM ${currentSpent.toFixed(2)}`;
    remainingEl.textContent = `RM ${remaining.toFixed(2)}`;

    if (remaining < 500) {
      remainingEl.style.color = '#ef4444';
    } else {
      remainingEl.style.color = 'var(--status-green)';
    }
  }

  addBtn.addEventListener('click', () => {
    if (currentSpent + 150 <= budget) {
      currentSpent += 150.00;
      render();
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentSpent = 650.00;
      render();
    });
  }
}

/* 7. 1-Click Clipboard Copy for Email */
function initClipboard() {
  const copyBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-text');
  const emailDisplay = document.getElementById('email-address');

  if (!copyBtn || !copyText || !emailDisplay) return;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(emailDisplay.textContent.trim());
      copyText.textContent = "Copied!";
      copyBtn.style.backgroundColor = "var(--status-green)";
      setTimeout(() => {
        copyText.textContent = "Copy Email";
        copyBtn.style.backgroundColor = "";
      }, 2000);
    } catch (err) {
      // Fallback
      copyText.textContent = "Press Ctrl+C";
    }
  });
}

/* 8. Dynamic Copyright Year */
function initDynamicYear() {
  const yr = document.getElementById('current-year');
  if (yr) {
    yr.textContent = new Date().getFullYear();
  }
}
