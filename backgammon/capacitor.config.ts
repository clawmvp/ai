import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.backgammon.app',
  appName: 'Backgammon',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
