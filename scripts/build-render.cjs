const { spawnSync } = require('node:child_process');
const path = require('node:path');
const projectRoot = path.resolve(__dirname, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function npm(directory, args, env = process.env) {
  const result = spawnSync(npmCommand, args, {
    cwd: path.join(projectRoot, directory), env, stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
// Build native dependencies against the Linux system used by Render rather
// than downloading a binary that may require a newer glibc at runtime.
const backendInstallEnv = process.platform === 'linux'
  ? { ...process.env, npm_config_build_from_source: 'true' }
  : process.env;
npm('backend', ['ci'], backendInstallEnv);
// Fail during the build, before deployment, if the SQLite driver cannot load.
// This does not open or change any database.
require('../backend/node_modules/sqlite3');
npm('frontend', ['ci', '--include=dev']);
// Force a same-origin build even if a former Vercel API override is still configured.
npm('frontend', ['run', 'build'], { ...process.env, VITE_API_BASE: '/api' });
process.env.REQUIRE_FRONTEND_BUILD = 'true';
require('../backend/frontend-static').verifyFrontendBuild();
