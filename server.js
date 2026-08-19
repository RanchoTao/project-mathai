const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const portArg = process.argv.findIndex(v => v === '--port');
const port = Number(process.env.PORT || (portArg >= 0 ? process.argv[portArg + 1] : 4173));
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};

http.createServer((req,res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(root, urlPath === '/' ? 'index.html' : urlPath.replace(/^\//,''));
  if (!filePath.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath,'index.html');
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('Not found'); }
      res.writeHead(200, {'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream'});
      res.end(data);
    });
  });
}).listen(port, '0.0.0.0', () => console.log(`MathAI site running on http://localhost:${port}`));
