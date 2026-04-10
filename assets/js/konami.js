(() => {
  const KONAMI = [
    "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
    "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
    "b","a"
  ];

  let i = 0;

  function activateEasterEgg() {
    document.documentElement.classList.toggle("konami-on");

    const el = document.getElementById("konami-banner");
    if (el) {
      el.hidden = !document.documentElement.classList.contains("konami-on");
    }
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