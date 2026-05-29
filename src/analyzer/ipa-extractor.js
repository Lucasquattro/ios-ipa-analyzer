import fs from 'fs-extra';
import path from 'path';
import { createReadStream } from 'fs';
import unzipper from 'unzipper';

export async function extractIPA(ipaPath, outputDir) {
  if (!fs.existsSync(ipaPath)) {
    throw new Error(`IPA file not found: ${ipaPath}`);
  }

  await fs.ensureDir(outputDir);

  return new Promise((resolve, reject) => {
    createReadStream(ipaPath)
      .pipe(unzipper.Extract({ path: outputDir }))
      .on('finish', async () => {
        try {
          const structure = await analyzeStructure(outputDir);
          resolve(structure);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function analyzeStructure(extractDir) {
  const payloadPath = path.join(extractDir, 'Payload');

  if (!fs.existsSync(payloadPath)) {
    throw new Error('Invalid IPA: Payload directory not found');
  }

  const appDirs = await fs.readdir(payloadPath);
  const appDir = appDirs.find(d => d.endsWith('.app'));

  if (!appDir) {
    throw new Error('No .app bundle found in Payload');
  }

  const appPath = path.join(payloadPath, appDir);
  const infoPlistPath = path.join(appPath, 'Info.plist');
  const entitlementsPath = path.join(appPath, 'embedded.mobileprovision');

  return {
    appName: appDir,
    appPath,
    infoPlistPath,
    entitlementsPath,
    resourcesPath: appPath,
    frameworksPath: path.join(appPath, 'Frameworks'),
    pluginsPath: path.join(appPath, 'PlugIns'),
    localizedResources: await findLocalizedResources(appPath)
  };
}

async function findLocalizedResources(appPath) {
  const resources = {};
  const patterns = ['*.lproj'];
  const items = await fs.readdir(appPath);

  for (const item of items) {
    if (item.endsWith('.lproj')) {
      const lang = item.replace('.lproj', '');
      resources[lang] = path.join(appPath, item);
    }
  }

  return resources;
}
