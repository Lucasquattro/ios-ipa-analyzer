import fs from 'fs-extra';
import path from 'path';

export async function extractUI(appPath) {
  const assets = {
    images: await findImages(appPath),
    storyboards: await findStoryboards(appPath),
    nibs: await findNibs(appPath),
    assetCatalogs: await findAssetCatalogs(appPath),
    localizedStrings: await findLocalizedStrings(appPath)
  };

  return assets;
}

async function findImages(appPath) {
  const images = [];
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf'];

  async function scan(dir) {
    try {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          if (!item.endsWith('.app') && !item.startsWith('.')) {
            await scan(itemPath);
          }
        } else if (imageExtensions.some(ext => item.toLowerCase().endsWith(ext))) {
          images.push({
            filename: item,
            path: itemPath.replace(appPath, ''),
            size: stat.size
          });
        }
      }
    } catch (err) {
      // Ignore inaccessible directories
    }
  }

  await scan(appPath);
  return images;
}

async function findStoryboards(appPath) {
  const storyboards = [];

  async function scan(dir) {
    try {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          if (item.endsWith('.storyboardc')) {
            const storyboardName = item.replace('.storyboardc', '');
            storyboards.push({
              name: storyboardName,
              path: itemPath.replace(appPath, '')
            });
          } else if (!item.startsWith('.')) {
            await scan(itemPath);
          }
        }
      }
    } catch (err) {
      // Ignore inaccessible directories
    }
  }

  await scan(appPath);
  return storyboards;
}

async function findNibs(appPath) {
  const nibs = [];

  async function scan(dir) {
    try {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          if (item.endsWith('.nib')) {
            const nibName = item.replace('.nib', '');
            nibs.push({
              name: nibName,
              path: itemPath.replace(appPath, '')
            });
          } else if (!item.startsWith('.')) {
            await scan(itemPath);
          }
        }
      }
    } catch (err) {
      // Ignore inaccessible directories
    }
  }

  await scan(appPath);
  return nibs;
}

async function findAssetCatalogs(appPath) {
  const catalogs = [];

  async function scan(dir) {
    try {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          if (item.endsWith('.xcassets')) {
            catalogs.push({
              name: item,
              path: itemPath.replace(appPath, '')
            });
          } else if (!item.startsWith('.')) {
            await scan(itemPath);
          }
        }
      }
    } catch (err) {
      // Ignore inaccessible directories
    }
  }

  await scan(appPath);
  return catalogs;
}

async function findLocalizedStrings(appPath) {
  const strings = {};

  async function scan(dir) {
    try {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          if (item.endsWith('.lproj')) {
            const lang = item.replace('.lproj', '');
            const stringsFile = path.join(itemPath, 'Localizable.strings');
            if (fs.existsSync(stringsFile)) {
              strings[lang] = {
                path: stringsFile.replace(appPath, ''),
                size: (await fs.stat(stringsFile)).size
              };
            }
          } else if (!item.startsWith('.')) {
            await scan(itemPath);
          }
        }
      }
    } catch (err) {
      // Ignore inaccessible directories
    }
  }

  await scan(appPath);
  return strings;
}
