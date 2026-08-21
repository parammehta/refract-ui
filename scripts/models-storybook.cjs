const fs = require('fs-extra');

// Copy device .glb models into the storybook build directory so Model
// stories resolve them at the default '/models/' base path. No-ops until
// Phase 3 copies the .glb files into src/assets/models.
if (!fs.existsSync('src/assets/models')) process.exit(0);

fs.copy('src/assets/models', 'build-storybook/models', err => {
  if (err) return console.error(err);
});
