import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import React from 'react';
import color from './src/misc/color';
import AudioProvider from './src/context/AudioProvider';
import AppNavigator from './src/navigation/AppNavigator.js';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: color.APP_BG,
  }
}

export default function App() {
  return (
  <AudioProvider>
    <NavigationContainer theme={MyTheme}>
      <AppNavigator />
    </NavigationContainer>
  </AudioProvider>
  );
}
