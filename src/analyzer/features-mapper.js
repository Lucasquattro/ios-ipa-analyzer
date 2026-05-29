export function mapFeatures(infoPlist, uiAssets) {
  const features = [];

  // Map features from permissions
  const featuresByPermission = {
    'Camera': infoPlist.permissions.some(p => p.key === 'NSCameraUsageDescription'),
    'Photo Library': infoPlist.permissions.some(p => ['NSPhotoLibraryUsageDescription', 'NSPhotoLibraryAddUsageDescription'].includes(p.key)),
    'Location Services': infoPlist.permissions.some(p => p.key.includes('NSLocation')),
    'Microphone': infoPlist.permissions.some(p => p.key === 'NSMicrophoneUsageDescription'),
    'Contacts': infoPlist.permissions.some(p => p.key === 'NSContactsUsageDescription'),
    'Calendar': infoPlist.permissions.some(p => p.key === 'NSCalendarsUsageDescription'),
    'Reminders': infoPlist.permissions.some(p => p.key === 'NSRemindersUsageDescription'),
    'Health Data': infoPlist.permissions.some(p => p.key.includes('NSHealth')),
    'Motion & Fitness': infoPlist.permissions.some(p => p.key === 'NSMotionUsageDescription'),
    'App Tracking': infoPlist.permissions.some(p => p.key === 'NSUserTrackingUsageDescription'),
    'Bluetooth': infoPlist.permissions.some(p => p.key.includes('NSBluetooth')),
    'Face ID': infoPlist.permissions.some(p => p.key === 'NSFaceIDUsageDescription'),
    'Siri': infoPlist.permissions.some(p => p.key === 'NSSiriUsageDescription'),
    'HomeKit': infoPlist.permissions.some(p => p.key === 'NSHomeKitUsageDescription'),
    'Nearby Interaction': infoPlist.permissions.some(p => p.key === 'NSNearbyInteractionUsageDescription'),
    'Local Network': infoPlist.permissions.some(p => p.key === 'NSLocalNetworkUsageDescription')
  };

  for (const [feature, enabled] of Object.entries(featuresByPermission)) {
    if (enabled) {
      features.push({
        name: feature,
        category: 'Device Access',
        type: 'permission'
      });
    }
  }

  // Detect UI features from storyboards
  if (uiAssets.storyboards && uiAssets.storyboards.length > 0) {
    features.push({
      name: 'User Interface',
      category: 'Interface',
      type: 'ui',
      details: `${uiAssets.storyboards.length} storyboard(s) found`
    });
  }

  // Detect communication features
  const hasURLSchemes = infoPlist.urlSchemes && infoPlist.urlSchemes.length > 0;
  if (hasURLSchemes) {
    features.push({
      name: 'Custom URL Schemes',
      category: 'Communication',
      type: 'capability',
      schemes: infoPlist.urlSchemes.flatMap(u => u.schemes)
    });
  }

  // Detect document support
  if (infoPlist.documentTypes && infoPlist.documentTypes.length > 0) {
    const types = infoPlist.documentTypes.map(dt => dt.CFBundleTypeName || 'Unknown').join(', ');
    features.push({
      name: 'Document Support',
      category: 'File Handling',
      type: 'capability',
      details: types
    });
  }

  // Detect device capabilities
  if (Object.keys(infoPlist.capabilities).length > 0) {
    for (const [capability, enabled] of Object.entries(infoPlist.capabilities)) {
      if (enabled) {
        features.push({
          name: capability,
          category: 'Device Requirements',
          type: 'requirement'
        });
      }
    }
  }

  // Localization features
  if (infoPlist.localizations && infoPlist.localizations.length > 0) {
    features.push({
      name: 'Localization',
      category: 'Content',
      type: 'capability',
      languages: infoPlist.localizations
    });
  }

  // Interface orientation support
  const orientations = new Set([
    ...infoPlist.supportedInterfaceOrientations,
    ...infoPlist.supportedInterfaceOrientationsIPad
  ]);
  if (orientations.size > 0) {
    features.push({
      name: 'Interface Orientations',
      category: 'Interface',
      type: 'ui',
      orientations: Array.from(orientations)
    });
  }

  // Asset-based feature detection
  if (uiAssets.images && uiAssets.images.length > 0) {
    features.push({
      name: 'Graphics & Images',
      category: 'Content',
      type: 'asset',
      count: uiAssets.images.length
    });
  }

  // Asset catalogs
  if (uiAssets.assetCatalogs && uiAssets.assetCatalogs.length > 0) {
    features.push({
      name: 'Asset Catalogs',
      category: 'Content',
      type: 'asset',
      catalogs: uiAssets.assetCatalogs.length
    });
  }

  return features.sort((a, b) => {
    const categoryOrder = ['Device Access', 'Interface', 'Communication', 'File Handling', 'Device Requirements', 'Content'];
    const aIdx = categoryOrder.indexOf(a.category);
    const bIdx = categoryOrder.indexOf(b.category);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.name.localeCompare(b.name);
  });
}

export function groupFeaturesByCategory(features) {
  const grouped = {};
  for (const feature of features) {
    if (!grouped[feature.category]) {
      grouped[feature.category] = [];
    }
    grouped[feature.category].push(feature);
  }
  return grouped;
}
