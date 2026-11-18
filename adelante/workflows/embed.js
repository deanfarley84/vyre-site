(() => {
  const frame = document.querySelector('[data-adelante-demo]');
  if (!frame) return;
  let observer;
  function connect() {
    observer?.disconnect();
    const page = frame.contentDocument;
    if (!page?.querySelector('.atlas')) return;
    const resize = () => { frame.height = Math.ceil(page.body.getBoundingClientRect().height) + 2; };
    observer = new ResizeObserver(resize);
    observer.observe(page.body);
    resize();
  }
  frame.addEventListener('load', connect);
  connect();
})();
