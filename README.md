# react-native-easy-tooltip

A lightweight and easy-to-use tooltip component for React Native with **smart auto-positioning**, **RTL support**, and **customizable styling**. Built with functional components and TypeScript.

## Features

- **Smart Positioning** — Automatically finds the best quadrant (top/bottom/left/right) based on available screen space
- **RTL Support** — Full right-to-left language support out of the box
- **Customizable** — Style the tooltip container, pointer, overlay, and highlight
- **Controlled & Uncontrolled** — Use internal state or control visibility externally
- **TypeScript** — Full type definitions included
- **Lightweight** — Zero native dependencies, pure JS implementation

## Installation

```sh
npm install react-native-easy-tooltip
# or
yarn add react-native-easy-tooltip
```

No native linking required — this is a pure JavaScript library.

## Basic Usage

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import { Tooltip } from 'react-native-easy-tooltip';

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Tooltip
        popover={<Text style={{ color: 'white' }}>Hello from tooltip!</Text>}
      >
        <Text>Press me</Text>
      </Tooltip>
    </View>
  );
};

export default App;
```

## Controlled Mode

You can control the tooltip visibility externally:

```tsx
import React, { useState } from 'react';
import { Text, View, Button } from 'react-native';
import { Tooltip } from 'react-native-easy-tooltip';

const App = () => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Tooltip
        popover={<Text style={{ color: 'white' }}>Controlled tooltip</Text>}
        isVisible={visible}
        onVisibilityChange={setVisible}
        actionType="none"
      >
        <Text>Target element</Text>
      </Tooltip>
      <Button title="Toggle Tooltip" onPress={() => setVisible(!visible)} />
    </View>
  );
};
```

## Props

| Prop                 | Type                               | Default                       | Description                                        |
| -------------------- | ---------------------------------- | ----------------------------- | -------------------------------------------------- |
| `children`           | `ReactNode`                        | **required**                  | The element the tooltip wraps around               |
| `popover`            | `ReactElement`                     | `undefined`                   | Content to display inside the tooltip              |
| `withPointer`        | `boolean`                          | `true`                        | Show a pointer/arrow on the tooltip                |
| `height`             | `number \| string`                 | `40`                          | Height of the tooltip container                    |
| `width`              | `number \| string`                 | `150`                         | Width of the tooltip container                     |
| `containerStyle`     | `StyleProp<ViewStyle>`             | `{}`                          | Custom styles for the tooltip container            |
| `pointerColor`       | `string`                           | Same as `backgroundColor`     | Color of the pointer/arrow                         |
| `pointerStyle`       | `StyleProp<ViewStyle>`             | `{}`                          | Custom styles for the pointer                      |
| `onClose`            | `() => void`                       | `() => {}`                    | Called when the tooltip is closed                  |
| `onOpen`             | `() => void`                       | `() => {}`                    | Called when the tooltip is opened                  |
| `withOverlay`        | `boolean`                          | `true`                        | Show a semi-transparent overlay behind the tooltip |
| `overlayColor`       | `string`                           | `'rgba(250, 250, 250, 0.70)'` | Color of the overlay                               |
| `backgroundColor`    | `string`                           | `'#617080'`                   | Background color of the tooltip                    |
| `highlightColor`     | `string`                           | `'transparent'`               | Highlight color for the wrapped element            |
| `toggleWrapperProps` | `TouchableOpacityProps`            | `{}`                          | Props for the TouchableOpacity wrapper             |
| `actionType`         | `'press' \| 'longPress' \| 'none'` | `'press'`                     | How to trigger the tooltip                         |
| `isVisible`          | `boolean`                          | `undefined`                   | Control visibility externally (controlled mode)    |
| `onVisibilityChange` | `(visible: boolean) => void`       | `undefined`                   | Callback when visibility changes (controlled mode) |

## Custom Styling Example

```tsx
<Tooltip
  popover={<Text style={{ color: 'white' }}>Styled tooltip</Text>}
  backgroundColor="#333"
  pointerColor="#333"
  containerStyle={{
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }}
  overlayColor="rgba(0, 0, 0, 0.5)"
  width={200}
  height={60}
>
  <Text>Tap for styled tooltip</Text>
</Tooltip>
```

## Long Press Example

```tsx
<Tooltip
  popover={<Text style={{ color: 'white' }}>Long press tooltip</Text>}
  actionType="longPress"
>
  <Text>Long press me</Text>
</Tooltip>
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
