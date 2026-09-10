(function () {
  "use strict";

  var legalPhrases = [
    "התכנים אינם מהווים אבחון",
    "אינם מהווים אבחון, טיפול",
    "אינם מחליפים הערכה של איש מקצוע",
    "אינו תחליף להערכה ולטיפול",
    "not a diagnosis, treatment, medical advice",
    "does not replace assessment by a qualified professional",
    "not a substitute for professional"
  ];

  function containsLegalText(value) {
    return legalPhrases.some(function (phrase) {
      return value.indexOf(phrase) !== -1;
    });
  }

  function markLegalCopy() {
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          var value = (node.nodeValue || "").replace(/\s+/g, " ").trim();
          return value && containsLegalText(value)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    var matches = [];
    while (walker.nextNode()) matches.push(walker.currentNode);

    matches.forEach(function (node) {
      var element = node.parentElement;
      if (!element) return;
      var container = element.closest("p, li, small, article, section") || element;
      if (container === document.body || container.id === "root") container = element;
      container.setAttribute("data-nosnippet", "");
    });
  }

  function start() {
    markLegalCopy();
    var observer = new MutationObserver(markLegalCopy);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
