const fs = require('fs');

// 创建SVG图标
function createSimpleIcon(size) {
    // 创建一个简单的SVG图标
    const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="url(#grad)" stroke="#fff" stroke-width="2"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="none" stroke="#fff" stroke-width="${Math.max(1, size/40)}"/>
  <path d="M ${size/2} ${size/6} Q ${size/2} ${size/3} ${size/2} ${size/2} Q ${size/2} ${size*2/3} ${size/2} ${size*5/6}" fill="none" stroke="#fff" stroke-width="${Math.max(1, size/40)}"/>
  <line x1="${size/6}" y1="${size/2}" x2="${size*5/6}" y2="${size/2}" stroke="#fff" stroke-width="${Math.max(1, size/40)}"/>
  
  <circle cx="${size/3}" cy="${size/3}" r="${Math.max(1, size/30)}" fill="#fff"/>
  <circle cx="${size*2/3}" cy="${size/3}" r="${Math.max(1, size/30)}" fill="#fff"/>
  <circle cx="${size/3}" cy="${size*2/3}" r="${Math.max(1, size/30)}" fill="#fff"/>
  <circle cx="${size*2/3}" cy="${size*2/3}" r="${Math.max(1, size/30)}" fill="#fff"/>
</svg>`;

    return svg;
}

// 生成不同尺寸的图标
const sizes = [16, 48, 128];

sizes.forEach(size => {
    const svg = createSimpleIcon(size);
    const filename = `icons/icon${size}.svg`;
    
    fs.writeFileSync(filename, svg);
    console.log(`生成图标: ${filename}`);
});

console.log('\n图标生成完成！');
console.log('注意：由于没有canvas模块，生成了SVG格式的图标。');
console.log('你可以使用在线工具将SVG转换为PNG，或者安装canvas模块后重新运行此脚本。');
console.log('\n安装canvas模块：npm install canvas'); 