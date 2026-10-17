// Steps the drawing forward. ?step=N freezes it at one step (for stills); otherwise it plays
// through every step once and holds the last one.
(() => {
  const params = new URLSearchParams(location.search);
  const last = Math.max(...[...document.querySelectorAll('[data-from],[data-until]')].flatMap((el) => [Number(el.dataset.from || 0), Number(el.dataset.until || 0)]));
  const stepMs = Number(document.body.dataset.stepMs || 2200);

  function show(step) {
    document.querySelectorAll('[data-from],[data-until]').forEach((el) => {
      const from = el.dataset.from === undefined ? 0 : Number(el.dataset.from);
      const until = el.dataset.until === undefined ? Infinity : Number(el.dataset.until);
      const on = step >= from && step < until;
      el.classList.toggle('hidden', !on);
      // Swapped labels (data-swap) leave the layout instead of fading in place.
      if (el.hasAttribute('data-swap')) el.classList.toggle('gone', !on);
    });
  }

  if (params.has('step')) { show(Number(params.get('step'))); return; }
  let step = 0;
  show(step);
  const timer = setInterval(() => {
    step += 1;
    show(step);
    if (step >= last) clearInterval(timer);
  }, stepMs);
})();
