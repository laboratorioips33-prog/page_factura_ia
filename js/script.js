(() => {
  'use strict';

  const root = document.querySelector('[data-fia-root]');
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';
  root.classList.add('js-ready');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = root.querySelector('[data-header]');
  const progress = root.querySelector('.scroll-progress');
  const toTop = root.querySelector('[data-to-top]');
  let scrollFrame = null;

  function updateScrollState() {
    scrollFrame = null;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    header?.classList.toggle('is-scrolled', scrollY > 12);
    toTop?.classList.toggle('show', scrollY > 520);

    if (progress) {
      const documentElement = document.documentElement;
      const maxScroll = Math.max(1, documentElement.scrollHeight - documentElement.clientHeight);
      progress.style.width = `${Math.min(100, (scrollY / maxScroll) * 100)}%`;
    }
  }

  function requestScrollUpdate() {
    if (scrollFrame !== null) return;
    scrollFrame = window.requestAnimationFrame(updateScrollState);
  }

  updateScrollState();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });

  toTop?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  });

  root.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  /* Reveal animations */
  const revealElements = [...root.querySelectorAll('[data-reveal]')];
  revealElements.forEach((element, index) => {
    if (!element.style.getPropertyValue('--reveal-delay')) {
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 55}ms`);
    }
  });

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -45px' }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('in'));
  }

  /* Mobile navigation */
  const menuButton = root.querySelector('.menu-toggle');
  const mobileMenu = root.querySelector('.mobile-menu');

  function setMenuState(open) {
    if (!menuButton || !mobileMenu) return;

    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('open', open);
  }

  function closeMenu() {
    setMenuState(false);
  }

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener(
    'resize',
    () => {
      if (window.innerWidth > 920) closeMenu();
    },
    { passive: true }
  );

  /* Active navigation state */
  const navLinks = [...root.querySelectorAll('[data-nav-link]')];
  const linkBySection = new Map(
    navLinks
      .map((link) => {
        const href = link.getAttribute('href') || '';
        return href.startsWith('#') ? [href.slice(1), link] : null;
      })
      .filter(Boolean)
  );

  const observedSections = [...root.querySelectorAll('[data-section]')].filter((section) =>
    linkBySection.has(section.id)
  );

  if ('IntersectionObserver' in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => link.classList.remove('active'));
        linkBySection.get(visible.target.id)?.classList.add('active');
      },
      { rootMargin: '-38% 0px -52% 0px', threshold: [0.01, 0.15, 0.35] }
    );

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  /* Accessible specialist tabs */
  root.querySelectorAll('[data-specialist-tabs]').forEach((tabGroup) => {
    const tabs = [...tabGroup.querySelectorAll('[role="tab"]')];
    const panels = [...tabGroup.querySelectorAll('[role="tabpanel"]')];

    function activateTab(tab, focus = false) {
      const key = tab.dataset.specialist;

      tabs.forEach((candidate) => {
        const active = candidate === tab;
        candidate.setAttribute('aria-selected', String(active));
        candidate.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel) => {
        const active = panel.dataset.panel === key;
        panel.hidden = !active;
        panel.classList.toggle('active', active);
      });

      if (focus) tab.focus();
    }

    tabs.forEach((tab, index) => {
      tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;

      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();

        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;

        activateTab(tabs[nextIndex], true);
      });
    });
  });

  /* FAQ accordion */
  root.querySelectorAll('[data-faq]').forEach((faq) => {
    const questions = [...faq.querySelectorAll('.faq-question')];

    function closeQuestion(question) {
      question.setAttribute('aria-expanded', 'false');
      const panelId = question.getAttribute('aria-controls');
      if (panelId) root.querySelector(`#${CSS.escape(panelId)}`)?.classList.remove('open');
    }

    function openQuestion(question) {
      question.setAttribute('aria-expanded', 'true');
      const panelId = question.getAttribute('aria-controls');
      if (panelId) root.querySelector(`#${CSS.escape(panelId)}`)?.classList.add('open');
    }

    questions.forEach((question) => {
      question.addEventListener('click', () => {
        const wasOpen = question.getAttribute('aria-expanded') === 'true';
        questions.forEach(closeQuestion);
        if (!wasOpen) openQuestion(question);
      });
    });
  });

  /* Demo modal */
  const modal = root.querySelector('[data-demo-modal]');
  const modalOpeners = [...root.querySelectorAll('[data-open-demo]')];
  const modalCloser = root.querySelector('[data-close-demo]');
  const modalCloseLink = root.querySelector('[data-close-demo-link]');
  let previousFocus = null;

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function openModal() {
    if (!modal) return;

    closeMenu();
    previousFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    window.setTimeout(() => modalCloser?.focus(), prefersReducedMotion ? 0 : 40);
  }

  function closeModal({ restoreFocus = true } = {}) {
    if (!modal) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (restoreFocus && previousFocus instanceof HTMLElement) previousFocus.focus();
  }

  modalOpeners.forEach((button) => button.addEventListener('click', openModal));
  modalCloser?.addEventListener('click', () => closeModal());
  modalCloseLink?.addEventListener('click', () => closeModal({ restoreFocus: false }));

  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('open')) {
      event.preventDefault();
      closeModal();
    }
  });

  modal?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;

    const focusable = [...modal.querySelectorAll(focusableSelector)].filter(
      (element) => !element.hasAttribute('disabled') && element.offsetParent !== null
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* Character-specific parallax. The assistants move at different depths,
     so the hero feels like a composed scene instead of a generic card. */
  const teamStage = root.querySelector('[data-team-stage]');
  const heroAvatars = teamStage ? [...teamStage.querySelectorAll('[data-hero-avatar]')] : [];
  let parallaxFrame = null;

  function resetTeamParallax() {
    heroAvatars.forEach((avatar) => {
      const motion = avatar.querySelector('.avatar-motion');
      motion?.style.removeProperty('--parallax-x');
      motion?.style.removeProperty('--parallax-y');
    });
  }

  if (
    teamStage &&
    heroAvatars.length &&
    !prefersReducedMotion &&
    window.matchMedia('(pointer: fine)').matches
  ) {
    teamStage.addEventListener('pointermove', (event) => {
      if (parallaxFrame !== null) window.cancelAnimationFrame(parallaxFrame);

      const rect = teamStage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      parallaxFrame = window.requestAnimationFrame(() => {
        heroAvatars.forEach((avatar) => {
          const depth = Number.parseFloat(avatar.dataset.depth || '1');
          const motion = avatar.querySelector('.avatar-motion');
          if (!motion) return;

          motion.style.setProperty('--parallax-x', `${x * 13 * depth}px`);
          motion.style.setProperty('--parallax-y', `${y * 8 * depth}px`);
        });
        parallaxFrame = null;
      });
    });

    teamStage.addEventListener('pointerleave', resetTeamParallax);
  }

  /* The ecosystem activates one specialist at a time and sends a visible
     data pulse toward the Factura IA hub. Hovering a specialist takes control. */
  const network = root.querySelector('[data-network]');

  if (network) {
    const specialistOrder = ['rosario', 'fatima', 'hector', 'jaimito'];
    const nodes = [...network.querySelectorAll('[data-network-node]')];
    const links = [...network.querySelectorAll('[data-network-link]')];
    let activeIndex = 0;
    let networkTimer = null;
    let networkVisible = true;
    let networkHeld = false;

    function activateSpecialist(key) {
      const index = specialistOrder.indexOf(key);
      if (index >= 0) activeIndex = index;

      network.dataset.active = key;

      nodes.forEach((node) => {
        node.classList.toggle('is-active', node.dataset.networkNode === key);
      });

      links.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.networkLink === key);
      });
    }

    function stopNetworkCycle() {
      window.clearInterval(networkTimer);
      networkTimer = null;
    }

    function startNetworkCycle() {
      stopNetworkCycle();
      if (prefersReducedMotion || !networkVisible || networkHeld || document.hidden) return;

      networkTimer = window.setInterval(() => {
        activeIndex = (activeIndex + 1) % specialistOrder.length;
        activateSpecialist(specialistOrder[activeIndex]);
      }, 2600);
    }

    nodes.forEach((node) => {
      node.addEventListener('pointerenter', () => {
        networkHeld = true;
        stopNetworkCycle();
        activateSpecialist(node.dataset.networkNode);
      });

      node.addEventListener('pointerleave', () => {
        networkHeld = false;
        startNetworkCycle();
      });
    });

    if ('IntersectionObserver' in window) {
      const networkObserver = new IntersectionObserver(
        ([entry]) => {
          networkVisible = Boolean(entry?.isIntersecting);
          if (networkVisible) startNetworkCycle();
          else stopNetworkCycle();
        },
        { threshold: 0.22 }
      );

      networkObserver.observe(network);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopNetworkCycle();
      else startNetworkCycle();
    });

    activateSpecialist(specialistOrder[0]);
    startNetworkCycle();
  }
})();
