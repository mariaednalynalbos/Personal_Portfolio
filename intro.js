(() => {
const openingOverlay = document.getElementById("introSequence");
const introRobot = document.getElementById("introRobot");
const introLogoText = document.getElementById("introLogoText");
const introNameText = document.getElementById("introNameText");
const introSkip = document.getElementById("introSkip");

if (openingOverlay && introRobot && introLogoText && introNameText) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cancelled = false;
  document.body.classList.add("intro-open");

  const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  function finishIntro() {
    if (cancelled) return;
    cancelled = true;
    openingOverlay.classList.add("is-leaving");
    setTimeout(() => {
      openingOverlay.classList.add("done");
      document.body.classList.remove("intro-open");
    }, 900);
  }

  async function typeInto(element, text, speed) {
    for (const character of text) {
      if (cancelled) return;
      element.textContent += character;
      await wait(speed);
    }
  }

  introSkip?.addEventListener("click", finishIntro);

  if (reduceMotion) {
    openingOverlay.classList.add("done");
    document.body.classList.remove("intro-open");
  } else {
    (async () => {
      await wait(1450);
      if (cancelled) return;
      introRobot.classList.add("is-idle");
      await wait(350);
      if (cancelled) return;
      introRobot.classList.remove("is-idle");
      introRobot.classList.add("is-walking-out");
      await wait(2050);
      if (cancelled) return;

      await typeInto(introLogoText, "mea", 115);
      if (cancelled) return;

      const dot = document.createElement("span");
      dot.className = "logo-dot";
      dot.textContent = ".";
      introLogoText.append(dot);
      await wait(180);
      await typeInto(introNameText, "MARIA EDNALYN C. ALBOS", 85);
      await wait(650);
      if (cancelled) return;
      finishIntro();
    })();
  }
}
})();
