#!/usr/bin/env node

import { nextStandalone } from '../dist/next-standalone.js';

nextStandalone(process.argv.slice(2)).then(() => {
  console.log(
    'Extract `hyper-env` dependencies to next standalone node_modules.'
  );
});
