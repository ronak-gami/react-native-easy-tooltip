import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

export interface TriangleProps {
  style?: StyleProp<ViewStyle>;
  isDown?: boolean;
}

const Triangle: React.FC<TriangleProps> = ({ style, isDown = false }) => (
  <View style={[styles.triangle, style, isDown ? styles.down : undefined]} />
);

const styles = StyleSheet.create({
  down: {
    transform: [{ rotate: '180deg' }],
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
});

export default Triangle;
