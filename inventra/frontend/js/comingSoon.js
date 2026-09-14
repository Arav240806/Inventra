document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const moduleName = params.get('module') || 'This module';

  const account = Inventra.initShell(moduleName, moduleName);
  if (!account) return;

  document.getElementById('csTitle').textContent = `${moduleName} — coming soon`;
});