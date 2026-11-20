import {ModelViewerElement} from './vendor/model-viewer.min.js';
import {paintWatermark} from './assembly-watermark.js';

ModelViewerElement.dracoDecoderLocation = new URL('./vendor/draco/', import.meta.url).href;

for (const figure of document.querySelectorAll('[data-assembly-viewer]')) {
  const viewer = figure.querySelector('model-viewer');
  const frame = figure.querySelector('.assembly-frame');
  const canvas = figure.querySelector('.assembly-watermark');
  const poster = figure.querySelector('.assembly-poster');
  const load = figure.querySelector('.assembly-load');
  const toolbar = figure.querySelector('.assembly-toolbar');
  const status = figure.querySelector('.assembly-status');
  const fullscreen = toolbar.querySelector('[data-action="fullscreen"]');
  const initialOrbit = viewer.getAttribute('camera-orbit');
  let loading = false;
  load.disabled = false;
  fullscreen.hidden = !frame.requestFullscreen;

  new ResizeObserver(() => paintWatermark(canvas, frame.clientWidth, frame.clientHeight)).observe(frame);

  load.addEventListener('click', () => {
    loading = true;
    load.disabled = true;
    load.textContent = 'Chargement du modèle…';
    status.textContent = '';
    if (viewer.src) viewer.removeAttribute('src');
    viewer.src = viewer.dataset.src;
  });
  viewer.addEventListener('progress', event => {
    if (loading && !frame.hasAttribute('data-ready')) load.textContent = `Chargement… ${Math.round(event.detail.totalProgress * 100)} %`;
  });
  viewer.addEventListener('load', () => {
    loading = false;
    poster.hidden = true;
    toolbar.hidden = false;
    frame.setAttribute('data-ready', '');
    status.textContent = '';
    paintWatermark(canvas, frame.clientWidth, frame.clientHeight);
  });
  viewer.addEventListener('error', () => {
    loading = false;
    poster.hidden = false;
    toolbar.hidden = true;
    frame.removeAttribute('data-ready');
    load.disabled = false;
    load.textContent = 'Réessayer le chargement';
    status.textContent = 'Le modèle 3D n’a pas pu être chargé. Réessayer avec un navigateur récent prenant en charge WebGL.';
  });
  toolbar.addEventListener('click', async event => {
    const action = event.target.closest('button')?.dataset.action;
    if (action === 'zoom-in' || action === 'zoom-out') {
      const orbit = viewer.getCameraOrbit();
      viewer.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius * (action === 'zoom-in' ? .8 : 1.25)}m`;
    } else if (action === 'reset') {
      viewer.cameraTarget = 'auto auto auto';
      viewer.cameraOrbit = initialOrbit;
      viewer.fieldOfView = 'auto';
      viewer.jumpCameraToGoal();
    } else if (action === 'fullscreen') {
      try {
        if (document.fullscreenElement === frame) await document.exitFullscreen();
        else await frame.requestFullscreen();
      } catch {
        status.textContent = 'Le plein écran n’est pas disponible dans ce navigateur.';
      }
    }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreen.textContent = document.fullscreenElement === frame ? 'Quitter le plein écran' : 'Plein écran';
  });
}
