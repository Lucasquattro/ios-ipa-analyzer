import fs from 'fs-extra';
import plist from 'plist';

export async function parseInfoPlist(infoPlistPath) {
  if (!fs.existsSync(infoPlistPath)) {
    throw new Error(`Info.plist not found: ${infoPlistPath}`);
  }

  const content = await fs.readFile(infoPlistPath, 'utf8');
  const parsed = plist.parse(content);

  return {
    bundleIdentifier: parsed.CFBundleIdentifier || 'Unknown',
    displayName: parsed.CFBundleDisplayName || parsed.CFBundleName || 'Unknown',
    version: parsed.CFBundleShortVersionString || 'Unknown',
    build: parsed.CFBundleVersion || 'Unknown',
    minOSVersion: parsed.MinimumOSVersion || 'Unknown',
    supportedDevices: parsed.UISupportedDevices || [],
    permissions: extractPermissions(parsed),
    capabilities: extractCapabilities(parsed),
    urlSchemes: extractURLSchemes(parsed),
    documentTypes: parsed.CFBundleDocumentTypes || [],
    localizations: parsed.CFBundleLocalizations || [],
    supportedInterfaceOrientations: parsed.UISupportedInterfaceOrientations || [],
    supportedInterfaceOrientationsIPad: parsed.UISupportedInterfaceOrientationsIPad || [],
    rawPlist: parsed
  };
}

function extractPermissions(plist) {
  const permissionMap = {
    'NSCameraUsageDescription': 'Camera',
    'NSMicrophoneUsageDescription': 'Microphone',
    'NSPhotoLibraryUsageDescription': 'Photo Library Access',
    'NSPhotoLibraryAddUsageDescription': 'Photo Library Write',
    'NSLocationWhenInUseUsageDescription': 'Location (When In Use)',
    'NSLocationAlwaysAndWhenInUseUsageDescription': 'Location (Always)',
    'NSLocationAlwaysUsageDescription': 'Location (Always - Legacy)',
    'NSContactsUsageDescription': 'Contacts',
    'NSCalendarsUsageDescription': 'Calendar',
    'NSRemindersUsageDescription': 'Reminders',
    'NSHealthShareUsageDescription': 'Health Data Read',
    'NSHealthUpdateUsageDescription': 'Health Data Write',
    'NSMotionUsageDescription': 'Motion & Fitness',
    'NSUserTrackingUsageDescription': 'App Tracking',
    'NSBluetoothPeripheralUsageDescription': 'Bluetooth Peripheral',
    'NSBluetoothAlwaysAndWhenInUseUsageDescription': 'Bluetooth',
    'NSFaceIDUsageDescription': 'Face ID',
    'NSSiriUsageDescription': 'Siri',
    'NSHomeKitUsageDescription': 'HomeKit',
    'NSNearbyInteractionUsageDescription': 'Nearby Interaction',
    'NSLocalNetworkUsageDescription': 'Local Network'
  };

  const permissions = [];
  for (const [key, name] of Object.entries(permissionMap)) {
    if (plist[key]) {
      permissions.push({
        key,
        name,
        description: plist[key]
      });
    }
  }

  return permissions;
}

function extractCapabilities(plist) {
  const capabilities = {};
  if (plist.UIRequiredDeviceCapabilities) {
    for (const cap of plist.UIRequiredDeviceCapabilities) {
      capabilities[cap] = true;
    }
  }
  return capabilities;
}

function extractURLSchemes(plist) {
  const schemes = [];
  if (plist.CFBundleURLTypes) {
    for (const urlType of plist.CFBundleURLTypes) {
      schemes.push({
        identifier: urlType.CFBundleURLName || 'Unnamed',
        schemes: urlType.CFBundleURLSchemes || []
      });
    }
  }
  return schemes;
}
