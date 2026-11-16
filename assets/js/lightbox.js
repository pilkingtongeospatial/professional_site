// Click a gallery map to view it enlarged. Arrow keys / buttons step through,
// Esc / backdrop click / × closes. Without JS, the links just open the image.
(function () {
  var dialog = document.querySelector('.lightbox');
  var links = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;

  var img = dialog.querySelector('.lightbox-image');
  var caption = dialog.querySelector('.lightbox-caption');
  var prev = dialog.querySelector('.lightbox-prev');
  var next = dialog.querySelector('.lightbox-next');
  var current = 0;

  if (links.length < 2) { prev.hidden = true; next.hidden = true; }

  function show(i) {
    current = (i + links.length) % links.length;
    var thumb = links[current].querySelector('img');
    img.src = links[current].href;
    img.alt = thumb.alt;
    caption.textContent = (current + 1) + ' / ' + links.length;
  }

  links.forEach(function (link, i) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      show(i);
      dialog.showModal();
    });
  });

  prev.addEventListener('click', function () { show(current - 1); });
  next.addEventListener('click', function () { show(current + 1); });
  dialog.querySelector('.lightbox-close').addEventListener('click', function () { dialog.close(); });

  // Clicking the dark backdrop (the dialog itself, not its contents) closes it.
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });
})();
