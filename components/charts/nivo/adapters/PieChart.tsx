import type { ResponsivePieProps } from '@nivo/pie';
import { ResponsivePie } from '@nivo/pie';
import type { Theme } from '@nivo/core';
import { mergeThemes } from '../theme';

export type NivoPieChartProps<RawDatum extends object> = ResponsivePieProps<RawDatum> & {
  height?: number;
  themeOverride?: Theme;
};

export function NivoPieChart<RawDatum extends object>({
  height = 260,
  themeOverride,
  margin = { top: 24, right: 24, bottom: 24, left: 24 },
  innerRadius = 0.6,
  padAngle = 5,
  cornerRadius = 4,
  activeOuterRadiusOffset = 12,
  motionConfig = 'gentle',
  ...props
}: NivoPieChartProps<RawDatum>) {
  return (
    <div style={{ height }}>
      <ResponsivePie<RawDatum>
        {...props}
        margin={margin}
        innerRadius={innerRadius}
        padAngle={padAngle}
        cornerRadius={cornerRadius}
        activeOuterRadiusOffset={activeOuterRadiusOffset}
        motionConfig={motionConfig}
        theme={mergeThemes(themeOverride)}
      />
    </div>
  );
}

