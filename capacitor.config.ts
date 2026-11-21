import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.canlua.app',
  appName: 'So Can Lua',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;
