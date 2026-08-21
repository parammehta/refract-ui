const { execSync } = require('child_process');

const DISTRIBUTION_ID = 'E33OLQRYDUEV1Q';

execSync(`aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"`, {
  stdio: 'inherit',
});
