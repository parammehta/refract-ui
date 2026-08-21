const fs = require('fs-extra');

// reset.css and media.css are static passthroughs — no build step needed
// beyond copying them into dist/ alongside the bundled styles.css.
fs.copySync('src/styles/reset.css', 'dist/reset.css');
fs.copySync('src/styles/media.css', 'dist/media.css');

// Also copy the raw device .glb models so `refract-ui/assets/*` resolves,
// per the package.json exports map.
if (fs.existsSync('src/assets/models')) {
  fs.copySync('src/assets/models', 'dist/assets');
}
