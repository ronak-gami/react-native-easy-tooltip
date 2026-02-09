import { Text, View, StyleSheet } from 'react-native';
import { Tooltip } from 'react-native-easy-tooltip';

export default function App() {
  return (
    <View style={styles.container}>
      <Tooltip
        popover={<Text style={styles.tooltipText}>Hello from tooltip!</Text>}
        backgroundColor="#333"
        width={200}
        height={50}
      >
        <View style={styles.button}>
          <Text style={styles.buttonText}>Press me for tooltip</Text>
        </View>
      </Tooltip>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
  },
});
