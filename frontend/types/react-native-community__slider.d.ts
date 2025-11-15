declare module '@react-native-community/slider' {
  import type { Component } from 'react';
  import type { StyleProp, ViewStyle } from 'react-native';

  export interface SliderProps {
    value?: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    onValueChange?: (value: number) => void;
    onSlidingStart?: (value: number) => void;
    onSlidingComplete?: (value: number) => void;
    disabled?: boolean;
    inverted?: boolean;
    style?: StyleProp<ViewStyle>;
  }

  export default class Slider extends Component<SliderProps> {}
}
