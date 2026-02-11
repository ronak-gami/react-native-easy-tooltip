import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type ReactElement,
  type ComponentRef,
} from 'react';
import {
  TouchableOpacity,
  Modal,
  View,
  I18nManager,
  type StyleProp,
  type ViewStyle,
  type TouchableOpacityProps,
} from 'react-native';

interface MutableViewStyle {
  position?: ViewStyle['position'];
  left?: number;
  right?: number;
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  display?: ViewStyle['display'];
  alignItems?: ViewStyle['alignItems'];
  justifyContent?: ViewStyle['justifyContent'];
  flex?: number;
  borderRadius?: number;
  padding?: number;
  top?: number;
  bottom?: number;
  [key: string]: unknown;
}

import Triangle from './Triangle';
import { ScreenWidth, ScreenHeight, isIOS, statusBarOffset } from './helpers';
import getTooltipCoordinate from './getTooltipCoordinate';

/**
 * Defines how the tooltip should be triggered
 * - 'press': Tooltip appears when user taps once
 * - 'longPress': Tooltip appears when user holds the tap
 * - 'none': Tooltip won't appear on touch (use isVisible prop to control it manually)
 */
export type ActionType = 'press' | 'longPress' | 'none';

/**
 * Props for the Tooltip component
 */
export interface TooltipProps {
  /**
   * Required. The element that will trigger the tooltip when interacted with.
   * This can be any React component like a button, text, icon, etc.
   * @example <Tooltip><Text>Click me</Text></Tooltip>
   */
  children: ReactNode;

  /**
   * Optional. The content shown inside the tooltip popup.
   * Can be any React element like Text, View, Image, etc.
   * @default undefined
   * @example popover={<Text>Hello from tooltip!</Text>}
   */
  popover?: ReactElement;

  /**
   * Optional. Show or hide the arrow/pointer that points to the trigger element.
   * Set to false if you want a tooltip without the arrow.
   * @default true
   */
  withPointer?: boolean;

  /**
   * Optional. The height of the tooltip box.
   * Can be a number (in pixels) or a string ('auto', '50%', etc.)
   * @default 40
   * @example height={100} or height="auto"
   */
  height?: number | string;

  /**
   * Optional. The width of the tooltip box.
   * Can be a number (in pixels) or a string ('auto', '80%', etc.)
   * @default 150
   * @example width={200} or width="auto"
   */
  width?: number | string;

  /**
   * Optional. Custom styles to apply to the tooltip container.
   * Use this to customize the look of the tooltip (padding, borders, shadows, etc.)
   * @default {}
   * @example containerStyle={{ borderRadius: 15, padding: 20 }}
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Optional. The color of the arrow/pointer.
   * If not provided, it will match the backgroundColor.
   * @default undefined (uses backgroundColor)
   * @example pointerColor="#FF5733"
   */
  pointerColor?: string;

  /**
   * Optional. Custom styles for the arrow/pointer.
   * Use this to adjust the pointer's appearance.
   * @default {}
   * @example pointerStyle={{ borderBottomWidth: 15 }}
   */
  pointerStyle?: StyleProp<ViewStyle>;

  /**
   * Optional. Function called when the tooltip is closed/hidden.
   * Useful for cleanup or tracking purposes.
   * @default () => {}
   * @example onClose={() => console.log('Tooltip closed')}
   */
  onClose?: () => void;

  /**
   * Optional. Function called when the tooltip is opened/shown.
   * Useful for analytics or triggering other actions.
   * @default () => {}
   * @example onOpen={() => console.log('Tooltip opened')}
   */
  onOpen?: () => void;

  /**
   * Optional. Show a dimmed overlay behind the tooltip.
   * When true, the rest of the screen will be slightly darkened.
   * @default true
   */
  withOverlay?: boolean;

  /**
   * Optional. The color of the overlay background.
   * Only applies when withOverlay is true.
   * @default 'rgba(250, 250, 250, 0.70)'
   * @example overlayColor="rgba(0, 0, 0, 0.5)"
   */
  overlayColor?: string;

  /**
   * Optional. The background color of the tooltip box.
   * @default '#617080'
   * @example backgroundColor="#333333"
   */
  backgroundColor?: string;

  /**
   * Optional. Background color applied to the trigger element when tooltip is visible.
   * Use this to highlight what triggered the tooltip.
   * @default 'transparent'
   * @example highlightColor="rgba(255, 255, 0, 0.3)"
   */
  highlightColor?: string;

  /**
   * Optional. Additional props to pass to the TouchableOpacity that wraps the children.
   * Use this to customize the touchable behavior (activeOpacity, testID, etc.)
   * @default {}
   * @example toggleWrapperProps={{ testID: 'tooltip-trigger' }}
   */
  toggleWrapperProps?: TouchableOpacityProps;

  /**
   * Optional. How the user should trigger the tooltip.
   * - 'press': Single tap to toggle
   * - 'longPress': Hold to show tooltip
   * - 'none': Don't respond to touches (control with isVisible prop)
   * @default 'press'
   * @example actionType="longPress"
   */
  actionType?: ActionType;

  /**
   * Optional. Control the tooltip visibility from outside (controlled mode).
   * When provided, the component becomes "controlled" and you manage visibility.
   * Leave undefined to let the component manage its own visibility (uncontrolled mode).
   * @default undefined
   * @example isVisible={showTooltip}
   */
  isVisible?: boolean;

  /**
   * Optional. Callback when visibility changes in controlled mode.
   * Use together with isVisible to create a controlled component.
   * The function receives the new visibility state as a parameter.
   * @default undefined
   * @example onVisibilityChange={(visible) => setShowTooltip(visible)}
   */
  onVisibilityChange?: (visible: boolean) => void;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  popover,
  withPointer = true,
  height = 40,
  width = 150,
  containerStyle = {},
  pointerColor,
  pointerStyle = {},
  onClose = () => {},
  onOpen = () => {},
  withOverlay = true,
  overlayColor,
  backgroundColor = '#617080',
  highlightColor = 'transparent',
  toggleWrapperProps = {},
  actionType = 'press',
  isVisible: isVisibleProp,
  onVisibilityChange,
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [yOffset, setYOffset] = useState(0);
  const [xOffset, setXOffset] = useState(0);
  const [elementWidth, setElementWidth] = useState(0);
  const [elementHeight, setElementHeight] = useState(0);

  const renderedElement = useRef<ComponentRef<typeof View>>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Support both controlled and uncontrolled modes
  const isControlled = isVisibleProp !== undefined;
  const isVisible = isControlled ? isVisibleProp : internalVisible;

  const getElementPosition = useCallback(() => {
    renderedElement.current?.measureInWindow(
      (pageOffsetX: number, pageOffsetY: number, w: number, h: number) => {
        setXOffset(pageOffsetX);
        setYOffset(pageOffsetY);
        setElementWidth(w);
        setElementHeight(h);
      }
    );
  }, []);

  const toggleTooltip = useCallback(() => {
    getElementPosition();

    if (isControlled) {
      onVisibilityChange?.(!isVisible);
      if (isVisible && !isIOS) {
        onClose();
      }
    } else {
      setInternalVisible((prev) => {
        if (prev && !isIOS) {
          onClose();
        }
        return !prev;
      });
    }
  }, [
    getElementPosition,
    isControlled,
    isVisible,
    onClose,
    onVisibilityChange,
  ]);

  const wrapWithAction = useCallback(
    (type: ActionType, content: ReactNode): ReactElement => {
      switch (type) {
        case 'press':
          return (
            <TouchableOpacity
              onPress={toggleTooltip}
              activeOpacity={1}
              {...toggleWrapperProps}
            >
              {content}
            </TouchableOpacity>
          );
        case 'longPress':
          return (
            <TouchableOpacity
              onLongPress={toggleTooltip}
              activeOpacity={1}
              {...toggleWrapperProps}
            >
              {content}
            </TouchableOpacity>
          );
        default:
          return <>{content}</>;
      }
    },
    [toggleTooltip, toggleWrapperProps]
  );

  const getTooltipStyle = useCallback(() => {
    const { x, y } = getTooltipCoordinate(
      xOffset,
      yOffset,
      elementWidth,
      elementHeight,
      ScreenWidth,
      ScreenHeight,
      width,
      withPointer
    );

    const tooltipStyle: MutableViewStyle = {
      position: 'absolute',
      left: I18nManager.isRTL ? undefined : x,
      right: I18nManager.isRTL ? x : undefined,
      width: width as number,
      height: height as number,
      backgroundColor,
      // default styles
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      borderRadius: 10,
      padding: 10,
      ...(containerStyle as object),
    };

    const pastMiddleLine = yOffset > y;

    if (typeof height !== 'number' && pastMiddleLine) {
      tooltipStyle.bottom = ScreenHeight - y - statusBarOffset;
      tooltipStyle.top = undefined;
    } else if (typeof height === 'number' && pastMiddleLine) {
      tooltipStyle.top = y - height + statusBarOffset;
    } else {
      tooltipStyle.top = y + statusBarOffset;
    }

    return { tooltipStyle: tooltipStyle as ViewStyle, pastMiddleLine };
  }, [
    xOffset,
    yOffset,
    elementWidth,
    elementHeight,
    width,
    height,
    withPointer,
    backgroundColor,
    containerStyle,
  ]);

  const renderPointer = useCallback(
    (pastMiddleLine: boolean) => {
      return (
        <View
          style={{
            position: 'absolute',
            top: pastMiddleLine
              ? yOffset + statusBarOffset - 13
              : yOffset + statusBarOffset + elementHeight - 2,
            left: I18nManager.isRTL
              ? undefined
              : xOffset + elementWidth / 2 - 7.5,
            right: I18nManager.isRTL
              ? xOffset + elementWidth / 2 - 7.5
              : undefined,
          }}
        >
          <Triangle
            style={{
              borderBottomColor: pointerColor || backgroundColor,
              ...(pointerStyle as object),
            }}
            isDown={pastMiddleLine}
          />
        </View>
      );
    },
    [
      yOffset,
      elementHeight,
      xOffset,
      elementWidth,
      pointerColor,
      backgroundColor,
      pointerStyle,
    ]
  );

  const renderContent = useCallback(
    (withTooltipContent: boolean) => {
      if (!withTooltipContent) {
        return wrapWithAction(actionType, children);
      }

      const { pastMiddleLine, tooltipStyle } = getTooltipStyle();

      return (
        <>
          <View
            style={{
              position: 'absolute',
              top: yOffset + statusBarOffset,
              left: I18nManager.isRTL ? undefined : xOffset,
              right: I18nManager.isRTL ? xOffset : undefined,
              backgroundColor: highlightColor,
              overflow: 'visible',
              width: elementWidth,
              height: elementHeight,
            }}
          >
            {children}
          </View>
          {withPointer && renderPointer(Boolean(pastMiddleLine))}
          <View style={tooltipStyle}>{popover}</View>
        </>
      );
    },
    [
      wrapWithAction,
      actionType,
      children,
      getTooltipStyle,
      yOffset,
      xOffset,
      highlightColor,
      elementWidth,
      elementHeight,
      withPointer,
      renderPointer,
      popover,
    ]
  );

  useEffect(() => {
    // Wait to compute onLayout values
    timeoutRef.current = setTimeout(getElementPosition, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [getElementPosition]);

  const overlayStyle: ViewStyle = {
    backgroundColor: withOverlay
      ? overlayColor
        ? overlayColor
        : 'rgba(250, 250, 250, 0.70)'
      : 'transparent',
    flex: 1,
  };

  return (
    <View collapsable={false} ref={renderedElement}>
      {renderContent(false)}
      <Modal
        animationType="fade"
        visible={isVisible}
        transparent
        onDismiss={onClose}
        onShow={onOpen}
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={overlayStyle}
          onPress={toggleTooltip}
          activeOpacity={1}
        >
          {renderContent(true)}
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Tooltip;
