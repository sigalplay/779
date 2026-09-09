(() => {
  const isSharedCalendar = () => location.pathname.replace(/\/$/, '') === '/shared/hebrew-calendar';
  if (!isSharedCalendar()) return;

  const storageKey = `boo_shared_calendar_passed_${location.search}`;
  const read = () => {
    try { return new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')); }
    catch { return new Set(); }
  };
  const write = (values) => {
    try { localStorage.setItem(storageKey, JSON.stringify([...values])); } catch {}
  };

  const apply = () => {
    const passed = read();
    document.querySelectorAll('.shared-hebrew-calendar .hebrew-calendar-sheet').forEach((sheet, monthIndex) => {
      let dayIndex = 0;
      sheet.querySelectorAll('.calendar-day:not(.calendar-day-empty)').forEach((day) => {
        const key = `${monthIndex}-${dayIndex++}`;
        day.disabled = false;
        day.dataset.passedDayKey = key;
        day.setAttribute('aria-pressed', passed.has(key) ? 'true' : 'false');
        day.title = 'לחצו כדי לסמן שהיום עבר';
        day.classList.toggle('calendar-day-passed', passed.has(key));
      });
    });
  };

  document.addEventListener('click', (event) => {
    const day = event.target.closest('.shared-hebrew-calendar .calendar-day[data-passed-day-key]');
    if (!day) return;
    const passed = read();
    const key = day.dataset.passedDayKey;
    if (passed.has(key)) passed.delete(key); else passed.add(key);
    write(passed);
    day.classList.toggle('calendar-day-passed', passed.has(key));
    day.setAttribute('aria-pressed', passed.has(key) ? 'true' : 'false');
  });

  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
})();
