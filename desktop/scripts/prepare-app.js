// Menyiapkan folder app/ : salinan index.html dari root repo + exceljs lokal (agar ekspor Excel jalan offline)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const out = path.join(__dirname, '..', 'app');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'vendor'), { recursive: true });

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const cdn = /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/exceljs\/[\d.]+\/exceljs\.min\.js/;
if (!cdn.test(html)) throw new Error('Tag script exceljs CDN tidak ditemukan di index.html');
html = html.replace(cdn, 'vendor/exceljs.min.js');

const ex = path.join(__dirname, '..', 'node_modules', 'exceljs', 'dist', 'exceljs.min.js');
fs.copyFileSync(ex, path.join(out, 'vendor', 'exceljs.min.js'));
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('app/ siap:', fs.readdirSync(out));
