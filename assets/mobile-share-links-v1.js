(() => {
  const phone = window.matchMedia('(max-width: 767px)');
  const selector = 'input[readonly], textarea[readonly]';

  const validLink = (field) => {
    const raw = String(field.value || '').trim();
    if (!/^https?:\/\//i.test(raw)) return null;
    try {
      const url = new URL(raw, window.location.href);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  };

  const isShareField = (field) => {
    if (!validLink(field)) return false;
    return Boolean(
      field.closest('[role="dialog"], .share-dialog, .share-overlay') ||
      /share|link|url/i.test(field.id || '') ||
      /קישור|link/i.test(field.getAttribute('aria-label') || '')
    );
  };

  const markLinks = () => {
    if (!phone.matches) return;
    const isEnglish = (document.documentElement.lang || '').toLowerCase().startsWith('en');
    document.querySelectorAll(selector).forEach((field) => {
      if (!isShareField(field)) return;
      field.classList.add('mobile-openable-board-link');
      field.setAttribute('role', 'link');
      field.setAttribute('tabindex', '0');
      field.setAttribute('title', isEnglish ? 'Open the board' : 'פתיחת הלוח');
      field.setAttribute('aria-label', isEnglish ? 'Open the board link' : 'פתיחת הקישור ללוח');
    });
  };

  const openField = (field) => {
    if (!phone.matches || !isShareField(field)) return false;
    const href = validLink(field);
    if (!href) return false;
    window.location.assign(href);
    return true;
  };

  document.addEventListener('click', (event) => {
    const field = event.target.closest?.(selector);
    if (!field || !openField(field)) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const field = event.target.closest?.(selector);
    if (!field || !openField(field)) return;
    event.preventDefault();
  });

  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 767px) {
      .mobile-openable-board-link {
        cursor: pointer !important;
        color: #286149 !important;
        font-weight: 700 !important;
        text-decoration: underline !important;
        text-underline-offset: 2px;
      }
      .mobile-openable-board-link:focus-visible {
        outline: 2px solid #73b493 !important;
        outline-offset: 2px;
      }
    }
  `;
  document.head.appendChild(style);

  const observer = new MutationObserver(() => window.requestAnimationFrame(markLinks));
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'value', 'open']
  });

  phone.addEventListener?.('change', markLinks);
  document.addEventListener('focusin', markLinks);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markLinks, { once: true });
  } else {
    markLinks();
  }
})();
