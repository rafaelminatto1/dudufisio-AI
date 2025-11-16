import type { ResponsiveLineProps } from '@nivo/line';
import { ResponsiveLine } from '@nivo/line';
import type { Theme } from '@nivo/core';
import { mergeThemes } from '../theme';

export type NivoLineChartProps<RawDatum extends object> = ResponsiveLineProps<RawDatum> & {
  height?: number;
  themeOverride?: Theme;
};

export function NivoLineChart<RawDatum extends object>({
  height = 300,
  themeOverride,
  margin = { top: 24, right: 24, bottom: 48, left: 60 },
  motionConfig = 'gentle',
  enableSlices = 'x',
  useMesh = true,
  enableGridX = false,
  enableGridY = true,
  ...props
}: NivoLineChartProps<RawDatum>) {
  return (
    <div style={{ height }}>
      <ResponsiveLine<RawDatum>
        {...props}
        margin={margin}
        motionConfig={motionConfig}
        enableSlices={enableSlices}
        useMesh={useMesh}
        enableGridX={enableGridX}
        enableGridY={enableGridY}
        theme={mergeThemes(themeOverride)}
      />
    </div>
  );
}

