const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..');

function loadEnv(filePath) {
  const env = {};
  const envFile = filePath || path.join(projectRoot, '.env');
  if (!fs.existsSync(envFile)) return env;
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    if (!line || line.startsWith('#') || !line.includes('=')) return;
    const [key, ...vals] = line.split('=');
    if (key) env[key.trim()] = vals.join('=').trim();
  });
  return env;
}

let _env = null;

function getEnv(key, fallback) {
  if (!_env) _env = loadEnv();
  const val = _env[key] || process.env[key];
  if (val !== undefined) return val;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required env variable: ${key}`);
}

function reloadEnv() {
  _env = loadEnv();
  return _env;
}

/**
 * Обновить значение переменной в .env файле и перезагрузить кэш
 */
function updateEnvVar(key, value) {
  const envFile = path.join(projectRoot, '.env');
  let content = '';
  if (fs.existsSync(envFile)) {
    content = fs.readFileSync(envFile, 'utf8');
  }

  const lines = content.split('\n');
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`${key}=`)) {
      lines[i] = `${key}=${value}`;
      found = true;
      break;
    }
  }
  if (!found) {
    lines.push(`${key}=${value}`);
  }

  fs.writeFileSync(envFile, lines.join('\n'), 'utf8');
  reloadEnv();
}

module.exports = { loadEnv, getEnv, reloadEnv, updateEnvVar, projectRoot };
