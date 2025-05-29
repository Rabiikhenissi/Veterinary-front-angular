import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'ZooVana',
  webDir: 'dist/crm-nova-angular/browser',
  
   server: {
    cleartext: true,
    androidScheme: 'http'
  }
};



export default config;
