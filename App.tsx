import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastComponent } from './src/components';
import { revenueCatService } from './src/services/revenueCat.service';
import { initializeNotifications } from './src/services/notification.service';
import './src/i18n';

function App() {
  useColorScheme();

  React.useEffect(() => {
    revenueCatService.initialize();
    initializeNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={'dark-content'}
        translucent={false}
      />
      <AppNavigator />
      <ToastComponent />
    </SafeAreaProvider>
  );
}

export default App;
