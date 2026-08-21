const fs = require('fs-extra');

// tokenStyles is computed at runtime from ThemeProvider's theme.ts, so it's
// generated from the already-built dist/index.cjs rather than duplicated
// here — this is the same string _document.page.tsx inlines into <head> in
// the portfolio, just written out to a file for consumers that want a plain
// stylesheet instead.
const { tokenStyles } = require('../dist/index.cjs');

fs.writeFileSync('dist/tokens.css', tokenStyles);
