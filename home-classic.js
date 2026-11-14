const photos = [
  ['winding-tool.jpg', 'Fabrication des bobinages', 'Outillage et préparation mécanique du bobinage.'],
  ['coil-detail.jpg', 'Assemblage des bobinages', 'Détail de la réalisation des sous-ensembles électromagnétiques.'],
  ['coil-assembly.jpg', 'Intégration mécanique', 'Assemblage des éléments bobinés et de leurs supports.'],
  ['insulation-observation.jpg', 'Observation lors du contrôle d’isolation', 'Montage de mesure photographié pendant les essais des bobinages.'],
  ['power-boards.jpg', 'Circuits de puissance', 'Cartes de commutation à IGBT et cartes à diodes avant intégration.'],
  ['switching-observation.jpg', 'Observation de la commutation', 'Oscillogramme brut relevé pendant un essai sur un sous-ensemble.'],
  ['interconnects.jpg', 'Assemblage des interconnexions', 'Réalisation des conducteurs et mise en place de gaines en PTFE.'],
  ['integration-side.jpg', 'Intégration des cartes', 'Vue latérale du prototype au cours de son assemblage.'],
  ['assembly.jpg', 'Prototype assemblé', 'Intégration des sous-ensembles mécaniques et électroniques.'],
  ['control-board.jpg', 'Carte de commande', 'Assemblage de la carte de commande et de supervision sur plaque chauffante.'],
  ['control-integrated.jpg', 'Commande et puissance réunies', 'Intégration de la commande embarquée et des composants de puissance.'],
  ['current-observation.jpg', 'Relevé expérimental de courant', 'Capture d’oscilloscope conservée comme observation brute d’un essai.'],
  ['test-setup.jpg', 'Installation de mesure', 'Vue du prototype et du matériel utilisés lors des essais.']
];
const gallery = document.getElementById('photo-gallery');
photos.forEach(([file,title,caption]) => {
  const figure = document.createElement('figure');
  const link = document.createElement('a');
  link.href = 'assets/' + file + '?v=wm2';
  link.className = 'zoom';
  link.dataset.caption = title + ' — ' + caption;
  const img = document.createElement('img');
  img.src = link.href; img.alt = title; img.loading = 'lazy'; img.width = 800; img.height = 600;
  link.append(img);
  const text = document.createElement('figcaption');
  const label = document.createElement('strong'); label.textContent = title;
  text.append(label,document.createTextNode(caption)); figure.append(link,text); gallery.append(figure);
});
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
