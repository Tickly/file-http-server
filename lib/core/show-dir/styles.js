'use strict';

const icons = require('./icons.json');

const IMG_SIZE = 16;

let css = `i.icon { display: block; height: ${IMG_SIZE}px; width: ${IMG_SIZE}px; background: no-repeat center; }\n`;
css += 'table tr { white-space: nowrap; }\n';
css += 'td.perms {}\n';
css += 'td.file-size { text-align: right; padding-left: 1em; }\n';
css += 'td.delete-action { padding-left: 1em; width: 1%; white-space: nowrap; }\n';
css += 'td.display-name { padding-left: 1em; }\n';
css += 'button.delete-btn { cursor: pointer; color: #c00; background: transparent; border: 1px solid #c00; border-radius: 3px; padding: 0 0.4em; font-size: 0.85em; }\n';
css += 'button.delete-btn:hover { background: #c00; color: #fff; }\n';
css += `
@media (prefers-color-scheme: dark) {
  body {
    background-color: #303030;
    color: #efefef;
  }
  a {
    color: #ffff11;
  }
  button.delete-btn {
    color: #ff6b6b;
    border-color: #ff6b6b;
  }
  button.delete-btn:hover {
    background: #ff6b6b;
    color: #1a1a1a;
  }
}
`;

Object.keys(icons).forEach((key) => {
  css += `i.icon-${key} {\n`;
  css += `  background-image: url("data:image/png;base64,${icons[key]}");\n`;
  css += '}\n\n';
});

exports.icons = icons;
exports.css = css;
