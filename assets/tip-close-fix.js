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
})();
