const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');
const { getEnv, projectRoot } = require('./env');

function getFTPConfig() {
  return {
    host: getEnv('FTP_HOST'),
    user: getEnv('FTP_USER'),
    password: getEnv('FTP_PASSWORD'),
    secure: false,
    port: parseInt(getEnv('FTP_PORT', '21'), 10)
  };
}

function getRemoteRoot() {
  return getEnv('FTP_REMOTE_ROOT', '/my.delimes.ru/htdocs/www/');
}

async function uploadDirRecursive(client, localDir, remoteRoot, baseDir) {
  const items = fs.readdirSync(localDir);
  for (const item of items) {
    const localPath = path.join(localDir, item);
    const relativePath = path.relative(baseDir, localPath);
    const remotePath = path.posix.join(remoteRoot, relativePath.replace(/\\/g, '/'));
    const stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      await client.ensureDir(remotePath);
      await uploadDirRecursive(client, localPath, remoteRoot, baseDir);
    } else {
      try {
        await client.uploadFrom(localPath, remotePath);
        console.log(`  ↑ ${relativePath}`);
      } catch (err) {
        console.error(`  ✗ ${relativePath}: ${err.message}`);
      }
    }
  }
}

async function uploadDistToFTP(root) {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  const distDir = path.join(root || projectRoot, 'dist');
  const remoteRoot = getRemoteRoot();

  if (!fs.existsSync(distDir)) {
    throw new Error('dist/ folder not found. Build failed?');
  }

  try {
    await client.access(getFTPConfig());
    console.log(`Connected to ${getFTPConfig().host}`);
    console.log('Uploading dist/ folder...');
    await uploadDirRecursive(client, distDir, remoteRoot, distDir);
  } finally {
    client.close();
  }
}

/**
 * Загрузить один файл на FTP и вернуть публичный URL
 */
async function uploadSingleFile(localFilePath, remoteRelativePath) {
  if (!fs.existsSync(localFilePath)) {
    throw new Error(`Файл не найден: ${localFilePath}`);
  }

  const client = new ftp.Client();
  client.ftp.verbose = false;
  const remoteRoot = getRemoteRoot();
  const fullRemotePath = path.posix.join(remoteRoot, remoteRelativePath.replace(/\\/g, '/'));
  const remoteDir = path.posix.dirname(fullRemotePath);

  try {
    await client.access(getFTPConfig());
    await client.ensureDir(remoteDir);
    await client.uploadFrom(localFilePath, fullRemotePath);
    console.log(`  ↑ ${remoteRelativePath}`);

    const siteUrl = getEnv('SITE_URL', 'https://my.delimes.ru');
    return `${siteUrl}/${remoteRelativePath.replace(/\\/g, '/')}`;
  } finally {
    client.close();
  }
}

module.exports = { uploadDistToFTP, uploadSingleFile, getFTPConfig, getRemoteRoot, uploadDirRecursive };
