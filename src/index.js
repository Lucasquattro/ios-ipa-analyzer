#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractIPA } from './analyzer/ipa-extractor.js';
import { parseInfoPlist } from './analyzer/plist-parser.js';
import { extractUI } from './analyzer/ui-extractor.js';
import { mapFeatures, groupFeaturesByCategory } from './analyzer/features-mapper.js';
import { generateHTML } from './report/html-generator.js';
import { generatePDF } from './report/pdf-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const program = new Command();

program
  .name('ios-ipa-analyzer')
  .description('Comprehensive feature audit tool for iOS .ipa applications')
  .version('1.0.0')
  .argument('<ipaPath>', 'Path to the .ipa file to analyze')
  .option('-o, --output <dir>', 'Output directory for reports', './reports')
  .option('-f, --format <format>', 'Report format: html, pdf, or both', 'both')
  .option('-n, --no-cleanup', 'Keep extracted files after analysis')
  .action(async (ipaPath, options) => {
    try {
      console.log('🚀 Starting iOS IPA Analysis...\n');

      // Validate input file
      const absoluteIpaPath = path.resolve(ipaPath);
      if (!fs.existsSync(absoluteIpaPath)) {
        throw new Error(`IPA file not found: ${absoluteIpaPath}`);
      }

      // Create output directory
      const outputDir = path.resolve(options.output);
      await fs.ensureDir(outputDir);

      // Create temporary extraction directory
      const tempDir = path.join(outputDir, '.temp');
      await fs.ensureDir(tempDir);

      console.log(`📦 Extracting IPA: ${path.basename(absoluteIpaPath)}`);
      const structure = await extractIPA(absoluteIpaPath, tempDir);
      console.log('✓ IPA extracted successfully\n');

      console.log('📝 Parsing application metadata...');
      const infoPlist = await parseInfoPlist(structure.infoPlistPath);
      console.log(`✓ App: ${infoPlist.displayName} v${infoPlist.version}\n`);

      console.log('🎨 Extracting UI assets...');
      const uiAssets = await extractUI(structure.appPath);
      console.log(`✓ Found ${uiAssets.images.length} images, ${uiAssets.storyboards.length} storyboards\n`);

      console.log('✨ Mapping features...');
      const features = mapFeatures(infoPlist, uiAssets);
      const featuresByCategory = groupFeaturesByCategory(features);
      console.log(`✓ Detected ${features.length} features\n`);

      // Prepare analysis data
      const analysisData = {
        infoPlist,
        uiAssets,
        features,
        featuresByCategory
      };

      // Generate reports
      const reportBaseName = `${infoPlist.bundleIdentifier.replace(/\./g, '_')}_audit`;

      if (['html', 'both'].includes(options.format)) {
        console.log('🌐 Generating HTML report...');
        const htmlPath = path.join(outputDir, `${reportBaseName}.html`);
        await generateHTML(analysisData, htmlPath);
        console.log(`✓ HTML report saved: ${htmlPath}\n`);
      }

      if (['pdf', 'both'].includes(options.format)) {
        console.log('📄 Generating PDF report...');
        const htmlPath = path.join(outputDir, `${reportBaseName}_temp.html`);
        await generateHTML(analysisData, htmlPath);
        const pdfPath = path.join(outputDir, `${reportBaseName}.pdf`);
        await generatePDF(htmlPath, pdfPath);
        await fs.remove(htmlPath); // Clean up temporary HTML
        console.log(`✓ PDF report saved: ${pdfPath}\n`);
      }

      // Cleanup
      if (options.cleanup) {
        console.log('🧹 Cleaning up temporary files...');
        await fs.remove(tempDir);
        console.log('✓ Cleanup complete\n');
      } else {
        console.log('ℹ️  Extracted files preserved in:', tempDir);
        console.log('   Use --no-cleanup to keep them for further analysis\n');
      }

      console.log('✅ Analysis complete!');
      console.log(`\n📊 Summary:`);
      console.log(`   App: ${infoPlist.displayName}`);
      console.log(`   Bundle ID: ${infoPlist.bundleIdentifier}`);
      console.log(`   Version: ${infoPlist.version}`);
      console.log(`   Features Detected: ${features.length}`);
      console.log(`   Permissions: ${infoPlist.permissions.length}`);
      console.log(`   Images: ${uiAssets.images.length}`);
      console.log(`   Storyboards: ${uiAssets.storyboards.length}`);
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
