const fs = require('fs-extra');

// reset.css and media.css are static passthroughs — no build step needed
// beyond copying them into dist/ alongside the bundled styles.css.
//
// tokens.css (generated from ThemeProvider's `tokenStyles`) is added here in
// Phase 3, once ThemeProvider is copied into this repo.
fs.copySync('src/styles/reset.css', 'dist/reset.css');
fs.copySync('src/styles/media.css', 'dist/media.css');
