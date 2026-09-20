// Build render.html from render-template.html by injecting base64 textures.
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const template = fs.readFileSync(path.join(dir, 'render-template.html'), 'utf8');
const dayB64 = fs.readFileSync(path.join(dir, 'earth_day.jpg')).toString('base64');
const nightB64 = fs.readFileSync(path.join(dir, 'earth_night.jpg')).toString('base64');

const html = template
  .replace('__DAY_B64__', dayB64)
  .replace('__NIGHT_B64__', nightB64);

fs.writeFileSync(path.join(dir, 'render.html'), html);
console.log('render.html written,', (html.length / 1024).toFixed(0), 'KB');
