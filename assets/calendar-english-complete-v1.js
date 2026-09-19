(()=>{
  if (!(location.pathname.startsWith('/en/') || document.documentElement.lang === 'en')) return;
  const translations = new Map([
    ['שמירה בגוגל', 'Save to Google Calendar'],
    ['חגים ומועדים יהודיים', 'Jewish holidays and observances'],
    ['חגים ומועדים מוסלמיים', 'Muslim holidays and observances'],
    ['חגים ומועדים נוצריים', 'Christian holidays and observances'],
    ['חופשות מערכת החינוך', 'School breaks']
  ]);
  let scheduled = false;
  const hideHebrewDates = () => {
    if (document.getElementById('calendar-english-hide-hebrew-dates')) return;
    const style = document.createElement('style');
    style.id = 'calendar-english-hide-hebrew-dates';
    style.textContent = '.calendar-sheet-range,.calendar-gregorian-day{display:none!important}';
    document.head.appendChild(style);
  };
  const translate = () => {
    scheduled = false;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const value = node.nodeValue?.trim();
      const replacement = value ? translations.get(value) : undefined;
      if (replacement) node.nodeValue = node.nodeValue.replace(value, replacement);
    }
    document.querySelectorAll('[title],[aria-label],[placeholder]').forEach((element) => {
      ['title', 'aria-label', 'placeholder'].forEach((name) => {
        const value = element.getAttribute(name);
        const replacement = value ? translations.get(value.trim()) : undefined;
        if (replacement) element.setAttribute(name, replacement);
      });
    });
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(translate);
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  hideHebrewDates();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();
})();
