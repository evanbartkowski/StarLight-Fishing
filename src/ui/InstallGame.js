export function initializeInstallGame({ production = import.meta.env.PROD } = {}) {
  const button = document.getElementById('btn-install-game'), dialog = document.getElementById('install-dialog');
  if (!button || !dialog) return;
  const status = document.getElementById('offline-status'), guidance = document.getElementById('install-guidance');
  const install = document.getElementById('install-native'), music = document.getElementById('offline-music');
  const retry = document.getElementById('offline-retry'), update = document.getElementById('offline-update');
  let deferredPrompt = null, registration = null, musicBusy = false;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const refreshInstall = () => {
    install.hidden = !deferredPrompt || standalone();
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    guidance.textContent = standalone() ? 'Installed. Open Starlight Fishing from your apps to play.' : ios ?
      'Install on iPhone or iPad: open Share, then Add to Home Screen.' : /Safari/.test(navigator.userAgent) && !/Chrome|Edg/.test(navigator.userAgent) ?
        'Install on Mac: choose File → Add to Dock in Safari.' :
        'Install from your browser’s Install app option (Chrome or Edge). When available, use the Install game button below.';
  };
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt = event; refreshInstall(); });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; refreshInstall(); });
  window.matchMedia('(display-mode: standalone)').addEventListener('change', refreshInstall);
  button.addEventListener('click', () => { refreshInstall(); if (!dialog.open) dialog.showModal(); });
  document.getElementById('install-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => button.focus({ preventScroll: true }));
  dialog.addEventListener('keydown', event => event.stopPropagation());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  install.addEventListener('click', async () => {
    const prompt = deferredPrompt;
    if (!prompt) return;
    deferredPrompt = null; refreshInstall();
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { guidance.textContent = 'Use your browser’s Install app option to finish installation.'; }
  });
  const setStatus = (text, ready = false) => { status.textContent = text; status.dataset.ready = String(ready); };
  const workerMessage = (worker, type) => new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => { channel.port1.close(); reject(Error('The offline copy is still preparing. Try again in a moment.')); }, 12000);
    channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
    worker.postMessage({ type }, [channel.port2]);
  });
  const checkReady = async () => {
    if (!registration?.active) return;
    if (registration.waiting) {
      update.hidden = false; setStatus('An updated offline game is ready. Refresh to use it.'); return;
    }
    update.hidden = true;
    const result = await workerMessage(registration.active, 'OFFLINE_STATUS');
    setStatus(result.ready ? 'Ready for offline play. Your progress saves on this device.' : 'Preparing the offline game…', result.ready);
    music.hidden = !result.ready;
    music.disabled = result.musicReady || musicBusy;
    if (!musicBusy) music.textContent = result.musicReady ? 'Music saved offline' : `Save music offline · ${Math.ceil(result.audioBytes / 1048576)} MB`;
    retry.hidden = result.ready;
  };
  const prepare = async () => {
    retry.hidden = true;
    if (!production) { setStatus('Offline installation is available on the published game.'); return; }
    if (!('serviceWorker' in navigator)) { setStatus('This browser cannot save the game offline. Try a current version of Chrome, Edge or Safari.'); return; }
    try {
      setStatus('Downloading the game for offline play…');
      registration = await navigator.serviceWorker.register('/sw.js?offline=2', { updateViaCache: 'none' });
      const observe = worker => worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && registration.active && registration.waiting) { update.hidden = false; setStatus('An updated offline game is ready. Refresh to use it.'); }
        if (worker.state === 'redundant') { setStatus('Download interrupted. Reconnect to finish saving the game.'); retry.hidden = false; }
      });
      observe(registration.installing);
      registration.addEventListener('updatefound', () => observe(registration.installing));
      // Older workers may not understand this release's status message.
      if (registration.installing && registration.active) {
        const installing = registration.installing;
        await new Promise((resolve, reject) => {
          const changed = () => {
            if (installing.state === 'installed' || installing.state === 'activated') resolve();
            if (installing.state === 'redundant') reject(Error('Reconnect and retry the offline download.'));
          };
          installing.addEventListener('statechange', changed); changed();
        });
      }
      await navigator.serviceWorker.ready;
      await checkReady();
    } catch (error) { setStatus(`Offline download unavailable. ${error.message}`); retry.hidden = false; }
  };
  retry.addEventListener('click', prepare);
  update.addEventListener('click', () => {
    if (!registration?.waiting) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
    registration.waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
  });
  music.addEventListener('click', () => {
    if (musicBusy || !registration?.active) return;
    musicBusy = true; music.disabled = true;
    const channel = new MessageChannel();
    channel.port1.onmessage = async event => {
      const message = event.data;
      if (message.type === 'AUDIO_PROGRESS') music.textContent = `Saving music · ${Math.round(message.done / message.total * 100)}%`;
      if (message.type === 'AUDIO_COMPLETE' || message.type === 'AUDIO_ERROR') {
        musicBusy = false; channel.port1.close();
        if (message.type === 'AUDIO_ERROR') { music.disabled = false; music.textContent = 'Resume music download'; setStatus(message.message, true); }
        else await checkReady();
      }
    };
    registration.active.postMessage({ type: 'DOWNLOAD_MUSIC' }, [channel.port2]);
  });
  refreshInstall(); prepare();
}
