// Conserver les liens vers les projets de l’ancienne page unique.
const projectRoutes = {
  '#reluctance': 'projects/reluctance.html',
  '#pcb26r1-title': 'projects/reluctance.html#pcb26r1-title',
  '#cardiaque': 'projects/pulse-counter.html',
  '#flux-air': 'projects/airflow.html',
  '#fpga': 'projects/fall-detection.html'
};
function openLegacyProject() {
  const destination = projectRoutes[window.location.hash];
  if (destination) window.location.replace(destination);
}
window.addEventListener('hashchange', openLegacyProject);
openLegacyProject();
