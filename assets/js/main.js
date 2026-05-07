// SVFSearch — interactive enhancements

// ─── Shared ease-out cubic helper ─────────────
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// ─── Generic number counter animation ─────────
function animateCounter(el, target, duration, suffix) {
  const startTime = performance.now();
  const run = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = (easeOutCubic(progress) * target).toFixed(1);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

// ─── Smooth-reveal on scroll ──────────────────
const revealTargets = document.querySelectorAll(
  '.stat-card, .protocol-card, .code-card, .case-card, .retrieval-item, .categories-full, .milestone-card'
);

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealTargets.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    io.observe(el);
  });
}

// ─── Milestone score counters on scroll ───────
const milestoneWrap = document.querySelector('.milestone-cards');
if (milestoneWrap && 'IntersectionObserver' in window) {
  const scores = milestoneWrap.querySelectorAll('.milestone-score[data-target]');

  const milestoneIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      scores.forEach((el, i) => {
        const target = parseFloat(el.dataset.target);
        setTimeout(() => animateCounter(el, target, 1000, '%'), i * 220);
      });
      milestoneIO.disconnect();
    }
  }, { threshold: 0.4 });

  milestoneIO.observe(milestoneWrap);
}

// ─── Animate performance bars + labels on scroll
const barWrap = document.querySelector('.perf-bars');
if (barWrap && 'IntersectionObserver' in window) {
  const bars = barWrap.querySelectorAll('.perf-bar');
  const widths = Array.from(bars).map((b) => b.style.width);
  const labels = Array.from(bars).map((b) => b.querySelector('span'));

  // Start all bars at 0
  bars.forEach((b) => { b.style.width = '0'; });

  const barIO = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        bars.forEach((b, i) => {
          const targetPct = parseFloat(widths[i]);
          setTimeout(() => {
            b.style.width = widths[i];
            if (labels[i]) {
              animateCounter(labels[i], targetPct, 500, '%');
            }
          }, i * 100);
        });
        barIO.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  barIO.observe(barWrap);
}

// ─── Staggered table row entrance animation ────
const tableBody = document.querySelector('.results-table tbody');
if (tableBody && 'IntersectionObserver' in window) {
  const dataRows = tableBody.querySelectorAll('tr:not(.section-header)');

  dataRows.forEach((row, i) => {
    const delay = Math.min(i * 0.04, 0.5);
    row.style.opacity = '0';
    row.style.transform = 'translateX(-8px)';
    row.style.transition = `opacity .35s ease ${delay}s, transform .35s ease ${delay}s`;
  });

  const rowIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateX(0)';
        rowIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  dataRows.forEach((row) => rowIO.observe(row));
}

// ─── Scroll progress bar ──────────────────────
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
  const updateProgress = () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    scrollProgress.style.width = pct.toFixed(2) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ─── Generic numeric counter (stat + ds cards) ─
function formatCount(value, fmt, suffix) {
  const n = Math.round(value);
  const str = fmt === 'comma' ? n.toLocaleString('en-US') : String(n);
  return str + (suffix || '');
}
function animateCountEl(el) {
  const target = parseFloat(el.dataset.count);
  const fmt    = el.dataset.fmt    || '';
  const suffix = el.dataset.suffix || '';
  const t0     = performance.now();
  const run = (now) => {
    const p = Math.min((now - t0) / 1200, 1);
    el.textContent = formatCount(easeOutCubic(p) * target, fmt, suffix);
    if (p < 1) requestAnimationFrame(run);
    else el.textContent = formatCount(target, fmt, suffix);
  };
  requestAnimationFrame(run);
}
const countEls = document.querySelectorAll('[data-count]');
if (countEls.length && 'IntersectionObserver' in window) {
  const cntIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCountEl(e.target); cntIO.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  countEls.forEach(el => cntIO.observe(el));
}

// ─── Section title underline sweep ────────────
if ('IntersectionObserver' in window) {
  const titleIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('title-visible');
        titleIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.section-title').forEach(t => titleIO.observe(t));
}

// ─── Pipeline steps sequential entrance ───────
const pipelineList = document.querySelector('.pipeline-list');
if (pipelineList && 'IntersectionObserver' in window) {
  const steps = pipelineList.querySelectorAll('li');
  steps.forEach((s, i) => {
    s.style.opacity = '0';
    s.style.transform = 'translateX(-22px)';
    s.style.transition = `opacity .45s ease ${i * 0.2}s, transform .45s ease ${i * 0.2}s`;
  });
  const plIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      steps.forEach(s => { s.style.opacity = '1'; s.style.transform = 'translateX(0)'; });
      plIO.disconnect();
    }
  }, { threshold: 0.2 });
  plIO.observe(pipelineList);
}

// ─── Findings list stagger ─────────────────────
const findingsList = document.querySelector('.findings-list');
if (findingsList && 'IntersectionObserver' in window) {
  const items = findingsList.querySelectorAll('li');
  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-14px)';
    item.style.transition = `opacity .4s ease ${i * 0.14}s, transform .4s ease ${i * 0.14}s`;
  });
  const flIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      items.forEach(item => { item.style.opacity = '1'; item.style.transform = 'translateX(0)'; });
      flIO.disconnect();
    }
  }, { threshold: 0.15 });
  flIO.observe(findingsList);
}

// ─── Copy BibTeX on click ─────────────────────
const bibtex = document.querySelector('.bibtex-block');
if (bibtex) {
  bibtex.style.cursor = 'pointer';
  bibtex.title = 'Click to copy';

  bibtex.addEventListener('click', () => {
    navigator.clipboard.writeText(bibtex.innerText).then(() => {
      const orig = bibtex.style.outline;
      bibtex.style.outline = '2px solid #5b4fcf';
      setTimeout(() => { bibtex.style.outline = orig; }, 800);
    });
  });
}
