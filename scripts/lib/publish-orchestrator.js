const { execSync, execFileSync } = require('child_process');
const { projectRoot } = require('./env');
const { uploadDistToFTP } = require('./ftp-upload');
const { optimizeForAllPlatforms } = require('./viral-optimizer');
const { publishToNetworks } = require('./social-networks');

/**
 * Полный цикл публикации: build → git → FTP → viral optimize → social
 */
async function orchestrateFullPublish(options = {}) {
  const {
    type = 'social-post',
    content = '',
    media = {},
    targetNetworks = [],
    skipBuild = false,
    skipGit = false,
    skipFtp = false,
    optimize = true,
  } = options;

  const report = {
    steps: [],
    success: true,
    errors: [],
  };

  // Шаг 1: Build
  if (!skipBuild) {
    try {
      console.log('[Оркестратор] Сборка проекта...');
      execSync('npm run build', { cwd: projectRoot, stdio: 'pipe', timeout: 120000 });
      report.steps.push({ step: 'build', success: true });
    } catch (err) {
      report.steps.push({ step: 'build', success: false, error: err.message });
      report.errors.push(`Build: ${err.message}`);
    }
  }

  // Шаг 2: Git
  if (!skipGit) {
    try {
      console.log('[Оркестратор] Git commit + push...');
      const commitMsg = `auto: ${type} — ${content.substring(0, 50)}`;
      execSync('git add -A', { cwd: projectRoot, stdio: 'pipe' });
      // Проверяем есть ли изменения для коммита
      try {
        execSync('git diff --cached --quiet', { cwd: projectRoot, stdio: 'pipe' });
        report.steps.push({ step: 'git', success: true, message: 'Нет изменений для коммита' });
      } catch {
        // Есть изменения — коммитим
        execFileSync('git', ['commit', '-m', commitMsg], { cwd: projectRoot, stdio: 'pipe' });
        execSync('git push', { cwd: projectRoot, stdio: 'pipe', timeout: 60000 });
        report.steps.push({ step: 'git', success: true });
      }
    } catch (err) {
      report.steps.push({ step: 'git', success: false, error: err.message });
      report.errors.push(`Git: ${err.message}`);
      // Git-ошибка не блокирует остальные шаги
    }
  }

  // Шаг 3: FTP
  if (!skipFtp) {
    try {
      console.log('[Оркестратор] Загрузка на FTP...');
      await uploadDistToFTP(projectRoot);
      report.steps.push({ step: 'ftp', success: true });
    } catch (err) {
      report.steps.push({ step: 'ftp', success: false, error: err.message });
      report.errors.push(`FTP: ${err.message}`);
    }
  }

  // Шаг 4: Вирусная оптимизация
  let payload = {
    text: content,
    imageUrl: media.imageUrl || null,
    videoUrl: media.videoUrl || null,
  };

  if (optimize && targetNetworks.length > 0) {
    try {
      console.log('[Оркестратор] Вирусная оптимизация...');
      const mediaType = media.videoUrl ? 'video' : media.imageUrl ? 'image' : 'none';
      const optimized = await optimizeForAllPlatforms(content, targetNetworks, type, mediaType);

      // Формируем per-network payload
      const perNetworkPayload = {};
      for (const network of targetNetworks) {
        if (optimized[network] && optimized[network].text) {
          const optText = optimized[network].text;
          const hashtags = optimized[network].hashtags || [];
          perNetworkPayload[network] = {
            text: hashtags.length > 0 ? `${optText}\n\n${hashtags.join(' ')}` : optText,
            imageUrl: media.imageUrl || null,
            videoUrl: media.videoUrl || null,
          };
        }
      }

      if (Object.keys(perNetworkPayload).length > 0) {
        payload = perNetworkPayload;
      }
      report.steps.push({ step: 'viral-optimize', success: true, data: optimized });
    } catch (err) {
      report.steps.push({ step: 'viral-optimize', success: false, error: err.message });
      report.errors.push(`Оптимизация: ${err.message}`);
      // Используем оригинальный текст
    }
  }

  // Шаг 5: Публикация в соцсети
  if (targetNetworks.length > 0) {
    try {
      console.log('[Оркестратор] Публикация в соцсети...');
      const results = await publishToNetworks(targetNetworks, payload);
      report.steps.push({ step: 'social-publish', success: true, data: results });

      // Проверяем есть ли ошибки
      const failures = Object.entries(results).filter(([, v]) => !v.success);
      if (failures.length > 0) {
        failures.forEach(([net, v]) => report.errors.push(`${net}: ${v.error}`));
      }
    } catch (err) {
      report.steps.push({ step: 'social-publish', success: false, error: err.message });
      report.errors.push(`Соцсети: ${err.message}`);
    }
  }

  report.success = report.errors.length === 0;
  return report;
}

/**
 * Только публикация в соцсети (без build/git/FTP)
 */
async function orchestrateSocialOnly(options = {}) {
  return orchestrateFullPublish({
    ...options,
    skipBuild: true,
    skipGit: true,
    skipFtp: true,
  });
}

module.exports = {
  orchestrateFullPublish,
  orchestrateSocialOnly,
};
