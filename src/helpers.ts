import { Platform, Dimensions, StatusBar } from 'react-native';

export const ScreenWidth: number = Dimensions.get('window').width;
export const ScreenHeight: number = Dimensions.get('window').height;
export const isIOS: boolean = Platform.OS === 'ios';

/**
 * On Android, measureInWindow returns coordinates relative to the window
 * (excluding the status bar), but a transparent Modal renders over the full
 * screen (including the status bar). This offset corrects that mismatch.
 */
export const statusBarOffset: number =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
