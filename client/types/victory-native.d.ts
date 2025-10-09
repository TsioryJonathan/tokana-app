declare module 'victory-native' {
  // Minimal type shims to satisfy TypeScript in React Native/Expo
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface VictoryCommonProps extends ViewProps {
    style?: any;
  }

  export const VictoryChart: React.ComponentType<VictoryCommonProps & { height?: number; padding?: any; containerComponent?: React.ReactNode }>;
  export const VictoryAxis: React.ComponentType<VictoryCommonProps & { dependentAxis?: boolean }>;
  export const VictoryLine: React.ComponentType<VictoryCommonProps & { data?: any[]; interpolation?: string }>;
  export const VictoryTooltip: React.ComponentType<VictoryCommonProps & { constrainToVisibleArea?: boolean }>;
  export const VictoryVoronoiContainer: React.ComponentType<
    VictoryCommonProps & {
      voronoiDimension?: 'x' | 'y' | 'both';
      labels?: (args: any) => string;
      labelComponent?: React.ReactElement<any>;
    }
  >;
}
