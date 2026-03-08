const { withAndroidManifest, withProjectBuildGradle } = require('@expo/config-plugins');

const APP_ID = 'ca-app-pub-8002961623139540~9864421579';

// 1. Inject AdMob App ID into AndroidManifest.xml
function withAdMobManifest(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application[0];
    if (!app['meta-data']) app['meta-data'] = [];
    const META_NAME = 'com.google.android.gms.ads.APPLICATION_ID';
    if (!app['meta-data'].find((m) => m.$['android:name'] === META_NAME)) {
      app['meta-data'].push({
        $: { 'android:name': META_NAME, 'android:value': APP_ID },
      });
    }
    return cfg;
  });
}

// 2. Inject googleMobileAdsJson = null into root build.gradle
// so react-native-google-mobile-ads build.gradle doesn't throw
function withAdMobGradle(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('googleMobileAdsJson')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /^allprojects\s*\{/m,
        `ext {\n    googleMobileAdsJson = null\n}\n\nallprojects {`
      );
    }
    return cfg;
  });
}

module.exports = function withAdMob(config) {
  config = withAdMobManifest(config);
  config = withAdMobGradle(config);
  return config;
};
