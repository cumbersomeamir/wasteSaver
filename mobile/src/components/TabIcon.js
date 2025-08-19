import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../constants/theme';

const TabIcon = ({ name, focused, color, size = 24 }) => {
  return (
    <View style={styles.container}>
      <Icon
        name={name}
        size={size}
        color={focused ? COLORS.primary : color}
      />
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});

export default TabIcon;
