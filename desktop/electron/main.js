const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const DATA_FILE = 'buku-surat-data.json';
const BACKUP_DIR = 'cadangan';
const KEEP_BACKUPS = 30;

let win = null;
let writeQueued = null;

// ---------- Lokasi folder data ----------
function cfgPath() { return path.join(app.getPath('userData'), 'config.json'); }
function readCfg() { try { return JSON.parse(fs.readFileSync(cfgPath(), 'utf8')); } catch { return {}; } }
function writeCfg(c) { fs.mkdirSync(path.dirname(cfgPath()), { recursive: true }); fs.writeFileSync(cfgPath(), JSON.stringify(c, null, 2)); }

function defaultDir() {
  // Mode portable: simpan di samping file .exe supaya bisa dibawa lewat flashdisk
  if (process.env.PORTABLE_EXECUTABLE_DIR) return path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'Data Buku Surat TU');
  return path.join(app.getPath('documents'), 'Buku Surat TU');
}
function dataDir() {
  const d = readCfg().dataDir || defaultDir();
  try { fs.mkdirSync(path.join(d, BACKUP_DIR), { recursive: true }); return d; }
  catch { const f = defaultDir(); fs.mkdirSync(path.join(f, BACKUP_DIR), { recursive: true }); return f; }
}
const dataPath = () => path.join(dataDir(), DATA_FILE);

// ---------- Baca / tulis data ----------
function readData() {
  const p = dataPath();
  try { return fs.readFileSync(p, 'utf8'); } catch {}
  // Jika berkas utama rusak/hilang, coba cadangan terbaru
  try {
    const bd = path.join(dataDir(), BACKUP_DIR);
    const files = fs.readdirSync(bd).filter(f => f.endsWith('.json')).sort().reverse();
    if (files.length) return fs.readFileSync(path.join(bd, files[0]), 'utf8');
  } catch {}
  return null;
}

function writeData(json) {
  try { JSON.parse(json); } catch { return; } // jangan simpan data yang rusak
  const dir = dataDir();
  const target = path.join(dir, DATA_FILE);
  const tmp = target + '.tmp';
  fs.writeFileSync(tmp, json, 'utf8');
  fs.renameSync(tmp, target); // tulis atomik: tidak ada berkas setengah jadi bila komputer mati mendadak
  dailyBackup(dir, json);
}

function dailyBackup(dir, json) {
  try {
    const d = new Date();
    const stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const bd = path.join(dir, BACKUP_DIR);
    fs.writeFileSync(path.join(bd, 'buku-surat-' + stamp + '.json'), json, 'utf8');
    const all = fs.readdirSync(bd).filter(f => /^buku-surat-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
    while (all.length > KEEP_BACKUPS) fs.unlinkSync(path.join(bd, all.shift()));
  } catch {}
}

ipcMain.on('data:read', (e) => { e.returnValue = readData(); });
ipcMain.on('data:folder', (e) => { e.returnValue = dataDir(); });
ipcMain.on('data:write', (_e, json) => {
  // gabungkan tulis beruntun (tiap ketikan memanggil save) supaya ringan
  clearTimeout(writeQueued);
  writeQueued = setTimeout(() => writeData(json), 150);
});

// ---------- Jendela ----------
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 900, minHeight: 600,
    title: 'Buku Surat TU',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    backgroundColor: '#f1f5f3',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  win.loadFile(path.join(__dirname, '..', 'app', 'index.html'));
  // tautan eksternal dibuka di browser, bukan di jendela aplikasi
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.on('closed', () => { win = null; });
}

function flushPending() {
  // pastikan tulisan terakhir tidak tertinggal saat aplikasi ditutup
  if (writeQueued) { clearTimeout(writeQueued); writeQueued = null; }
}

async function chooseFolder() {
  const r = await dialog.showOpenDialog(win, {
    title: 'Pilih folder penyimpanan data (mis. flashdisk atau drive D:)',
    properties: ['openDirectory', 'createDirectory']
  });
  if (r.canceled || !r.filePaths[0]) return;
  const newDir = path.join(r.filePaths[0], 'Buku Surat TU');
  const old = dataPath();
  try {
    fs.mkdirSync(path.join(newDir, BACKUP_DIR), { recursive: true });
    if (fs.existsSync(old) && !fs.existsSync(path.join(newDir, DATA_FILE))) fs.copyFileSync(old, path.join(newDir, DATA_FILE));
    writeCfg({ ...readCfg(), dataDir: newDir });
    dialog.showMessageBoxSync(win, { type: 'info', message: 'Folder data dipindah ke:\n' + newDir, buttons: ['OK'] });
    win.reload();
  } catch (err) {
    dialog.showErrorBox('Gagal memindah folder', String(err.message || err));
  }
}

function backupNow() {
  const j = readData();
  if (!j) { dialog.showMessageBoxSync(win, { type: 'info', message: 'Belum ada data untuk dicadangkan.' }); return; }
  const r = dialog.showSaveDialogSync(win, {
    title: 'Simpan cadangan data',
    defaultPath: path.join(app.getPath('documents'), 'cadangan-buku-surat-' + new Date().toISOString().slice(0, 10) + '.json'),
    filters: [{ name: 'Data Buku Surat', extensions: ['json'] }]
  });
  if (r) fs.writeFileSync(r, j, 'utf8');
}

function restoreFromFile() {
  const r = dialog.showOpenDialogSync(win, { title: 'Pilih berkas cadangan', properties: ['openFile'], filters: [{ name: 'Data Buku Surat', extensions: ['json'] }] });
  if (!r || !r[0]) return;
  try {
    const j = fs.readFileSync(r[0], 'utf8');
    const d = JSON.parse(j);
    if (!d || !Array.isArray(d.items)) throw new Error('Berkas ini bukan data Buku Surat TU.');
    const ok = dialog.showMessageBoxSync(win, { type: 'warning', buttons: ['Pulihkan', 'Batal'], defaultId: 1, cancelId: 1, message: 'Data saat ini akan diganti dengan isi berkas cadangan. Lanjutkan?' });
    if (ok !== 0) return;
    writeData(j);
    win.webContents.executeJavaScript('try{localStorage.setItem("surat-tu-v1",' + JSON.stringify(j) + ');localStorage.setItem("surat-tu-pending","1")}catch(e){}').finally(() => win.reload());
  } catch (err) {
    dialog.showErrorBox('Gagal memulihkan', String(err.message || err));
  }
}

function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Berkas', submenu: [
      { label: 'Buka folder data', click: () => shell.openPath(dataDir()) },
      { label: 'Pilih folder penyimpanan data...', click: chooseFolder },
      { type: 'separator' },
      { label: 'Simpan cadangan ke berkas...', click: backupNow },
      { label: 'Pulihkan dari berkas cadangan...', click: restoreFromFile },
      { type: 'separator' },
      { label: 'Keluar', role: 'quit' }
    ]},
    { label: 'Tampilan', submenu: [
      { label: 'Muat ulang', role: 'reload' },
      { label: 'Perbesar', role: 'zoomIn' }, { label: 'Perkecil', role: 'zoomOut' }, { label: 'Ukuran normal', role: 'resetZoom' },
      { label: 'Layar penuh', role: 'togglefullscreen' }
    ]},
    { label: 'Bantuan', submenu: [
      { label: 'Tentang', click: () => dialog.showMessageBox(win, { type: 'info', title: 'Buku Surat TU', message: 'Buku Surat TU\nSMK Widya Mandala Tambak', detail: 'Versi ' + app.getVersion() + '\nData tersimpan di:\n' + dataDir() }) }
    ]}
  ]));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => { buildMenu(); createWindow(); });
  app.on('before-quit', flushPending);
  app.on('window-all-closed', () => app.quit());
}
