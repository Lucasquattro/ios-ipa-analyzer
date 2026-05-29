# iOS IPA Feature Analyzer

Comprehensive static analysis tool for iOS .ipa applications that generates detailed feature audit reports in HTML and PDF formats.

## Features

- **IPA Extraction & Analysis**: Decompresses and analyzes iOS application packages
- **Metadata Parsing**: Extracts app information from Info.plist (version, bundle ID, permissions, etc.)
- **UI Asset Detection**: Identifies storyboards, XIB files, images, and asset catalogs
- **Feature Mapping**: Maps permissions and capabilities to user-visible features
- **Professional Reports**: Generates interactive HTML and print-friendly PDF reports
- **Non-Technical Friendly**: Reports are designed to be understood by both technical and non-technical stakeholders

## Installation

### Standard Installation

```bash
npm install
```

### Remote/Headless Environment Setup

For remote environments without GUI support (like Claude Code sessions):

```bash
# Install dependencies without downloading Chromium
PUPPETEER_SKIP_DOWNLOAD=true npm install

# Then to enable PDF generation, install Chromium:
npm run install:chromium

# Or manually set the environment variable:
PUPPETEER_SKIP_DOWNLOAD=false npm install
```

**Note**: HTML reports work out-of-the-box in any environment. PDF generation requires Chromium/Chrome, which needs to be downloaded separately in remote environments.

## Usage

### Basic Analysis

```bash
node src/index.js <path-to-app.ipa>
```

This will generate both HTML and PDF reports in the `./reports` directory.

### Options

```bash
node src/index.js <path-to-app.ipa> [options]

Options:
  -o, --output <dir>      Output directory for reports (default: ./reports)
  -f, --format <format>   Report format: html, pdf, or both (default: both)
  -n, --no-cleanup        Keep extracted files for further analysis
  -h, --help              Display help information
```

### Examples

**Generate HTML report only:**
```bash
node src/index.js app.ipa -f html
```

**Generate PDF report only:**
```bash
node src/index.js app.ipa -f pdf
```

**Save to custom directory:**
```bash
node src/index.js app.ipa -o /path/to/output
```

**Keep extracted files for inspection:**
```bash
node src/index.js app.ipa --no-cleanup
```

## How It Works

### 1. IPA Extraction
- The .ipa file is a ZIP archive containing the app bundle
- Extracts the Payload directory and identifies the .app bundle

### 2. Metadata Parsing
- Reads and parses the `Info.plist` file
- Extracts:
  - App name, version, and build number
  - Bundle identifier
  - Minimum iOS version
  - Supported devices and orientations
  - Permissions and capabilities
  - URL schemes
  - Localization support

### 3. UI Asset Detection
- Scans for visual elements:
  - Images (.png, .jpg, .gif, etc.)
  - Storyboards (.storyboardc)
  - XIB files (.nib)
  - Asset catalogs (.xcassets)
  - Localized strings files

### 4. Feature Mapping
- Correlates permissions with user-facing features
- Groups features by category:
  - Device Access (camera, microphone, location, etc.)
  - Interface (orientations, UI components)
  - Communication (URL schemes, document types)
  - File Handling (supported document types)
  - Device Requirements (required capabilities)
  - Content (images, localizations)

### 5. Report Generation
- **HTML Report**: Interactive, browser-viewable report with navigation and rich formatting
- **PDF Report**: Print-friendly version suitable for documentation and sharing

## Report Sections

### Executive Summary
- Quick overview of detected features, permissions, images, and storyboards

### Features
- Categorized list of all detected app features
- Organized by category (Device Access, Interface, etc.)
- Each feature shows its type and relevant details

### Permissions & Capabilities
- Full list of required permissions with descriptions
- URL schemes the app can handle
- Supported document types
- Required device capabilities

### Assets & Resources
- All images found in the app
- Storyboard and XIB files
- Asset catalogs
- Localized string files

### Technical Details
- Application metadata table
- Supported interface orientations
- System-level information

## Output Files

The tool generates:
- `{bundle_id}_audit.html` - Interactive HTML report
- `{bundle_id}_audit.pdf` - PDF report (if PDF format selected)

The filename is based on the app's bundle identifier for easy identification.

## Architecture

```
src/
├── analyzer/
│   ├── ipa-extractor.js      # IPA decompression and structure analysis
│   ├── plist-parser.js       # Info.plist parsing
│   ├── ui-extractor.js       # Asset detection
│   └── features-mapper.js    # Feature mapping and categorization
├── report/
│   ├── html-generator.js     # HTML report generation
│   ├── pdf-generator.js      # PDF generation using Puppeteer
│   └── templates/
│       └── report-template.html
└── index.js                  # CLI entry point
```

## Requirements

- Node.js 14+
- Puppeteer (for PDF generation)
- All dependencies listed in package.json

## Limitations

This is a **static analysis** tool. It:
- Does NOT execute the application
- Does NOT perform dynamic analysis
- Does NOT detect features that are conditionally loaded at runtime
- Reports what is statically present in the application package

For comprehensive auditing, combine this tool with:
- Dynamic testing in iOS simulator/device
- Network traffic analysis
- Runtime behavior monitoring

## License

MIT

## Support

For issues or questions, please refer to the documentation or open an issue in the repository.
