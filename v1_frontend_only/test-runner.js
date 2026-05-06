#!/usr/bin/env node

import('./utils/gameLogic.test.js').catch(err => {
    console.error('Tests require Node.js with ES modules support');
    console.error('To run tests:');
    console.error('1. npm install');
    console.error('2. npm test');
    console.error('3. Or: npx vitest run');
    process.exit(1);
});