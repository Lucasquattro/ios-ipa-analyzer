import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateHTML(analysisData, outputPath) {
  const templatePath = path.join(__dirname, 'templates', 'report-template.html');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const template = await fs.readFile(templatePath, 'utf8');
  const compiled = Handlebars.compile(template);

  // Register custom helpers
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  Handlebars.registerHelper('capitalize', function(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  Handlebars.registerHelper('json', function(obj) {
    return JSON.stringify(obj, null, 2);
  });

  const htmlContent = compiled({
    timestamp: new Date().toISOString(),
    app: analysisData.infoPlist,
    features: analysisData.features,
    featuresByCategory: analysisData.featuresByCategory,
    assets: analysisData.uiAssets,
    permissions: analysisData.infoPlist.permissions,
    urlSchemes: analysisData.infoPlist.urlSchemes,
    documentTypes: analysisData.infoPlist.documentTypes,
    localizations: analysisData.infoPlist.localizations
  });

  await fs.writeFile(outputPath, htmlContent, 'utf8');
  return outputPath;
}
