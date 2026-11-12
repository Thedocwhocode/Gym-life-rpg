// Keeps the CI release wiring alive across `expo prebuild --clean`:
// version from -PBUILD_NUMBER/-PDISPLAY_VERSION and the upload keystore from -PANDROID_UPLOAD_*.
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// with-release-signing';

// The fallback comes first: prebuild's version mod rewrites the first `versionCode`/`versionName` it finds.
const VERSION = `${MARKER}
        if (!project.hasProperty('BUILD_NUMBER')) {
            versionCode 1
            versionName "1.0.0"
        } else {
            versionCode project.property('BUILD_NUMBER').toInteger()
            versionName project.property('DISPLAY_VERSION')
        }`;

const RELEASE_CONFIG = `signingConfigs {
        release {
            if (project.hasProperty('ANDROID_UPLOAD_STORE_FILE')) {
                storeFile file(project.property('ANDROID_UPLOAD_STORE_FILE'))
                storePassword project.property('ANDROID_UPLOAD_STORE_PASSWORD')
                keyAlias project.property('ANDROID_UPLOAD_KEY_ALIAS')
                keyPassword project.property('ANDROID_UPLOAD_KEY_PASSWORD')
            }
        }`;

function apply(gradle) {
  if (gradle.includes(MARKER)) return gradle;
  const out = gradle
    .replace(/versionCode \d+\s*\n\s*versionName "[^"]*"/, VERSION)
    .replace(/signingConfigs \{/, RELEASE_CONFIG)
    .replace(
      /(\/\/ see https:\/\/reactnative\.dev\/docs\/signed-apk-android\.\s*\n\s*)signingConfig signingConfigs\.debug/,
      "$1signingConfig project.hasProperty('ANDROID_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug",
    )
    // Play requires Billing Library 7+; pinned since the original native project.
    .replace(
      /(implementation\("com\.facebook\.react:react-android"\))/,
      "$1\n    implementation('com.android.billingclient:billing:8.0.0')",
    );
  if (
    !out.includes('signingConfigs.release : signingConfigs.debug') ||
    !out.includes('billingclient:billing')
  ) {
    throw new Error('with-release-signing: build.gradle template changed, update the plugin');
  }
  return out;
}

module.exports = (config) =>
  withAppBuildGradle(config, (c) => {
    c.modResults.contents = apply(c.modResults.contents);
    return c;
  });
module.exports.apply = apply;
