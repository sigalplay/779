(() => {
  const addCloseButton = (popover) => {
    if (popover.querySelector(".difficulty-tip-close")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "difficulty-tip-close";
    button.setAttribute("aria-label", "סגירת חלון ההסבר");
    button.textContent = "×";
    button.addEventListener("click", () => {
      popover.closest("details")?.removeAttribute("open");
    });
    popover.prepend(button);
  };

  const update = () => {
    document.querySelectorAll(".difficulty-tip-popover").forEach(addCloseButton);
  };

  update();
  new MutationObserver(update).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  const installPrintMargins = () => {
    document.querySelector(`style[data-standard-print-margins]`)?.remove();
    const style = document.createElement("style");
    style.dataset.standardPrintMargins = "true";
    style.textContent = `@media print {
      @page { size: A4 portrait; margin: 12mm; }
      @page family-calendar { size: A4 portrait; margin: 12mm; }
      @page activity-page { size: A4 portrait; margin: 12mm; }
      @page routine-page { size: A4 portrait; margin: 12mm; }
      @page social-story-full { size: A4 portrait; margin: 12mm; }
      @page weekly-landscape { size: A4 landscape; margin: 12mm; }
    }`;
    document.head.appendChild(style);
  };

  const installCompactHolidayShortcut = () => {
    document.querySelector(`style[data-compact-holiday-shortcut]`)?.remove();
    const style = document.createElement("style");
    style.dataset.compactHolidayShortcut = "true";
    style.textContent = `@media screen and (max-width: 639px) {
      .school-holidays-shortcut {
        flex: 1 1 calc((100% - 1rem) / 3) !important;
        width: auto !important;
        min-width: 0 !important;
        max-width: none !important;
        height: 1.875rem !important;
        min-height: 1.875rem !important;
        padding: .25rem .375rem !important;
        border-radius: .75rem !important;
        font-size: .625rem !important;
        line-height: 1.1 !important;
        white-space: nowrap !important;
      }
    }`;
    document.head.appendChild(style);
  };

  installCompactHolidayShortcut();
  window.addEventListener("beforeprint", installPrintMargins);
})();
