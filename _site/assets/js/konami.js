(() => {
  const KONAMI = [
    "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
    "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
    "b","a"
  ];
  const FIREWORK_EMOJIS = ["🎆", "🎇", "✨", "💥", "🎉"];
  const root = document.documentElement;
  const effectLayerId = "konami-effects";

  let i = 0;
  let active = false;
  let trailThrottle = 0;
  let cleanupTimers = [];

  function getEffectLayer() {
    let layer = document.getElementById(effectLayerId);
    if (!layer) {
      layer = document.createElement("div");
      layer.id = effectLayerId;
      layer.className = "konami-effects";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
    }
    return layer;
  }

  function clearEffects() {
    cleanupTimers.forEach((timer) => clearTimeout(timer));
    cleanupTimers = [];

    const layer = document.getElementById(effectLayerId);
    if (layer) {
      layer.replaceChildren();
    }
  }

  function shakeBox(target) {
    const shakeX = 8 + Math.random() * 16;
    const shakeY = 6 + Math.random() * 14;
    const shakeRot = 2 + Math.random() * 7;

    target.classList.remove("konami-shake");
    void target.offsetWidth;
    target.style.setProperty("--shake-x", `${shakeX}px`);
    target.style.setProperty("--shake-y", `${shakeY}px`);
    target.style.setProperty("--shake-rot", `${shakeRot}deg`);
    target.classList.add("konami-shake");

    target.addEventListener(
      "animationend",
      () => {
        target.classList.remove("konami-shake");
      },
      { once: true }
    );
  }

  function spawnParticle({ x, y, emoji, className, style = {} }) {
    const layer = getEffectLayer();
    const particle = document.createElement("span");
    particle.className = className;
    particle.textContent = emoji;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    for (const [key, value] of Object.entries(style)) {
      particle.style.setProperty(key, value);
    }

    layer.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }

  function spawnTrail(x, y) {
    spawnParticle({
      x,
      y,
      emoji: "",
      className: "konami-trail",
      style: {
        "--x": "0px",
        "--y": "0px"
      }
    });
  }

  function spawnFireworkBurst() {
    const burstCount = 44;
    const layer = getEffectLayer();
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let burst = 0; burst < 3; burst += 1) {
      const timer = window.setTimeout(() => {
        for (let j = 0; j < burstCount; j += 1) {
          const x = Math.max(32, Math.min(width - 32, Math.random() * width));
          const y = Math.max(72, Math.min(height - 72, Math.random() * height * 0.82));
          const distanceX = `${(Math.random() - 0.5) * 220}px`;
          const distanceY = `${(Math.random() - 0.5) * 220}px`;
          const emoji = FIREWORK_EMOJIS[Math.floor(Math.random() * FIREWORK_EMOJIS.length)];
          const particle = document.createElement("span");

          particle.className = "konami-firework";
          particle.textContent = emoji;
          particle.style.left = `${x}px`;
          particle.style.top = `${y}px`;
          particle.style.setProperty("--dx", distanceX);
          particle.style.setProperty("--dy", distanceY);
          particle.style.animationDelay = `${Math.random() * 0.32}s`;
          particle.style.fontSize = `${1.2 + Math.random() * 1.7}rem`;

          layer.appendChild(particle);
          particle.addEventListener("animationend", () => particle.remove(), { once: true });
        }
      }, burst * 180);

      cleanupTimers.push(timer);
    }
  }

  function handlePointerMove(event) {
    if (!active || event.pointerType !== "mouse") {
      return;
    }

    const now = performance.now();
    if (now - trailThrottle < 22) {
      return;
    }

    trailThrottle = now;
    spawnTrail(event.clientX, event.clientY);
  }

  function handleClick(event) {
    if (!active) {
      return;
    }

    const target = event.target.closest(".card, .friend-card, .talk-card");
    if (!target) {
      return;
    }

    shakeBox(target);
  }

  function setActive(nextState) {
    active = nextState;
    root.classList.toggle("konami-on", active);

    const el = document.getElementById("konami-banner");
    if (el) {
      el.hidden = !active;
    }

    if (active) {
      spawnFireworkBurst();
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("click", handleClick, true);
    } else {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("click", handleClick, true);
      clearEffects();
    }
  }

  function activateEasterEgg() {
    setActive(!active);
  }

  window.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    if (key === KONAMI[i]) {
      i++;
      if (i === KONAMI.length) {
        i = 0;
        activateEasterEgg();
      }
    } else {
      // 如果按错了，但当前按键恰好是序列第一个，则从 1 开始，否则清零
      i = (key === KONAMI[0]) ? 1 : 0;
    }
  });
})();