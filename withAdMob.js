const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAdMob(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const app = manifest.manifest.application[0];
    if (!app['meta-data']) app['meta-data'] = [];

    const META_NAME = 'com.google.android.gms.ads.APPLICATION_ID';
    const already = app['meta-data'].find(
      (m) => m.$['android:name'] === META_NAME
    );
    if (!already) {
      app['meta-data'].push({
        $: {
          'android:name': META_NAME,
          'android:value': 'ca-app-pub-8002961623139540~9864421579',
        },
      });
    }
    return cfg;
  });
};
