const http = require('http');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'assets', 'templates');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = JSON.parse(body);
      const base64Data = data.image.replace(/^data:image\/png;base64,/, "");
      const filePath = path.join(dir, `${data.name}.png`);
      fs.writeFileSync(filePath, base64Data, 'base64');
      console.log(`Saved ${data.name}.png`);
      res.writeHead(200);
      res.end('ok');
    });
  }
});

server.listen(9999, () => {
  console.log('Capture server running on port 9999');
});
