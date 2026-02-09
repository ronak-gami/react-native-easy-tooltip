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

export type ActionType = 'press' | 'longPress' | 'none';

export interface TooltipProps {
  /** The element that the tooltip wraps around */
  children: ReactNode;
  /** Content to show inside the tooltip popover */
  popover?: ReactElement;
  /** Whether to show a pointer/arrow on the tooltip */
  withPointer?: boolean;
  /** Height of the tooltip container */
  height?: number | string;
  /** Width of the tooltip container */
  width?: number | string;
  /** Custom styles for the tooltip container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Color of the pointer/arrow */
  pointerColor?: string;
  /** Custom styles for the pointer/arrow */
  pointerStyle?: StyleProp<ViewStyle>;
  /** Callback when the tooltip is closed */
  onClose?: () => void;
  /** Callback when the tooltip is opened */
  onOpen?: () => void;
  /** Whether to show an overlay behind the tooltip */
  withOverlay?: boolean;
  /** Color of the overlay */
  overlayColor?: string;
  /** Background color of the tooltip container */
  backgroundColor?: string;
  /** Highlight color for the wrapped element when tooltip is visible */
  highlightColor?: string;
  /** Props to pass to the TouchableOpacity wrapper */
  toggleWrapperProps?: TouchableOpacityProps;
  /** How to trigger the tooltip: 'press', 'longPress', or 'none' */
  actionType?: ActionType;
  /** Control tooltip visibility externally */
  isVisible?: boolean;
  /** Callback when visibility changes (for controlled mode) */
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
