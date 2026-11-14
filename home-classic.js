const dialog = document.getElementById('lightbox');
let previousFocus;
document.addEventListener('click',event => {
  const link = event.target.closest('a.zoom');
  if (!link || typeof dialog.showModal !== 'function') return;
  event.preventDefault(); previousFocus = link;
  const image = document.getElementById('lightbox-image');
  image.src = link.href; image.alt = link.querySelector('img').alt;
  document.getElementById('lightbox-caption').textContent = link.dataset.caption || image.alt;
  dialog.showModal(); document.body.classList.add('modal-open');
});
document.getElementById('close-lightbox').addEventListener('click',() => dialog.close());
dialog.addEventListener('click',event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close(); } });
dialog.addEventListener('close',() => { document.body.classList.remove('modal-open'); previousFocus?.focus(); });
