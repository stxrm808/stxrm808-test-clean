/**
 * Minimal static server for local preview (http://127.0.0.1:8765/).
 * No Python required; avoids some bind / firewall quirks.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8765);
const HOST = process.env.HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function fileUnderRoot(pathname) {
  const decoded = decodeURIComponent(pathname.split('?')[0] || '/');
  let clean = path.posix.normalize(decoded).replace(/^(\.\.(\/|$))+/, '');
  if (clean.startsWith('/')) clean = clean.slice(1);
  if (!clean || clean === '.') return path.join(root, 'index.html');
  const full = path.join(root, clean);
  const rel = path.relative(root, full);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }

  let pathname;
  try {
    pathname = new URL(req.url || '/', `http://${HOST}`).pathname;
  } catch {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  const full = fileUnderRoot(pathname);
  if (!full) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(full, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(full).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Length', st.size);
    if (req.method === 'HEAD') {
      res.writeHead(200);
      res.end();
      return;
    }
    res.writeHead(200);
    fs.createReadStream(full).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n  Local:  http://${HOST}:${PORT}/`);
  console.log(`  Vol.2:  http://${HOST}:${PORT}/kit-flames-bounce-vol2.html\n`);
});
