#!/usr/bin/env node

import { nextStandalone } from '../dist/next-standalone.js';

nextStandalone(process.argv.slice(2)).then(() => {
  console.log(
    'add hyper-env dependency to your project and run `hyper-env` to hook environment variables into your project.'
  );
});
