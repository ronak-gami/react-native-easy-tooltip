import { Platform, Dimensions } from 'react-native';

export const ScreenWidth: number = Dimensions.get('screen').width;
export const ScreenHeight: number = Dimensions.get('screen').height;
export const isIOS: boolean = Platform.OS === 'ios';
