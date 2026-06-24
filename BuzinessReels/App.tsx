import React from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import ReelFeedScreen from './src/screens/ReelFeedScreen';

const App = () => {
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ReelFeedScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default App;
