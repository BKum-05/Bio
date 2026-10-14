document.addEventListener('DOMContentLoaded', () => {
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const hasScrollSmoother = typeof window.ScrollSmoother !== 'undefined';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  updateDynamicDate();
  initFooter();
  initActiveNav();
  initMobileNav();
  initProgressBar();
  initRevealObserver();
  initAnnotationAnimation();
  initCinematicScroll();
  initEducationTimeline();

  function updateDynamicDate() {
    const dateEl = document.getElementById('dynamic-date');
    if (!dateEl) return;

    const now = new Date();
    const formatted = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    dateEl.textContent = `Updated ${formatted}`;
  }

  function initAnnotationAnimation() {
    const annotationText = document.querySelector('.annotation-text');
    if (!annotationText || annotationText.dataset.split === 'true') return;

    const originalText = annotationText.textContent.trim();
    if (!originalText) return;

    annotationText.setAttribute('aria-label', originalText);
    
    // Store original text first before clearing
    const textToDisplay = originalText;
    annotationText.textContent = '';

    [...textToDisplay].forEach((character, index) => {
      const span = document.createElement('span');
      span.className = 'annotation-char';
      span.style.setProperty('--char-index', index);

      if (character === ' ') {
        span.classList.add('annotation-space');
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = character;
      }

      annotationText.appendChild(span);
    });

    annotationText.dataset.split = 'true';
  }

  function getFooterFallbackMarkup() {
    return `
      <div class="social-sidebar">
        <a href="https://github.com/BKum-05" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub profile">
          <i class="fa-brands fa-github"></i>
        </a>
        <a href="https://www.linkedin.com/in/bryan-kum-11b184330" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn profile">
          <i class="fa-brands fa-linkedin"></i>
        </a>
        <a href="mailto:bryankzk-pm23@student.tarc.edu.my?subject=Bryan%20Kum%20Portfolio" title="Email" aria-label="Send email to Bryan Kum">
          <i class="fa-solid fa-envelope"></i>
        </a>
      </div>
      <p>© 2023 – <span id="current-year"></span> Bryan Kum — Built with Passion from Malaysia</p>
    `;
  }

  function syncFooterYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  function mountSocialSidebarToBody(footerContainer) {
    const sidebar = footerContainer.querySelector('.social-sidebar');
    if (!sidebar) return;

    const existingGlobalSidebar = document.querySelector('.social-sidebar.global-social-sidebar');
    if (existingGlobalSidebar) {
      existingGlobalSidebar.remove();
    }

    const existingInlineSidebar = footerContainer.querySelector('.social-sidebar-inline');
    if (existingInlineSidebar) {
      existingInlineSidebar.remove();
    }

    const inlineSidebar = sidebar.cloneNode(true);
    inlineSidebar.classList.add('social-sidebar-inline');
    footerContainer.insertBefore(inlineSidebar, footerContainer.firstChild);

    sidebar.classList.add('global-social-sidebar');
    document.body.appendChild(sidebar);
  }

  async function initFooter() {
    const footerContainer = document.getElementById('main-footer');
    if (!footerContainer) return;

    try {
      // Add loading state
      footerContainer.style.opacity = '0.6';
      
      const response = await fetch('footer.html');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const footerMarkup = await response.text();
      footerContainer.innerHTML = footerMarkup.trim() || getFooterFallbackMarkup();
      footerContainer.style.opacity = '1';
      
      syncFooterYear();
      mountSocialSidebarToBody(footerContainer);
    } catch (error) {
      console.warn('Footer fetch failed, using fallback:', error.message);
      footerContainer.innerHTML = getFooterFallbackMarkup();
      footerContainer.style.opacity = '1';
      syncFooterYear();
      mountSocialSidebarToBody(footerContainer);
    }
  }

  function initActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('#mobile-menu a');

    if (!hamburger || !mobileMenu) return;

    const toggleMenu = (forceState) => {
      const isOpening = typeof forceState === 'boolean' ? forceState : !mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', isOpening);
      hamburger.textContent = isOpening ? '✕' : '☰';
      hamburger.setAttribute('aria-expanded', String(isOpening));
      document.body.style.overflow = isOpening ? 'hidden' : 'auto';
    };

    hamburger.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMenu();
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('click', (event) => {
      const clickedOutside = !mobileMenu.contains(event.target) && !hamburger.contains(event.target);
      if (mobileMenu.classList.contains('open') && clickedOutside) {
        toggleMenu(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 850 && mobileMenu.classList.contains('open')) {
        toggleMenu(false);
      }
    });
  }

  function initProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;

    let current = 0;
    let target = 0;
    let ticking = false;

    const updateTarget = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      target = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    };

    const animateProgress = () => {
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.05) {
        current = target;
      }

      progressBar.style.width = `${current}%`;

      if (Math.abs(target - current) >= 0.05) {
        requestAnimationFrame(animateProgress);
      } else {
        ticking = false;
      }
    };

    const handleScrollProgress = () => {
      updateTarget();
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(animateProgress);
      }
    };

    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    window.addEventListener('resize', handleScrollProgress);
    handleScrollProgress();
  }

  function initRevealObserver() {
    const revealTargets = document.querySelectorAll('.page-header, .card, .project-card, .cert-item');
    if (!revealTargets.length) return;

    const canObserve = 'IntersectionObserver' in window;
    if (prefersReducedMotion || !canObserve) {
      revealTargets.forEach((el) => el.classList.add('show'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    });

    revealTargets.forEach((el) => {
      el.classList.add('reveal-init');
      revealObserver.observe(el);
    });
  }

  function initCinematicScroll() {
    if (!hasGSAP || !hasScrollSmoother || prefersReducedMotion) return;

    const wrapper = document.getElementById('smooth-wrapper');
    const content = document.getElementById('smooth-content');
    if (!wrapper || !content) return;

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const existingSmoother = ScrollSmoother.get();
    if (existingSmoother) {
      existingSmoother.kill();
    }

    ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.45,
      smoothTouch: 0.2,
      normalizeScroll: true,
    });
  }

  function initEducationTimeline() {
    const timeline = document.querySelector('.timeline-container');
    const filler = document.querySelector('.timeline-filler');
    if (!timeline || !filler) return;

    if (!hasGSAP || prefersReducedMotion) {
      filler.style.height = '100%';
      document.querySelectorAll('.timeline-item').forEach((item) => item.classList.add('show'));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const timelineItems = gsap.utils.toArray('.timeline-item');
    gsap.set(filler, { height: '0%' });

    gsap.fromTo(
      filler,
      { height: '0%' },
      {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: timeline,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      }
    );

    timelineItems.forEach((item, index) => {
      gsap.fromTo(
        item,
        {
          autoAlpha: 0,
          x: index % 2 === 0 ? -72 : 72,
          y: 28,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top 84%',
            end: 'top 46%',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    ScrollTrigger.refresh();
  }

  // Image Error Handling - Replace failed CDN images with fallback
  function initImageErrorHandling() {
    const images = document.querySelectorAll('img[src*=\"svgrepo\"], img[src*=\"worldvectorlogo\"], img[src*=\"wikimedia\"], img[src*=\"uxwing\"], img[src*=\"worldvectorlogo\"]');
    images.forEach((img) => {
      img.addEventListener('error', () => {
        // Create a simple colored placeholder
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.style.width = getComputedStyle(img).width;
        span.style.height = getComputedStyle(img).height;
        span.style.backgroundColor = 'rgba(129, 140, 248, 0.2)';
        span.style.borderRadius = '4px';
        span.title = `Image failed to load: ${img.alt || 'Unknown'}`;
        img.replaceWith(span);
      }, { once: true });
    });
  }

  // Initialize all features
  initImageErrorHandling();

  // ===== QOL IMPROVEMENTS =====

  // 1. Scroll-to-Top Button
  function initScrollToTop() {
    const btn = document.getElementById('scroll-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 300);
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 2. Theme Toggle (Dark/Light Mode)
  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      toggle.textContent = '☀️';
    }

    toggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      toggle.textContent = isLight ? '☀️' : '🌙';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }

  // 3. Copy Email to Clipboard
  function initEmailCopy() {
    const email = 'bryankzk-pm23@student.tarc.edu.my';
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    
    emailLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(email).then(() => {
          const original = link.textContent;
          link.textContent = 'Copied! ✓';
          setTimeout(() => {
            link.textContent = original;
          }, 2000);
        });
      });
    });
  }

  // 4. Resume Preview Modal
  function initResumeModal() {
    const resumeBtn = document.querySelector('a[href*="Resume"]');
    const modal = document.getElementById('resume-modal');
    const closeBtn = document.getElementById('resume-close');
    
    if (resumeBtn && modal) {
      resumeBtn.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return; // Allow normal download with modifiers
        e.preventDefault();
        modal.classList.add('show');
      });

      closeBtn?.addEventListener('click', () => {
        modal.classList.remove('show');
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    }
  }

  // 5. Tech Stack Filter
  function initTechFilter() {
    const projects = document.querySelectorAll('.project-card');
    if (projects.length === 0) return;

    // Collect unique tech stacks
    const techs = new Set();
    projects.forEach(card => {
      const badges = card.querySelectorAll('.tech-badge');
      badges.forEach(badge => {
        techs.add(badge.textContent.trim());
      });
    });

    // Create filter container if it doesn't exist
    const section = document.querySelector('#projects');
    if (section && techs.size > 0) {
      const filterContainer = document.createElement('div');
      filterContainer.className = 'filter-container';
      filterContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All Projects</button>';
      
      techs.forEach(tech => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = tech;
        btn.dataset.filter = tech;
        filterContainer.appendChild(btn);
      });

      section.insertBefore(filterContainer, projects[0]);

      // Filter functionality
      filterContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-btn')) return;

        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        e.target.classList.add('active');

        const filter = e.target.dataset.filter;
        projects.forEach(card => {
          if (filter === 'all') {
            card.classList.remove('hidden');
          } else {
            const hasTech = Array.from(card.querySelectorAll('.tech-badge'))
              .some(badge => badge.textContent.trim() === filter);
            card.classList.toggle('hidden', !hasTech);
          }
        });
      });
    }
  }

  // 6. Animated Counters
  function initAnimatedCounters() {
    const counterElements = document.querySelectorAll('.counter');
    if (counterElements.length === 0) return;

    const animateCounter = (element) => {
      const target = parseInt(element.dataset.target) || parseInt(element.textContent);
      const duration = 2000;
      const start = Date.now();

      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(target * progress);
        element.textContent = current + (element.textContent.match(/[^\d]/)?.[0] || '');

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });

    counterElements.forEach(el => observer.observe(el));
  }

  // 7. Search Functionality
  function initSearch() {
    const searchToggle = document.getElementById('theme-toggle');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    
    if (!searchToggle || !searchContainer || !searchInput) return;

    // Toggle search with keyboard shortcut (Cmd/Ctrl + K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchContainer.classList.toggle('show');
        searchInput.focus();
      }
    });

    // Search projects and skills
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const projects = document.querySelectorAll('.project-card');
      const certs = document.querySelectorAll('.cert-item');

      [...projects, ...certs].forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) || query === '' ? '' : 'none';
      });
    });

    // Close search with Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchContainer.classList.remove('show');
        searchInput.value = '';
      }
    });
  }

  // 8. Social Share Buttons
  function initSocialShare() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      if (card.querySelector('.share-btn')) return; // Already has share button

      const shareBtn = document.createElement('button');
      shareBtn.className = 'share-btn';
      shareBtn.innerHTML = '<i class="fa-solid fa-share-alt"></i> Share';
      
      shareBtn.addEventListener('click', async () => {
        const title = card.querySelector('h3')?.textContent || 'Check this project';
        const url = window.location.href;

        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text: title,
              url
            });
          } catch (err) {
            if (err.name !== 'AbortError') console.log('Share failed:', err);
          }
        } else {
          // Fallback: Copy to clipboard
          navigator.clipboard.writeText(`${title}\n${url}`).then(() => {
            shareBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            setTimeout(() => {
              shareBtn.innerHTML = '<i class="fa-solid fa-share-alt"></i> Share';
            }, 2000);
          });
        }
      });

      const meta = card.querySelector('.project-meta');
      if (meta) {
        meta.appendChild(shareBtn);
      }
    });
  }

  // 9. Staggered Reveal Index
  function initStaggeredReveal() {
    const revealElements = document.querySelectorAll('.reveal-init');
    revealElements.forEach((el, index) => {
      el.style.setProperty('--reveal-index', index);
    });
  }

  // 10. Parallax on Hero Section
  function initParallax() {
    const heroText = document.querySelector('.hero-text h1');
    if (!heroText) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < 500) {
        heroText.style.transform = `translateY(${scrollY * 0.1}px)`;
      }
    });
  }

  // 11. Interactive Timeline - Click to Highlight
  function initInteractiveTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
      item.addEventListener('click', () => {
        timelineItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  // 12. Analytics - Track page views
  function initAnalytics() {
    // Simple view tracking (can be replaced with Google Analytics)
    const pages = {
      '/index.html': 'Home',
      '/certifications.html': 'Certifications'
    };

    const currentPage = Object.keys(pages).find(key => window.location.pathname.includes(key)) || 'Unknown';
    console.log(`📊 Page view: ${pages[currentPage] || currentPage}`);

    // Track time on page
    let timeOnPage = 0;
    setInterval(() => {
      timeOnPage += 1;
      if (timeOnPage % 30 === 0) {
        console.log(`⏱️ Time on page: ${timeOnPage}s`);
      }
    }, 1000);
  }

  // 13. Mobile Menu Animation (already exists, enhanced with animation)
  function enhanceMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  // Initialize all QoL features
  initScrollToTop();
  initThemeToggle();
  initEmailCopy();
  initResumeModal();
  // initTechFilter(); // Disabled - no filter for featured projects
  initAnimatedCounters();
  initSearch();
  initSocialShare();
  initStaggeredReveal();
  initParallax();
  initInteractiveTimeline();
  initAnalytics();
  enhanceMobileMenu();
});