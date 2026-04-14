/**
 * 视觉参数调节服务器
 * 启动：node tuner-server.js
 * 访问：http://localhost:3456
 *
 * 功能：
 * 1. 静态文件服务（预览项目页面）
 * 2. API 接口接收参数修改，直接写回 CSS 文件
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const ROOT = __dirname;

// MIME 类型
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: 读取 CSS 文件
  if (req.method === 'GET' && req.url === '/api/css') {
    try {
      const files = ['css/style.css', 'css/screens.css', 'css/animations.css'];
      const result = {};
      for (const f of files) {
        result[f] = fs.readFileSync(path.join(ROOT, f), 'utf-8');
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: 写入 CSS 修改
  if (req.method === 'POST' && req.url === '/api/css') {
    try {
      const body = JSON.parse(await readBody(req));
      // body = { file: 'css/style.css', content: '...' }
      const filePath = path.join(ROOT, body.file);
      // 安全检查：只允许写 css 目录
      if (!body.file.startsWith('css/') || !body.file.endsWith('.css')) {
        res.writeHead(403);
        res.end(JSON.stringify({ error: '只允许修改 css/ 目录下的文件' }));
        return;
      }
      fs.writeFileSync(filePath, body.content, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: CSS 精确替换（查找替换方式，不覆盖整个文件）
  if (req.method === 'POST' && req.url === '/api/css-patch') {
    try {
      const body = JSON.parse(await readBody(req));
      // body = { patches: [{ file, selector, property, oldValue, newValue }] }
      const results = [];
      for (const patch of body.patches) {
        const filePath = path.join(ROOT, patch.file);
        if (!patch.file.startsWith('css/') || !patch.file.endsWith('.css')) continue;

        let css = fs.readFileSync(filePath, 'utf-8');
        const original = css;

        // 构造正则：找到 selector 块中的 property
        // 简单方案：直接做全文字符串替换 oldValue -> newValue（精确匹配属性值）
        const oldDecl = `${patch.property}: ${patch.oldValue}`;
        const newDecl = `${patch.property}: ${patch.newValue}`;

        if (css.includes(oldDecl)) {
          css = css.replace(oldDecl, newDecl);
          fs.writeFileSync(filePath, css, 'utf-8');
          results.push({ ...patch, status: 'ok' });
        } else {
          results.push({ ...patch, status: 'not_found', searched: oldDecl });
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, results }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 静态文件服务
  let filePath = path.join(ROOT, req.url === '/' ? 'tuner.html' : decodeURIComponent(req.url));

  // 防止路径遍历
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    const ext = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not Found: ' + req.url);
  }
});

server.listen(PORT, () => {
  console.log(`\n  🎛️  视觉参数调节器已启动！\n`);
  console.log(`  打开浏览器访问: http://localhost:${PORT}\n`);
  console.log(`  左侧拖动滑杆 → 右侧实时预览 → 点"保存到文件"直接写入CSS\n`);
  console.log(`  按 Ctrl+C 停止服务器\n`);
});
