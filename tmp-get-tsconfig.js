const getTSConfig = require('get-tsconfig');
const path = require('path');
const file = path.resolve('apps/mobile/app/(tabs)/_layout.tsx');
const cfg = getTSConfig(file);
console.log('cfg_path:', cfg.filePath);
console.log('baseUrl:', cfg.config?.compilerOptions?.baseUrl);
console.log('paths:', JSON.stringify(cfg.config?.compilerOptions?.paths));
